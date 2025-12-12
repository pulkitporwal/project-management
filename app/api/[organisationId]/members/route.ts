import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

export async function GET(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  try {
    await connectDB()
    const { organisationId } = await params
    
    // Check authorization - only admin, manager, and employee can view members
    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"])
    if (!ok) return res
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const role = searchParams.get('role')

    const assocMatch: any = { organisationId, isActive: true }
    if (role && role !== 'all') {
      assocMatch.role = role
    }

    const users = await User.find({
      associatedWith: { $elemMatch: assocMatch },
      ...(status && status !== 'all' ? { status } : {}),
      ...(department && department !== 'all' ? { department } : {})
    })
      .select('-password')
      .sort({ joinedAt: -1 })

    const members = users.map((u: any) => {
      const assoc = u.associatedWith.find((a: any) => a.organisationId.toString() === organisationId && a.isActive)
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: assoc?.role || u.role,
        department: u.department,
        avatar: u.profileImage,
        phone: u.phone,
        location: u.location,
        isActive: assoc?.isActive ?? u.isActive,
        joinedAt: assoc?.joinedAt || u.joinedAt,
        lastActive: u.lastActive,
        skills: u.skills,
        status: u.status
      }
    })

    return NextResponse.json({ success: true, members })

  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  try {
    await connectDB()
    const { organisationId } = await params
    
    // Only admin and manager can add members
    const { ok, session, res } = await allowRoles(["admin", "manager"])
    if (!ok) return res
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    return NextResponse.json({
      error: 'Use invitations endpoint to add members',
      hint: 'POST /api/[organisationId]/invitations'
    }, { status: 405 })

  } catch (error) {
    console.error('Error adding organization member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
