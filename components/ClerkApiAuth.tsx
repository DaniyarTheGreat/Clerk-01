'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthTokenGetter } from '../lib/api'

/**
 * Registers Clerk's getToken with the API client so every request
 * can send Authorization: Bearer <token> to the backend.
 * Uses the session JWT from getToken() – backend verifies with CLERK_SECRET_KEY.
 * Must be rendered inside ClerkProvider.
 */
export default function ClerkApiAuth() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(async () => {
      const token = await getToken()
      return token ?? null
    })
  }, [getToken])

  return null
}
