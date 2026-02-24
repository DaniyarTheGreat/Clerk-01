'use client'

import { useLanguage } from '../lib/language-context'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-800 font-semibold mb-4 text-shadow-readable">{t.hero.subtitle}</p>
          <h1 className="font-amiri text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 text-shadow-readable-strong">
            {t.hero.title}<br />
            <span className="text-emerald-700">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-lg text-gray-800 mb-8 max-w-xl mx-auto text-shadow-readable-white font-medium">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-lg shadow-emerald-200">
              {t.hero.ctaPrimary}
            </a>
            <a href="#courses" className="border border-gray-300 hover:border-emerald-300 bg-white/90 text-gray-700 px-8 py-3 rounded-lg font-medium transition">
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

