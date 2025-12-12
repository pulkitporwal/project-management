import React from 'react'
// import { Html } from '@react-email/components'
import { parseInviteLink } from '@/lib/invitations'

interface InviteEmailProps {
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

export default function InviteEmail({
  inviterName,
  inviterEmail,
  inviteeName,
  role,
  department,
  inviteLink,
  customMessage,
  isNewUser = false,
  organisationName
}: InviteEmailProps) {
  const parsed = parseInviteLink(inviteLink)
  const origin = (() => { try { return new URL(inviteLink).origin } catch { return '' } })()
  const signupLink = parsed && origin ? `${origin}/auth/signup?token=${parsed.token}&email=${encodeURIComponent(parsed.email)}&org=${parsed.organisationId}` : inviteLink
  const signinLink = parsed && origin ? `${origin}/auth/signin?token=${parsed.token}&email=${encodeURIComponent(parsed.email)}&org=${parsed.organisationId}` : inviteLink
  return (
    <html>
      <head>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
              line-height: 1.6;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 32px;
              text-align: center;
            }
            .content {
              padding: 32px;
            }
            .details-box {
              background-color: #eff6ff;
              border-left: 4px solid #2563eb;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            .btn-primary {
              background-color: #2563eb;
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
            }
            .btn-primary:hover {
              background-color: #1d4ed8;
            }
            .btn-secondary {
              background-color: #f3f4f6;
              color: #1f2937;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 8px;
              display: inline-block;
              font-weight: 600;
              font-size: 14px;
              margin-top: 8px;
              border: 1px solid #e5e7eb;
            }
            .btn-secondary:hover {
              background-color: #e5e7eb;
            }
            .footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 14px;
            }
            .detail-label {
              color: #6b7280;
              font-weight: 500;
            }
            .detail-value {
              font-weight: 600;
              color: #1f2937;
            }
            .custom-message {
              background-color: #f3f4f6;
              padding: 20px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .security-notice {
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              padding: 16px;
              margin: 20px 0;
              border-radius: 8px;
            }
            .expiry-notice {
              color: #6b7280;
              font-size: 12px;
              text-align: center;
              margin-top: 16px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
              🎯 {organisationName}
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
              Project Management System
            </p>
          </div>

          {/* Content */}
          <div className="content">
            <h2 style={{ color: '#1f2937', fontSize: '24px', marginBottom: '16px' }}>
              🎉 You're Invited to Join {organisationName}!
            </h2>
            
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '24px' }}>
              <strong>{inviterName}</strong> has invited you to join their team on the Project Management platform.
            </p>

            {/* Invitation Details */}
            <div className="details-box">
              <h3 style={{ color: '#1e40af', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                📋 Invitation Details
              </h3>
              <div>
                <div className="detail-row">
                  <span className="detail-label">👤 Invited by:</span>
                  <span className="detail-value">{inviterName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📧 Email:</span>
                  <span className="detail-value">{inviterEmail}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">👔 Your role:</span>
                  <span className="detail-value" style={{ textTransform: 'capitalize' }}>{role}</span>
                </div>
                {department && (
                  <div className="detail-row">
                    <span className="detail-label">🏢 Department:</span>
                    <span className="detail-value">{department}</span>
                  </div>
                )}
                <div className="detail-row" style={{ marginBottom: 0 }}>
                  <span className="detail-label">📱 Account Status:</span>
                  <span className="detail-value" style={{ 
                    color: isNewUser ? '#f59e0b' : '#10b981' 
                  }}>
                    {isNewUser ? '🆕 New User - Registration Required' : '✅ Existing User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            {customMessage && (
              <div className="custom-message">
                <h3 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  💬 Message from {inviterName}
                </h3>
                <p style={{ color: '#4b5563', fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {customMessage}
                </p>
              </div>
            )}

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              {isNewUser ? (
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                    📝 Since you're new to our platform, you'll need to create an account first
                  </p>
                  <a href={signupLink} className="btn-primary">
                    🚀 Create Account & Accept Invitation
                  </a>
                  <div style={{ marginTop: '12px' }}>
                    <a href={inviteLink} className="btn-secondary">
                      View Invitation Details
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
                    👋 Welcome back! Choose how to proceed
                  </p>
                  <a href={inviteLink} className="btn-primary">
                    ✅ Accept Invitation
                  </a>
                  <div style={{ marginTop: '12px' }}>
                    <a href={signinLink} className="btn-secondary">
                      Sign In to Accept
                    </a>
                  </div>
                </div>
              )}
              <div className="expiry-notice">
                ⏰ This invitation will expire in 24 hours
              </div>
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <p style={{ color: '#991b1b', fontSize: '14px', margin: 0, fontWeight: '600' }}>
                🔒 Security Notice
              </p>
              <p style={{ color: '#991b1b', fontSize: '13px', margin: '8px 0 0 0' }}>
                If you weren't expecting this invitation, please ignore this email. Your account security is important to us.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="footer">
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
              Need help? Contact us at{' '}
              <a href={`mailto:${inviterEmail}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                {inviterEmail}
              </a>
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
              © 2024 {organisationName}. All rights reserved.
            </p>
            <div style={{ marginTop: '16px' }}>
              <p style={{ color: '#9ca3af', fontSize: '11px', margin: 0 }}>
                🏢 Project Management System
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
