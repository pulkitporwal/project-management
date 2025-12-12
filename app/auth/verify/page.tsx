"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

function VerifyEmailPageInner() {
  const router = useRouter()
  const search = useSearchParams()
  const initialEmail = search.get("email") || ""
  const next = search.get("next") || "/auth/signin"
  const auto = search.get("auto") === "1"

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (auto && initialEmail) {
      ; (async () => {
        try {
          setSending(true)
          setError("")
          const res = await fetch("/api/auth/verify/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: initialEmail })
          })
          const json = await res.json()
          if (!res.ok) {
            setError(json.error || "Failed to send code")
          }
        } catch (_) {
          setError("Failed to send code")
        } finally {
          setSending(false)
        }
      })()
    }
  }, [auto, initialEmail])

  const disableEmail = useMemo(() => !!initialEmail, [initialEmail])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verify Email</CardTitle>
          <CardDescription className="text-center">Enter the 6-digit code sent to your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">{success}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disableEmail || loading || sending}
            />
          </div>

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(val) => setCode(val.replace(/\D/g, ""))}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={sending || !email}
              onClick={async () => {
                try {
                  setSending(true)
                  setError("")
                  setSuccess("")
                  const res = await fetch("/api/auth/verify/request", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                  })
                  const json = await res.json()
                  if (res.ok && json.success) {
                    setSuccess("Verification code sent")
                  } else {
                    setError(json.error || "Failed to send code")
                  }
                } catch (_) {
                  setError("Failed to send code")
                } finally {
                  setSending(false)
                }
              }}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
            <Button
              type="button"
              disabled={loading || !email || code.length !== 6}
              onClick={async () => {
                try {
                  setLoading(true)
                  setError("")
                  setSuccess("")
                  const res = await fetch("/api/auth/verify/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code })
                  })
                  const json = await res.json()
                  if (res.ok && json.success) {
                    setSuccess("Email verified")
                    setTimeout(() => {
                      router.push(next)
                      router.refresh()
                    }, 500)
                  } else {
                    setError(json.error || "Invalid code")
                  }
                } catch (_) {
                  setError("Verification failed")
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">Back to sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}


export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}