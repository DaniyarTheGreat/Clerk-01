'use client'

import { useLanguage } from '../lib/language-context'

export default function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section id="how-it-works" className="py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
          <h3 className="font-amiri text-xl font-bold text-gray-900 mb-4">
            {t.howItWorks.access.title}
          </h3>
          <div className="space-y-4">
            <div className="bg-white/70 rounded-lg p-4 border-l-4 border-amber-500">
              <p className="text-gray-800 leading-relaxed text-sm">
                <span className="font-semibold">•</span> {t.howItWorks.access.noRecordings}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 border-l-4 border-emerald-500">
              <p className="text-gray-800 leading-relaxed text-sm">
                <span className="font-semibold">•</span> {t.howItWorks.access.zoomLink}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
