'use client'

import { useLanguage } from '../lib/language-context'
import { useCart } from '../lib/cart-context'

export default function Pricing() {
  const { t } = useLanguage()
  const { addToCart } = useCart()

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.pricing.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {t.pricing.plans.map((plan, i) => {
            const isHighlighted = i === 1 // Professional plan is highlighted
            return (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  isHighlighted
                    ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-200 scale-105'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {isHighlighted && (
                  <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">
                    {t.pricing.mostPopular}
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${isHighlighted ? 'text-emerald-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${isHighlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <svg className={`w-5 h-5 ${isHighlighted ? 'text-emerald-200' : 'text-emerald-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className={isHighlighted ? 'text-emerald-50' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addToCart({
                    id: plan.name.toLowerCase(),
                    name: plan.name,
                    price: plan.price,
                    description: plan.description,
                    features: plan.features
                  })}
                  className={`w-full py-3 rounded-lg font-medium transition cursor-pointer ${
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

