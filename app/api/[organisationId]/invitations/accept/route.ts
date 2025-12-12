import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import { validateInvitation, acceptInvitation } from '@/lib/invitations'
import { sendWelcomeEmail } from '@/lib/email'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { token, email, userId, isNewUser } = body

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      )
    }

    // Validate the invitation
    const validation = await validateInvitation(token, email)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      )
    }

    const invitation = validation.invitation

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 400 }
      )
    }

    // Accept the invitation and add user to organization
    await acceptInvitation(token, email, userId)

    // If it's a new user and they just created an account, send welcome email
    if (isNewUser && userId) {
      const user = await User.findById(userId)
      if (user) {
        await sendWelcomeEmail(email, user.name)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      invitation: {
        organisationId: invitation.organisationId,
        role: invitation.role,
        isNewUser: invitation.isNewUser
      }
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const email = url.searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 })
    }

    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
    if (!ok) return res;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate the invitation
    const validation = await validateInvitation(token, email)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      )
    }

    const invitation = validation.invitation

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 400 }
      )
    }

    // Check if user exists (for registered users)
    let userExists = false
    let currentUser = null

    if (session?.user?.email === email) {
      currentUser = await User.findById(session.user.id)
      userExists = !!currentUser
    } else {
      const existingUser = await User.findOne({ email })
      userExists = !!existingUser
    }

    return NextResponse.json({
      success: true,
      invitation: {
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        inviterName: invitation.inviterName,
        inviterEmail: invitation.inviterEmail,
        organisationId: invitation.organisationId,
        isNewUser: !userExists,
        customMessage: invitation.customMessage,
        expiresAt: invitation.expiresAt
      },
      isAuthenticated: !!session,
      currentUser: currentUser ? {
        id: currentUser._id,
        name: currentUser.name,
        email: currentUser.email
      } : null
    })

  } catch (error) {
    console.error('Error checking invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

