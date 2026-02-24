import { Suspense } from 'react'
import SignInClient from './SignInClient'

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SignInClient />
    </Suspense>
  )
}
