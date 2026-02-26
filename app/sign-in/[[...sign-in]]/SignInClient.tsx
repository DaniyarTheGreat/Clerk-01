'use client'

import { SignIn } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

/**
 * Client-only wrapper for Clerk SignIn so useSession runs only in browser
 * under ClerkProvider, avoiding "useSession can only be used within ClerkProvider" during SSR/catchall.
 */
export default function SignInClient() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Security: allow only relative, same-origin URLs to prevent open redirects
  const rawRedirect = searchParams.get('redirect_url')
  const redirectUrl = (() => {
    if (!rawRedirect) return '/'
    try {
      const decoded = decodeURIComponent(rawRedirect)
      // Allow only path-only URLs (must start with / and no protocol/host)
      if (decoded.startsWith('/') && !decoded.startsWith('//') && !/^\/[^/]*:/.test(decoded)) {
        return decoded
      }
      return '/'
    } catch {
      return '/'
    }
  })()

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <SignIn
        fallbackRedirectUrl={redirectUrl}
        signUpUrl="/sign-up"
      />
    </div>
  )
}
