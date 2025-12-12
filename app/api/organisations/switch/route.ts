import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/models';
import connectDB from '@/lib/db';
import { allowRoles } from '@/lib/roleGuardServer';

// POST /api/organisations/switch - Switch current organization
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { ok, res, session } = await allowRoles(["employee", "admin", "manager"]);
    if (!ok) return res;

    if (!session) return NextResponse.json({ error: "Unauthorized" },{ status: 403 })

    const body = await request.json();
    const { organisationId } = body;

    if (!organisationId) {
      return NextResponse.json({
        error: 'Organization ID is required'
      }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has access to this organization
    const userAssociation = user.associatedWith.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive
    );

    if (!userAssociation) {
      return NextResponse.json({ error: 'Access denied to this organization' }, { status: 403 });
    }

    // Update user's current organization
    user.currentOrganization = organisationId;
    await user.save();

    return NextResponse.json({
      message: 'Organization switched successfully',
      currentOrganization: organisationId,
      userRole: userAssociation.role,
      userPermissions: userAssociation.permissions
    });

  } catch (error) {
    console.error('Error switching organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
