import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

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
    const project = await Project.findOne({ _id: id, organisationId }).populate('members', 'name email role department jobTitle avatar joinedAt lastActive');
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (session.user.role === "employee") {
        const canView = project.members.map(String).includes(session.user.id) ||
            project.createdBy.toString() === session.user.id ||
            project.visibility === "public";
        if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get team members with additional details
    const teamMembers = await User.find({
        _id: { $in: project.members }
    }).select('name email role department jobTitle avatar joinedAt lastActive isActive');

    // Get teams assigned to this project
    const teams = await Project.findOne({ _id: id, organisationId }).populate('assignedTeams');

    return NextResponse.json({
        members: teamMembers,
        teams: teams?.assignedTeams || [],
        projectDetails: {
            createdBy: project.createdBy,
            memberCount: project.members.length,
            teamCount: project.assignedTeams.length
        }
    });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
    await connectDB();
    const { id, organisationId } = await params;
    const { ok, session, res } = await allowRoles(["admin", "manager"]);

    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if project exists
    const project = await Project.findOne({ _id: id, organisationId });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const body = await request.json();
    const { userIds, teamIds } = body;

    try {
        // Add individual members
        if (userIds && Array.isArray(userIds)) {
            // Verify users exist
            const users = await User.find({ _id: { $in: userIds } });
            if (users.length !== userIds.length) {
                return NextResponse.json({ error: "One or more users not found" }, { status: 404 });
            }

            // Add members to project (avoid duplicates)
            const newMembers = userIds.filter((userId: string) =>
                !project.members.includes(userId as any)
            );

            if (newMembers.length > 0) {
                project.members.push(...newMembers);
                await project.save();

                // Log the action
                await AuditLog.create({
                    userId: session.user.id,
                    action: "add_members",
                    module: "projects",
                    entityId: project._id,
                    details: `Added ${newMembers.length} members to project`,
                    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
                    userAgent: request.headers.get("user-agent") || "",
                    success: true,
                    organisationId: organisationId,
                    timestamp: new Date(),
                });
            }
        }

        // Add teams
        if (teamIds && Array.isArray(teamIds)) {
            // TODO: Verify teams exist when Team model is created
            const newTeams = teamIds.filter((teamId: string) =>
                !project.assignedTeams.includes(teamId as any)
            );

            if (newTeams.length > 0) {
                project.assignedTeams.push(...newTeams);
                await project.save();

                // Log the action
                await AuditLog.create({
                    userId: session.user.id,
                    action: "add_teams",
                    module: "projects",
                    entityId: project._id,
                    details: `Added ${newTeams.length} teams to project`,
                    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
                    userAgent: request.headers.get("user-agent") || "",
                    success: true,
                    organisationId: organisationId,
                    timestamp: new Date(),
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Members/teams added successfully",
            project: await Project.findOne({ _id: id, organisationId }).populate('members assignedTeams')
        });
    } catch (error) {
        console.error('Error adding members/teams:', error);
        return NextResponse.json({ error: "Failed to add members/teams" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
    await connectDB();
    const { id, organisationId } = await params;
    const { ok, session, res } = await allowRoles(["admin", "manager"]);

    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if project exists
    const project = await Project.findOne({ _id: id, organisationId });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');

    try {
        if (userId) {
            // Remove member
            project.members = project.members.filter((member: any) => member.toString() !== userId);
            await project.save();

            // Log the action
            await AuditLog.create({
                userId: session.user.id,
                action: "remove_member",
                module: "projects",
                entityId: project._id,
                details: `Removed member from project`,
                ipAddress: request.headers.get("x-forwarded-for") || "localhost",
                userAgent: request.headers.get("user-agent") || "",
                success: true,
                organisationId: organisationId,
                timestamp: new Date(),
            });

            return NextResponse.json({ success: true, message: "Member removed successfully" });
        }

        if (teamId) {
            // Remove team
            project.assignedTeams = project.assignedTeams.filter((team: any) => team.toString() !== teamId);
            await project.save();

            // Log the action
            await AuditLog.create({
                userId: session.user.id,
                action: "remove_team",
                module: "projects",
                entityId: project._id,
                details: `Removed team from project`,
                ipAddress: request.headers.get("x-forwarded-for") || "localhost",
                userAgent: request.headers.get("user-agent") || "",
                success: true,
                organisationId: organisationId,
                timestamp: new Date(),
            });

            return NextResponse.json({ success: true, message: "Team removed successfully" });
        }

        return NextResponse.json({ error: "No userId or teamId provided" }, { status: 400 });
    } catch (error) {
        console.error('Error removing member/team:', error);
        return NextResponse.json({ error: "Failed to remove member/team" }, { status: 500 });
    }
}
