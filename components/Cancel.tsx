'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../lib/language-context'
import { useUser } from '@clerk/nextjs'
import { getStudentOrders, StudentOrder } from '../lib/api'
import Link from 'next/link'

export default function Cancel() {
  const { t } = useLanguage()
  const { user, isLoaded } = useUser()
  const [orders, setOrders] = useState<StudentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoaded) return
      
      if (!user?.emailAddresses?.[0]?.emailAddress) {
        setError('Email address not found')
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

    fetchOrders()
  }, [user, isLoaded])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
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

  const handleCancel = (order: StudentOrder) => {
    // Boilerplate cancel handler
    console.log('Cancel order:', order)
    // TODO: Implement cancel functionality
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
                    onClick={() => handleCancel(order)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                  >
                    {t.cancel.cancelButton}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

