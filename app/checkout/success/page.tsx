import { Suspense } from 'react'
import SuccessClient from './SuccessClient'

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={<div className="bg-white font-sans min-h-screen flex items-center justify-center" />}
    >
      <SuccessClient />
    </Suspense>
  )
}

