'use client'

import { useSearchParams } from 'next/navigation'
import { useLanguage } from '../../../lib/language-context'
import Link from 'next/link'

export default function CancelClient() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="font-sans min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-8 text-center shadow-xl">
          {/* Cancel Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t.checkout?.cancelTitle || 'Payment Cancelled'}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {t.checkout?.cancelMessage || 'Your payment was cancelled. No charges were made to your account.'}
          </p>

          {error && (
            <p className="text-sm text-amber-800 mb-6 bg-amber-100/90 backdrop-blur-sm rounded-lg p-3 border border-amber-200/80">
              {error}
            </p>
          )}

          <p className="text-gray-500 mb-6">
            {t.checkout?.cancelDescription ||
              'If you encountered any issues during checkout, please try again or contact our support team.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium px-6 py-3 transition cursor-pointer"
            >
              {t.checkout?.backToCart || 'Back to Cart'}
            </Link>
            <Link
              href="/pricing"
              className="inline-block bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 rounded-lg font-medium px-6 py-3 transition cursor-pointer"
            >
              {t.checkout?.viewPlans || 'View Plans'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

