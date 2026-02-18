'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../lib/language-context'
import { useUser } from '@clerk/nextjs'
import { getStudentOrders, cancelOrder, StudentOrder } from '../lib/api'
import Link from 'next/link'

export default function Cancel() {
  const { t } = useLanguage()
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<StudentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingIndex, setCancellingIndex] = useState<number | null>(null)
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false)

  const fetchOrders = async () => {
    if (!isLoaded || !user?.emailAddresses?.[0]?.emailAddress) {
      if (!user?.emailAddresses?.[0]?.emailAddress) setError('Email address not found')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getStudentOrders(user.emailAddresses[0].emailAddress)
      setOrders(data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [user, isLoaded])

  /** Normalize to date-only YYYY-MM-DD for API */
  const toDateOnly = (dateString: string | null): string => {
    if (!dateString) return ''
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    return match ? match[0] : dateString
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    // Extract year-month-day from date-only (2026-03-23) or ISO datetime (2026-02-11T01:29:22.728582+00:00)
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) return match[0]
    return dateString
  }

  const formatClassType = (classType: string | null) => {
    if (!classType) return 'N/A'
    const typeMap: Record<string, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    }
    return typeMap[classType] || classType
  }

  const closeCancelSuccessModal = () => {
    setShowCancelSuccessModal(false)
    fetchOrders()
  }

  const handleCancel = async (order: StudentOrder, index: number) => {
    const email = user?.emailAddresses?.[0]?.emailAddress
    if (!email) {
      setError('Email address not found')
      return
    }
    const batchNum = order.batch_num;
    if (batchNum == null) {
      setError('Order batch information is missing; cannot cancel.')
      return
    }
    const startDate = toDateOnly(order.start_date)
    const endDate = toDateOnly(order.end_date)
    if (!startDate || !endDate) {
      setError('Order dates are missing; cannot cancel.')
      return
    }
    try {
      setCancellingIndex(index)
      setError(null)
      await cancelOrder({ batch_num: batchNum, start_date: startDate, end_date: endDate, email })
      setOrders((prev) => prev.filter((_, i) => i !== index))
      setShowCancelSuccessModal(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order')
    } finally {
      setCancellingIndex(null)
    }
  }

  if (!isLoaded) {
    return (
      <div className="font-sans min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-600">{t.cancel.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-sans min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-4 font-amiri">
            {t.cancel.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.cancel.subtitle}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t.cancel.loading}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50/80 backdrop-blur-md border border-red-200/80 rounded-xl p-6 max-w-md mx-auto shadow-lg">
              <p className="text-red-800 font-medium">{t.cancel.error}</p>
              <p className="text-red-600 text-sm mt-2">{error}</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-md border border-emerald-200/80 rounded-xl p-8 max-w-lg mx-auto shadow-lg">
              <p className="text-gray-800 font-medium text-lg mb-2">{t.cancel.noOrders}</p>
              <p className="text-gray-600 mb-6">{t.cancel.noOrdersDescription}</p>
              <Link href="/pricing">
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  {t.cancel.browseCourses}
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {t.cancel.classType}
                      </h3>
                      <p className="text-lg font-medium text-emerald-900">
                        {formatClassType(order.class_type)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {t.cancel.startDate}
                      </h3>
                      <p className="text-lg text-gray-900">
                        {formatDate(order.start_date)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {t.cancel.endDate}
                      </h3>
                      <p className="text-lg text-gray-900">
                        {formatDate(order.end_date)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {t.cancel.createdAt}
                      </h3>
                      <p className="text-lg text-gray-900">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleCancel(order, index)}
                    disabled={cancellingIndex !== null}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    {cancellingIndex === index ? t.cancel.loading : t.cancel.cancelButton}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCancelSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-emerald-200/80">
            <p className="text-gray-800 text-center">
              {t.cancel.cancelSuccessMessage}
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeCancelSuccessModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

