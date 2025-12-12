import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ organisationId: string; memberId: string }> }
) {
  try {
    await connectDB()
    const { organisationId, memberId } = await params
    
    // Only admin and manager can delete members
    const { ok, session, res } = await allowRoles(["admin", "manager"])
    if (!ok) return res
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Find and update member to inactive instead of deleting
    const member = await User.findOne({ _id: memberId, organisationId })
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    // Soft delete by setting inactive
    member.isActive = false
    await member.save()

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Error removing organization member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
