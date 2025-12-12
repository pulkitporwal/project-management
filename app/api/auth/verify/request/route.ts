import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { sendOtpEmail } from '@/lib/email'
import { hash } from 'bcryptjs'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 })
    }

    const now = Date.now()
    const lastSentAt = user.emailVerification?.lastSentAt?.getTime() || 0
    if (now - lastSentAt < 60_000) {
      return NextResponse.json({ error: 'Please wait before requesting another code' }, { status: 429 })
    }

    const code = crypto.randomInt(100000, 999999).toString()
    const otpHash = await hash(code, 10)

    user.emailVerification = {
      otpHash,
      expiresAt: new Date(now + 10 * 60 * 1000),
      attempts: 0,
      lastSentAt: new Date(now)
    }

    await user.save()

    await sendOtpEmail(user.email, user.name, code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

