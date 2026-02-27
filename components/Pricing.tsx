'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../lib/language-context'
import { useCart } from '../lib/cart-context'
import { getBatch, Batch } from '../lib/api'

// Map backend class types to frontend product indices
const classTypeToIndex: Record<string, number> = {
  'beginner': 0,      // Starter
  'intermediate': 1, // Professional
  'advanced': 2      // Scholar
}

const indexToClassType: Record<number, string> = {
  0: 'beginner',
  1: 'intermediate',
  2: 'advanced'
}

const DEFAULT_DETAIL_FIELDS = ['startDate', 'endDate', 'time', 'duration', 'students', 'spotsAvailable']

export default function Pricing() {
  const { t } = useLanguage()
  const { addToCart } = useCart()
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentBatchIndex, setCurrentBatchIndex] = useState<Record<number, number>>({
    0: 0, // beginner
    1: 0, // intermediate
    2: 0  // advanced
  })

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true)
        const data = await getBatch()
        setBatches(data)
      } catch (error) {
        console.error('Failed to fetch batches:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBatches()
  }, [])

  // Group batches by class_type
  const batchesByType = batches.reduce((acc, batch) => {
    const type = batch.class_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(batch)
    return acc
  }, {} as Record<string, Batch[]>)

  // Sort batches by start_date for each type
  Object.keys(batchesByType).forEach(type => {
    batchesByType[type].sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getDetailValue = (key: string, batch: Batch): string => {
    switch (key) {
      case 'startDate':
        return batch.start_date
      case 'endDate':
        return batch.end_date
      case 'time':
        return `${batch.time} EST`
      case 'duration':
        return `${batch.length} ${batch.length === 1 ? (t.pricing.labels?.week ?? 'week') : (t.pricing.labels?.weeks ?? 'weeks')}`
      case 'students':
        return `${batch.students} / ${batch.max_students}`
      case 'spotsAvailable':
        return String(batch.max_students - batch.students)
      default:
        return ''
    }
  }

  const handleNext = (planIndex: number) => {
    const classType = indexToClassType[planIndex]
    const typeBatches = batchesByType[classType] || []
    setCurrentBatchIndex(prev => ({
      ...prev,
      [planIndex]: Math.min(prev[planIndex] + 1, typeBatches.length - 1)
    }))
  }

  const handlePrevious = (planIndex: number) => {
    setCurrentBatchIndex(prev => ({
      ...prev,
      [planIndex]: Math.max(prev[planIndex] - 1, 0)
    }))
  }

  if (loading) {
    return (
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-shadow-readable">
              {t.pricing.title}
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto font-medium text-shadow-readable-white">
              {t.pricing.subtitle}
            </p>
          </div>
          <div className="text-center text-gray-700 font-medium">{t.pricing.labels?.loadingBatches ?? 'Loading batches...'}</div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-shadow-readable">
            {t.pricing.title}
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium text-shadow-readable-white">
            {t.pricing.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {t.pricing.plans.map((plan, i) => {
            const isHighlighted = i === 1 // Professional plan is highlighted
            const classType = indexToClassType[i]
            const typeBatches = batchesByType[classType] || []
            const currentIndex = currentBatchIndex[i] || 0
            const currentBatch = typeBatches[currentIndex]
            const hasMultipleBatches = typeBatches.length > 1
            const canGoNext = currentIndex < typeBatches.length - 1
            const canGoPrevious = currentIndex > 0

            return (
              <div
                key={i}
                className={`rounded-2xl p-6 flex flex-col ${
                  isHighlighted
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-300/50 scale-[1.02]'
                    : 'bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow'
                }`}
              >
                {isHighlighted && (
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block w-fit">
                    {t.pricing.mostPopular}
                  </span>
                )}

                {hasMultipleBatches && (
                  <div className="mb-4">
                    <p className={`text-xs font-medium mb-2 ${isHighlighted ? 'text-emerald-200' : 'text-gray-500'}`}>
                      {t.pricing.labels?.chooseBatch ?? 'Choose batch'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrevious(i)}
                        disabled={!canGoPrevious}
                        aria-label="Previous batch"
                        className={`shrink-0 p-1.5 rounded-full transition-all duration-200 ${
                          canGoPrevious
                            ? isHighlighted
                              ? 'text-white hover:bg-white/20 active:scale-95'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95'
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex flex-1 justify-center gap-1 min-w-0">
                        {typeBatches.map((_, batchIdx) => {
                          const isActive = batchIdx === currentIndex
                          return (
                            <button
                              key={batchIdx}
                              type="button"
                              onClick={() => setCurrentBatchIndex(prev => ({ ...prev, [i]: batchIdx }))}
                              className={`
                                min-w-[2rem] h-8 px-2 rounded-full text-sm font-medium
                                transition-all duration-200 ease-out
                                ${isActive
                                  ? isHighlighted
                                    ? 'bg-white text-emerald-600 shadow-md scale-105'
                                    : 'bg-emerald-600 text-white shadow-md scale-105'
                                  : isHighlighted
                                    ? 'bg-white/15 text-emerald-100 hover:bg-white/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                              `}
                            >
                              {batchIdx + 1}
                            </button>
                          )
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNext(i)}
                        disabled={!canGoNext}
                        aria-label="Next batch"
                        className={`shrink-0 p-1.5 rounded-full transition-all duration-200 ${
                          canGoNext
                            ? isHighlighted
                              ? 'text-white hover:bg-white/20 active:scale-95'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95'
                            : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <h3 className={`text-lg font-semibold mb-0.5 ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${isHighlighted ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                {currentBatch && (
                  <div
                    key={`${i}-${currentIndex}`}
                    className="mb-5 animate-batch-in space-y-2.5"
                  >
                    {(() => {
                      const baseFields = (t.pricing.detailFields ?? DEFAULT_DETAIL_FIELDS) as string[]
                      const fields = baseFields.includes('time')
                        ? baseFields
                        : [...baseFields.slice(0, 2), 'time', ...baseFields.slice(2)]
                      return fields
                    })().map((fieldKey: string) => (
                      <div key={fieldKey} className="flex justify-between items-baseline text-sm">
                        <span className={isHighlighted ? 'text-emerald-100' : 'text-gray-600'}>
                          {t.pricing.labels?.[fieldKey as keyof typeof t.pricing.labels] ?? fieldKey}
                        </span>
                        <span className={`text-sm ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                          {getDetailValue(fieldKey, currentBatch)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mb-6 mt-auto">
                  <span className={`text-3xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                </div>
                <button
                  onClick={() => addToCart({
                    id: currentBatch 
                      ? `${plan.name.toLowerCase()}-batch-${currentBatch.batch_num}`
                      : plan.name.toLowerCase(),
                    name: plan.name,
                    price: plan.price,
                    description: plan.description,
                    features: plan.features,
                    start_date: currentBatch?.start_date,
                    end_date: currentBatch?.end_date,
                    batch_number: currentBatch?.batch_num
                  })}
                  className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer ${
                    isHighlighted
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {t.pricing.addToCart}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

