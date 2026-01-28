import { Suspense } from 'react'
import CancelClient from './CancelClient'

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={<div className="bg-white font-sans min-h-screen flex items-center justify-center" />}
    >
      <CancelClient />
    </Suspense>
  )
}

