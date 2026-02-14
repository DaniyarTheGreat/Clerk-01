'use client'

import { useLanguage } from '../lib/language-context'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-700 font-medium mb-4">{t.hero.subtitle}</p>
          <h1 className="font-amiri text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t.hero.title}<br />
            <span className="text-emerald-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-lg shadow-emerald-200">
              {t.hero.ctaPrimary}
            </a>
            <a href="#courses" className="border border-gray-300 hover:border-emerald-300 text-gray-700 px-8 py-3 rounded-lg font-medium transition">
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

