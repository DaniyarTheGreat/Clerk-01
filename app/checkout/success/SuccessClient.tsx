'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useLanguage } from '../../../lib/language-context'
import { verifySession, updatePurchase, registerStudent } from '../../../lib/api'
import { useCart } from '../../../lib/cart-context'
import Link from 'next/link'

export default function SuccessClient() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { clearCart, cart } = useCart()
  
  // Get user email and full name from Clerk
  const userEmail = user?.emailAddresses[0]?.emailAddress
  const userFullName = user?.fullName
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionData, setSessionData] = useState<{
    customer_email?: string
    amount_total?: number
    currency?: string
  } | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      setError('No session ID provided')
      setIsVerifying(false)
      return
    }

    // Wait for user to be loaded before proceeding
    if (!isUserLoaded) {
      return
    }

    // Prevent re-execution when deps change (e.g. clearCart gets new reference after cart update)
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    // Verify the session with backend
    const verifyPayment = async () => {
      try {
        const result = await verifySession(sessionId)

        if (result.valid && result.paid) {
          // Update purchase record in database (PENDING -> SUCCESS)
          await updatePurchase(sessionId)
          
          // Get user info from Clerk (preferred) or fallback to result data
          const studentEmail = userEmail ?? result.email ?? result.customer_email ?? ''
          const studentFullName = userFullName ?? result.full_name ?? ''
          
          if (!studentEmail) {
            throw new Error('User email is missing. Please ensure you are signed in.')
          }
          
          if (!studentFullName) {
            throw new Error('User full name is missing. Please ensure your profile is complete.')
          }
          
          // Register the student for each batch in the cart
          const itemsToRegister = cart.length > 0 ? cart : [{ batch_number: result.batch_number, start_date: undefined, end_date: undefined }]
          for (const cartItem of itemsToRegister) {
            const batchNumber = cartItem.batch_number ?? result.batch_number ?? ''
            if (batchNumber === '') continue
            const registerStudentResult = await registerStudent({
              batch_number: batchNumber,
              full_name: studentFullName,
              email: studentEmail,
              start_date: cartItem.start_date,
              end_date: cartItem.end_date,
            })
            console.log('Register student result for batch', batchNumber, ':', registerStudentResult)
          }
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
  }, [searchParams, clearCart, isUserLoaded, userEmail, userFullName, cart])

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
      <div className="font-sans min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/70 backdrop-blur-md rounded-xl border border-white/30 shadow-xl px-8 py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.checkout?.verifying || 'Verifying your payment...'}</p>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="font-sans min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="bg-red-50/80 backdrop-blur-md border border-red-200/80 rounded-xl p-6 shadow-xl">
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
    <div className="font-sans min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-8 text-center shadow-xl">
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
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 mb-6 text-left border border-white/50">
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

