import crypto from 'crypto'
import { Invitation } from '@/models/Invitation'
import { User } from '@/models/User'

export interface InvitationData {
  email: string
  name: string
  role: string
  department?: string
  inviterId: string
  inviterName: string
  inviterEmail: string
  organisationId: string
  customMessage?: string
  isNewUser?: boolean
}

export interface InviteLinkData {
  token: string
  email: string
  organisationId: string
}

/**
 * Generate a cryptographically secure invitation token
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Check if user exists and determine if they're a new user for this organization
 */
export async function checkUserStatus(email: string, organisationId: string): Promise<{
  isNewUser: boolean
  userExists: boolean
  isAlreadyMember: boolean
}> {
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  
  if (!existingUser) {
    return { isNewUser: true, userExists: false, isAlreadyMember: false }
  }

  // Check if user is already a member of this organization
  const isAlreadyMember = existingUser.associatedWith?.some(
    (association:any) => association.organisationId.toString() === organisationId && association.isActive
  )

  return { 
    isNewUser: false, 
    userExists: true, 
    isAlreadyMember: isAlreadyMember || false
  }
}

/**
 * Create an invitation with proper validation and user status checking
 */
export async function createInvitation(data: InvitationData) {
  try {
    // Check user status
    const userStatus = await checkUserStatus(data.email, data.organisationId)
    
    if (userStatus.isAlreadyMember) {
      throw new Error('This user is already a member of your organization')
    }

    // Create the invitation
    const invitation = await (Invitation as any).createInvitation({
      ...data,
      email: data.email.toLowerCase(),
      isNewUser: userStatus.isNewUser
    })

    return invitation
  } catch (error) {
    console.error('Error creating invitation:', error)
    throw error
  }
}

/**
 * Validate an invitation token and email
 */
export async function validateInvitation(token: string, email?: string, organisationId?: string) {
  try {
    const invitation = await (Invitation as any).findValidInvitation(token, email)
    
    if (!invitation) {
      return { valid: false, reason: 'Invalid or expired invitation' }
    }

    // If organisationId is provided, ensure it matches
    if (organisationId && invitation.organisationId.toString() !== organisationId) {
      return { valid: false, reason: 'Invalid organization' }
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await invitation.expire()
      return { valid: false, reason: 'Invitation has expired' }
    }

    return { 
      valid: true, 
      invitation: {
        token: invitation.token,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
        department: invitation.department,
        inviterId: invitation.inviterId,
        inviterName: invitation.inviterName,
        inviterEmail: invitation.inviterEmail,
        organisationId: invitation.organisationId,
        isNewUser: invitation.isNewUser,
        customMessage: invitation.customMessage,
        expiresAt: invitation.expiresAt
      }
    }
  } catch (error) {
    console.error('Error validating invitation:', error)
    return { valid: false, reason: 'Validation failed' }
  }
}

/**
 * Accept an invitation and update its status
 */
export async function acceptInvitation(token: string, email: string, userId?: string) {
  try {
    const invitation = await Invitation.findOne({
      token: token,
      email: email.toLowerCase(),
      status: 'pending'
    })

    if (!invitation) {
      throw new Error('Invitation not found or already processed')
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      await invitation.expire()
      throw new Error('Invitation has expired')
    }

    // Accept the invitation
    await invitation.accept()

    // If user exists, add them to the organization
    if (userId) {
      const user = await User.findById(userId)
      if (user) {
        // Add organization association
        user.associatedWith.push({
          organisationId: invitation.organisationId,
          role: invitation.role as 'admin' | 'manager' | 'employee',
          joinedAt: new Date(),
          isActive: true
        })

        // Set as current organization if not set
        if (!user.currentOrganization) {
          user.currentOrganization = invitation.organisationId
        }

        // Update user status to active
        user.status = 'active'
        user.isActive = true

        await user.save()
      }
    }

    return invitation
  } catch (error) {
    console.error('Error accepting invitation:', error)
    throw error
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(token: string, organisationId: string) {
  try {
    const invitation = await Invitation.findOne({
      token: token,
      organisationId: organisationId,
      status: 'pending'
    })

    if (!invitation) {
      throw new Error('Invitation not found or already processed')
    }

    await invitation.revoke()
    return invitation
  } catch (error) {
    console.error('Error revoking invitation:', error)
    throw error
  }
}

/**
 * Get all pending invitations for an organization
 */
export async function getPendingInvitations(organisationId: string) {
  try {
    const invitations = await Invitation.find({
      organisationId: organisationId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 })

    return invitations
  } catch (error) {
    console.error('Error fetching pending invitations:', error)
    throw error
  }
}

/**
 * Clean up expired invitations (run periodically)
 */
export async function cleanupExpiredInvitations() {
  try {
    const result = await Invitation.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        $set: { status: 'expired' }
      }
    )

    console.log(`Cleaned up ${result.modifiedCount} expired invitations`)
    return result.modifiedCount
  } catch (error) {
    console.error('Error cleaning up expired invitations:', error)
    throw error
  }
}

/**
 * Generate invitation link
 */
export function generateInviteLink(token: string, email: string, organisationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/invite?token=${token}&email=${encodeURIComponent(email)}&org=${organisationId}`
}

/**
 * Parse invitation link to extract token, email, and organisationId
 */
export function parseInviteLink(link: string): InviteLinkData | null {
  try {
    const url = new URL(link)
    const token = url.searchParams.get('token')
    const email = url.searchParams.get('email')
    const organisationId = url.searchParams.get('org')

    if (!token || !email || !organisationId) {
      return null
    }

    return { token, email, organisationId }
  } catch (error) {
    console.error('Error parsing invite link:', error)
    return null
  }
}
