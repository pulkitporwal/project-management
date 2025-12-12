import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

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
    const { userId, reason, duration } = body

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and reason are required' },
        { status: 400 }
      )
    }

    // Check if the current user has permission to ban (must be admin)
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = currentUser.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive && !assoc.banned
    )

    if (!userOrgAssociation || userOrgAssociation.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can ban users' }, { status: 403 })
    }

    // Cannot ban yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 })
    }

    // Get the user to be banned
    const userToBan = await User.findById(userId)
    if (!userToBan) {
      return NextResponse.json({ error: 'User to ban not found' }, { status: 404 })
    }

    // Check if user is a member of this organization
    const targetUserAssociation = userToBan.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId
    )

    if (!targetUserAssociation) {
      return NextResponse.json({ error: 'User is not a member of this organization' }, { status: 404 })
    }

    // Cannot ban users with equal or higher role (except admins can ban anyone)
    if (userOrgAssociation.role !== 'admin') {
      const roleHierarchy:any = { admin: 3, manager: 2, employee: 1 }
      if (roleHierarchy[targetUserAssociation.role] >= roleHierarchy[userOrgAssociation.role]) {
        return NextResponse.json({ error: 'Cannot ban users with equal or higher role' }, { status: 403 })
      }
    }

    // Calculate ban expiration
    let expiresAt: Date | undefined
    if (duration && duration !== 'lifetime') {
      const durationMap = {
        '1hour': 1 * 60 * 60 * 1000,
        '24hours': 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000
      }

      if (durationMap[duration as keyof typeof durationMap]) {
        expiresAt = new Date(Date.now() + durationMap[duration as keyof typeof durationMap])
      }
    }

    // Ban the user
    await userToBan.banFromOrganization(
      organisationId,
      session.user.id,
      reason,
      expiresAt
    )

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
      banDetails: {
        userId: userToBan._id,
        userName: userToBan.name,
        reason,
        bannedAt: new Date(),
        expiresAt,
        duration: duration || 'lifetime'
      }
    })

  } catch (error) {
    console.error('Error banning user:', error)
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
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if the current user has permission to unban (must be admin)
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = currentUser.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive && !assoc.banned
    )

    if (!userOrgAssociation || userOrgAssociation.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can unban users' }, { status: 403 })
    }

    // Get the user to be unbanned
    const userToUnban = await User.findById(userId)
    if (!userToUnban) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Unban the user
    await userToUnban.unbanFromOrganization(organisationId)

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
      userDetails: {
        userId: userToUnban._id,
        userName: userToUnban.name
      }
    })

  } catch (error) {
    console.error('Error unbanning user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check if the current user has permission to view banned users (must be admin or manager)
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userOrgAssociation = currentUser.associatedWith?.find(
      (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.isActive && !assoc.banned
    )

    if (!userOrgAssociation || !['admin', 'manager'].includes(userOrgAssociation.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get banned users
    const bannedUsers = await (User as any).getBannedUsers(organisationId)

    // Format the response
    const formattedBannedUsers = bannedUsers.map((user:any) => {
      const association = user.associatedWith?.find(
        (assoc: any) => assoc.organisationId.toString() === organisationId && assoc.banned
      )

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: association?.role,
        department: user.department,
        bannedAt: association?.bannedAt,
        bannedBy: association?.bannedBy,
        banReason: association?.banReason,
        banExpiresAt: association?.banExpiresAt,
        isExpired: association?.banExpiresAt ? new Date() > association.banExpiresAt : false
      }
    })

    return NextResponse.json({
      success: true,
      bannedUsers: formattedBannedUsers
    })

  } catch (error) {
    console.error('Error fetching banned users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
