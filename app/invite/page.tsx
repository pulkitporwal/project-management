"use client"
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Mail, CheckCircle, AlertCircle, UserPlus, ArrowRight, Clock, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface InvitationData {
  name: string
  email: string
  role: string
  department?: string
  inviterName: string
  inviterEmail: string
  organisationId: string
  isNewUser: boolean
  customMessage?: string
  expiresAt: string
}

function InvitePageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const org = searchParams.get('org')

  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid invitation link. Missing required parameters.')
      setLoading(false)
      return
    }

    validateInvitation()
  }, [token, email, org])

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/${org}/invitations/accept?token=${token}&email=${email}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Invalid invitation')
      }

      setInvitation(result.invitation)
      setIsAuthenticated(result.isAuthenticated)
      setCurrentUser(result.currentUser)
    } catch (error) {
      console.error('Error validating invitation:', error)
      setError(error instanceof Error ? error.message : 'Failed to validate invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    setAccepting(true)
    try {
      const response = await fetch(`/api/${org}/invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          userId: currentUser?.id,
          isNewUser: invitation.isNewUser
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept invitation')
      }

      toast.success('Invitation accepted successfully!')
      
      // Redirect to organization dashboard
      setTimeout(() => {
        router.push(`/${invitation.organisationId}/dashboard`)
      }, 2000)
    } catch (error) {
      console.error('Error accepting invitation:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'manager': return 'Manager'
      case 'employee': return 'Employee'
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth/signin">
              <Button variant="outline">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <CardTitle>Invitation Not Found</CardTitle>
            <CardDescription>The invitation could not be found or has been processed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">You're Invited!</CardTitle>
            <CardDescription>
              {invitation.inviterName} has invited you to join their organization
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Invitation Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Invited by:</span>
                  <span className="font-medium">{invitation.inviterName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Email:</span>
                  <span className="font-medium">{invitation.inviterEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Your role:</span>
                  <Badge className={getRoleColor(invitation.role)}>
                    {getRoleLabel(invitation.role)}
                  </Badge>
                </div>
                {invitation.department && (
                  <div className="flex justify-between">
                    <span className="text-blue-700">Department:</span>
                    <span className="font-medium">{invitation.department}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Expires in:</span>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {new Date(invitation.expiresAt).toLocaleDateString()} at {new Date(invitation.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Message */}
            {invitation.customMessage && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Message</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{invitation.customMessage}</p>
              </div>
            )}

            <Separator />

            {/* User Status and Actions */}
            <div className="text-center space-y-4">
              {invitation.isNewUser ? (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <UserPlus className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-600 font-medium">New User Registration Required</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    You need to create an account before accepting this invitation.
                  </p>
                  <div className="space-y-2">
                    <Link href={`/auth/signup?token=${token}&email=${email}&org=${org}`}>
                      <Button className="w-full">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create Account & Accept Invitation
                      </Button>
                    </Link>
                    <p className="text-xs text-gray-500">
                      After creating your account, you'll be automatically added to the organization.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {isAuthenticated && currentUser?.email === email ? (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 font-medium">Ready to Accept Invitation</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        You're signed in as {currentUser.name}. Click below to accept the invitation.
                      </p>
                      <Button 
                        onClick={handleAcceptInvitation}
                        disabled={accepting}
                        className="w-full"
                      >
                        {accepting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Invitation
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        <span className="text-blue-600 font-medium">Existing User Sign In Required</span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        You already have an account. Please sign in to accept this invitation.
                      </p>
                      <Link href={`/auth/signin?token=${token}&email=${email}&org=${org}`}>
                        <Button className="w-full">
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Sign In to Accept Invitation
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Security Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If you weren't expecting this invitation, please ignore this email. Your account security is important to us.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function InvitePage(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitePageInner />
    </Suspense>
  )
}