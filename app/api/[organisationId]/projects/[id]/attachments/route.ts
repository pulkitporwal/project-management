import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { Attachment } from "@/models/Attachment";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

// Helper function to determine file type
const getFileType = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
};

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user has access to the project
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (session.user.role === "employee") {
    const canView = project.members.map(String).includes(session.user.id) ||
      project.createdBy.toString() === session.user.id ||
      project.visibility === "public";
    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const attachments = await Attachment.find({ projectId: id })
    .populate('uploadedBy', 'name email avatar')
    .sort({ createdAt: -1 });

  return NextResponse.json(attachments);
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if project exists and user has access
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (session.user.role === "employee") {
    const canUpload = project.members.map(String).includes(session.user.id) ||
      project.createdBy.toString() === session.user.id;
    if (!canUpload) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // TODO: Implement file upload logic
    // 1. Upload file to storage (S3, local, etc.)
    // 2. Create attachment record in database
    // 3. Return attachment data

    // For now, create attachment record without actual file upload
    const attachment = new Attachment({
      fileName: file.name,
      originalName: file.name,
      url: `/files/${file.name}`, // This would be the actual file URL
      type: getFileType(file.type),
      mimeType: file.type,
      size: file.size,
      uploadedBy: session.user.id,
      projectId: id,
      description: description || '',
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : []
    });

    await attachment.save();

    // Log the action
    await AuditLog.create({
      userId: session.user.id,
      action: "upload",
      module: "attachments",
      entityId: attachment._id,
      details: `Uploaded file: ${file.name}`,
      ipAddress: request.headers.get("x-forwarded-for") || "localhost",
      userAgent: request.headers.get("user-agent") || "",
      success: true,
      organisationId: organisationId,
      timestamp: new Date(),
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
