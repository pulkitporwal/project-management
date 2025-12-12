import crypto from 'crypto'

// Generate a 6-digit OTP
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// Generate OTP expiry time (15 minutes from now)
export function generateOTPExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
}

// Check if OTP has expired
export function isOTPExpired(expiryTime: Date): boolean {
  return new Date() > expiryTime
}

// Hash OTP for storage (optional security measure)
export function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

// Verify OTP against hashed version
export function verifyOTP(otp: string, hashedOTP: string): boolean {
  const hashedInput = hashOTP(otp)
  return hashedInput === hashedOTP
}

export interface OTPData {
  otp: string
  hashedOTP: string
  expiry: Date
  attempts: number
  isUsed: boolean
}

// Store OTP data (in production, use Redis or database)
const otpStore = new Map<string, OTPData>()

export function storeOTP(email: string, otpData: OTPData): void {
  otpStore.set(email, otpData)
}

export function getOTPData(email: string): OTPData | undefined {
  return otpStore.get(email)
}

export function deleteOTP(email: string): void {
  otpStore.delete(email)
}

// Clean up expired OTPs (run periodically)
export function cleanupExpiredOTPs(): void {
  for (const [email, otpData] of otpStore.entries()) {
    if (isOTPExpired(otpData.expiry)) {
      otpStore.delete(email)
    }
  }
}
