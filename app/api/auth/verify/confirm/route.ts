import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'
import { compare } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 200 })
    }

    const verification = user.emailVerification || {}
    if (!verification.otpHash || !verification.expiresAt) {
      return NextResponse.json({ error: 'No active verification code' }, { status: 400 })
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
    }

    const attempts = verification.attempts || 0
    if (attempts >= 5) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }

    const normalized = String(code).replace(/\D/g, '').trim()
    if (normalized.length !== 6) {
      user.emailVerification = {
        ...verification,
        attempts: attempts + 1
      }
      await user.save()
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    const ok = await compare(normalized, verification.otpHash)
    if (!ok) {
      user.emailVerification = {
        ...verification,
        attempts: attempts + 1
      }
      await user.save()
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    user.emailVerified = true
    user.emailVerification = undefined as any
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('OTP confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
