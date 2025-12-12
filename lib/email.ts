import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import InviteEmail from '@/emails/invite-email'

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export interface InviteEmailData {
  inviterName: string
  inviterEmail: string
  inviteeName: string
  inviteeEmail: string
  role: string
  department?: string
  inviteLink: string
  customMessage?: string
  isNewUser?: boolean
  organisationName: string
}

export async function sendInviteEmail(data: InviteEmailData) {
  try {
    // Generate the email HTML using React Email
    const emailHtml = await render(
      InviteEmail({
        inviterName: data.inviterName,
        inviterEmail: data.inviterEmail,
        inviteeName: data.inviteeName,
        inviteeEmail: data.inviteeEmail,
        role: data.role,
        department: data.department,
        inviteLink: data.inviteLink,
        customMessage: data.customMessage,
        isNewUser: data.isNewUser,
        organisationName: data.organisationName
      })
    )

    const mailOptions = {
      from: `${data.inviterName} <${process.env.GMAIL_USER}>`,
      to: data.inviteeEmail,
      subject: `You're invited to join ${data.organisationName} on Project Management`,
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Invite sent successfully' }
  } catch (error) {
    console.error('Error sending invite email:', error)
    return { success: false, message: 'Failed to send invite', error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to Project Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Project Management System!</h2>
          <p>Hi ${name},</p>
          <p>Welcome aboard! We're excited to have you join our team.</p>
          <p>You can now start using the platform to manage projects, collaborate with your team, and track progress.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>Best regards,<br>The Project Management Team</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return { success: true, message: 'Welcome email sent successfully' }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, message: 'Failed to send welcome email', error }
  }
}

export async function sendOtpEmail(to: string, name: string, code: string) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'Your verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Use the following code to verify your email:</p>
          <div style="margin: 20px 0;">
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 6px;">${code}</div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return { success: false, error }
  }
}

export async function testEmailConnection() {
  try {
    await transporter.verify()
    return { success: true, message: 'Email connection verified' }
  } catch (error) {
    console.error('Email connection test failed:', error)
    return { success: false, message: 'Email connection failed', error }
  }
}
