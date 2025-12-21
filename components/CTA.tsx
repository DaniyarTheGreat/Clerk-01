'use client'

import { useLanguage } from '../lib/language-context'

export default function CTA() {
  const { t } = useLanguage()

  return (
    <section className="py-24 bg-emerald-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-amiri text-3xl md:text-4xl font-bold text-white mb-4">
          {t.cta.title}
        </h2>
        <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
          {t.cta.subtitle}
        </p>
        <a
          href="#pricing"
          className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-medium hover:bg-emerald-50 transition shadow-lg"
        >
          {t.cta.button}
        </a>
      </div>
    </section>
  )
}

