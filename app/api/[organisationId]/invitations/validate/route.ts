import { NextRequest, NextResponse } from 'next/server'
import { validateInvitation } from '@/lib/invitations'
import connectDB from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const email = url.searchParams.get('email')
    const organisationId = url.searchParams.get('org')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Validate the invitation
    const result = await validateInvitation(token, email || undefined, organisationId || undefined)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.reason },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invitation: result.invitation
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
