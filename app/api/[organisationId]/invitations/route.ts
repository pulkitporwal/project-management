import { NextRequest, NextResponse } from 'next/server'
import { createInvitation, getPendingInvitations, revokeInvitation, generateInviteLink } from '@/lib/invitations'
import { sendInviteEmail } from '@/lib/email'
import { User } from '@/models/User'
import { Organization } from '@/models/Organization'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  try {
    await connectDB()
    const { organisationId } = await params

    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if user has permission to view invitations
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = user.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive
    )

    if (!userOrgAssociation) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Only admins and managers can view invitations
    if (!['admin', 'manager'].includes(userOrgAssociation.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get pending invitations
    const invitations = await getPendingInvitations(organisationId)

    return NextResponse.json({
      success: true,
      invitations
    })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  try {
    await connectDB()
    const { organisationId } = await params

    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json()
    const { email, name, role, department, customMessage } = body

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      )
    }

    if (role !== 'employee') {
      return NextResponse.json(
        { error: 'Only employee invitations are allowed' },
        { status: 400 }
      )
    }

    // Check if user has permission to invite
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = user.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive
    )

    if (!userOrgAssociation) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Only admins and managers can invite members
    if (!['admin', 'manager'].includes(userOrgAssociation.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create invitation
    const invitation = await createInvitation({
      email,
      name,
      role,
      department,
      inviterId: session.user.id,
      inviterName: user.name,
      inviterEmail: user.email,
      organisationId,
      customMessage
    })

    // Get organization details for email
    const organization = await Organization.findById(organisationId)
    const organisationName = organization?.name || 'Project Management'

    // Generate invite link
    const inviteLink = generateInviteLink(invitation.token, email, organisationId)

    // Send invitation email
    const emailResult = await sendInviteEmail({
      inviterName: user.name,
      inviterEmail: user.email,
      inviteeName: name,
      inviteeEmail: email,
      role,
      department,
      inviteLink,
      customMessage,
      isNewUser: invitation.isNewUser,
      organisationName
    })

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error)
      // Don't fail the whole request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: invitation.status,
        isNewUser: invitation.isNewUser,
        expiresAt: invitation.expiresAt,
        token: invitation.token
      }
    })

  } catch (error) {
    console.error('Error creating invitation:', error)

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
      if (error.message.includes('already a member')) {
        return NextResponse.json({ error: error.message }, { status: 409 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string }> }
) {
  try {
    await connectDB()
    const { organisationId } = await params

    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Check if user has permission to revoke invitations
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = user.associatedWith?.find(
      (assoc:any) => assoc.organisationId.toString() === organisationId && assoc.isActive
    )

    if (!userOrgAssociation) {
      return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 })
    }

    // Only admins and managers can revoke invitations
    if (!['admin', 'manager'].includes(userOrgAssociation.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Revoke invitation
    const invitation = await revokeInvitation(token, organisationId)

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully',
      invitation
    })

  } catch (error) {
    console.error('Error revoking invitation:', error)

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 404 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

