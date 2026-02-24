'use client'

import { useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { setAuthTokenGetter } from '../lib/api'

/**
 * Registers Clerk's getToken with the API client so every request
 * can send Authorization: Bearer <token> to the backend.
 * Must be rendered inside ClerkProvider.
 */
export default function ClerkApiAuth() {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(() => getToken())
  }, [getToken])

  return null
}
