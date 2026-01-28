'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLanguage } from '../../../lib/language-context'
import { verifySession } from '../../../lib/api'
import { useCart } from '../../../lib/cart-context'
import Link from 'next/link'

export default function SuccessClient() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<{
    customer_email?: string
    amount_total?: number
    currency?: string
  } | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setError('No session ID provided')
      setIsVerifying(false)
      return
    }

    // Verify the session with backend
    const verifyPayment = async () => {
      try {
        const result = await verifySession(sessionId)

        if (result.valid && result.paid) {
          // Successful purchase: empty the cart.
          clearCart()
          setIsValid(true)
          setSessionData({
            customer_email: result.customer_email,
            amount_total: result.amount_total,
            currency: result.currency,
          })
        } else {
          setError(result.error || 'Payment verification failed')
        }
      } catch (err) {
        console.error('Verification error:', err)
        setError(err instanceof Error ? err.message : 'Failed to verify payment')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams, clearCart])

  // Redirect if session is invalid
  useEffect(() => {
    if (!isVerifying && !isValid && error) {
      // Redirect to cancel page after a short delay
      const timer = setTimeout(() => {
        router.push('/checkout/cancel?error=' + encodeURIComponent(error))
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVerifying, isValid, error, router])

  if (isVerifying) {
    return (
      <div className="bg-white font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.checkout?.verifying || 'Verifying your payment...'}</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="bg-white font-sans min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t.checkout?.verificationFailed || 'Verification Failed'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || t.checkout?.invalidSession || 'Invalid or incomplete payment session.'}
            </p>
            <p className="text-sm text-gray-500">
              {t.checkout?.redirecting || 'Redirecting you back...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white font-sans min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.checkout?.successTitle || 'Payment Successful!'}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {t.checkout?.successMessage ||
              'Thank you for your purchase. Your payment has been processed successfully.'}
          </p>

          {/* Payment Details */}
          {sessionData && (
            <div className="bg-white rounded-lg p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.checkout?.paymentDetails || 'Payment Details'}
              </h3>
              {sessionData.customer_email && (
                <div className="mb-3">
                  <span className="text-sm text-gray-500">{t.checkout?.email || 'Email'}: </span>
                  <span className="text-gray-900 font-medium">{sessionData.customer_email}</span>
                </div>
              )}
              {sessionData.amount_total && (
                <div>
                  <span className="text-sm text-gray-500">{t.checkout?.amount || 'Amount'}: </span>
                  <span className="text-gray-900 font-medium">
                    {sessionData.currency?.toUpperCase() || '$'} {(sessionData.amount_total / 100).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium px-6 py-3 transition cursor-pointer"
            >
              {t.checkout?.backToHome || 'Back to Home'}
            </Link>
            <Link
              href="/pricing"
              className="inline-block bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 rounded-lg font-medium px-6 py-3 transition cursor-pointer"
            >
              {t.checkout?.viewMorePlans || 'View More Plans'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

