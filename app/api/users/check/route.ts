import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/models/User'
import connectDB from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    // Check if user exists globally
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    
    return NextResponse.json({
      exists: !!user,
      user: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: !!user.emailVerified
      } : null
    })

  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
