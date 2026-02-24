'use client'

import { useLanguage } from '../lib/language-context'

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const isLearningFormat = Array.isArray(feature.details)
  const isLanguage = feature.highlight != null

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 hover:shadow-lg transition h-full flex flex-col">
      <span className="text-4xl mb-4 block">{feature.icon}</span>
      <h3 className="font-semibold text-lg text-gray-900 mb-3">{feature.title}</h3>

      {isLearningFormat ? (
        <ul className="space-y-2 text-sm text-gray-700 flex-1">
          {feature.details.map((row: { label: string; value: string }, j: number) => (
            <li key={j} className="flex justify-between gap-2 border-b border-emerald-100/80 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-700 font-semibold shrink-0">{row.label}:</span>
              <span className="text-gray-900 text-right">{row.value}</span>
            </li>
          ))}
        </ul>
      ) : isLanguage ? (
        <div className="flex-1 flex flex-col gap-3">
          <p className="text-gray-700 text-sm">{feature.description}</p>
          <div className="mt-auto bg-emerald-100/80 rounded-lg px-3 py-2">
            <p className="text-emerald-900 text-sm font-medium">{feature.highlight}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 text-sm flex-1">{feature.description}</p>
      )}
    </div>
  )
}

export default function Features() {
  const { t } = useLanguage()

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-shadow-readable">
            {t.features.title}
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-shadow-readable-white">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((feature: any, i: number) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

