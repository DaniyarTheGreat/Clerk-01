'use client'

import { useLanguage } from '../lib/language-context'

export default function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Learning Format Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-amiri text-2xl font-bold text-gray-900 mb-6">
              {t.howItWorks.learningFormat.title}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.platform}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.platformValue}</span>
              </div>
              <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.type}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.typeValue}</span>
              </div>
              <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.startDate}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.startDateValue}</span>
              </div>
              <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.schedule}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.scheduleValue}</span>
              </div>
              <div className="flex justify-between items-start border-b border-emerald-100 pb-3">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.duration}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.durationValue}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="font-semibold text-gray-700">{t.howItWorks.learningFormat.classSize}:</span>
                <span className="text-gray-900 text-right">{t.howItWorks.learningFormat.classSizeValue}</span>
              </div>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-amiri text-2xl font-bold text-gray-900 mb-6">
              {t.howItWorks.language.title}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.howItWorks.language.description}
            </p>
            <div className="bg-blue-100 rounded-lg p-4">
              <p className="text-blue-900 font-medium">
                {t.howItWorks.language.languages}
              </p>
            </div>
          </div>
        </div>

        {/* Access & Recordings Card */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
          <h3 className="font-amiri text-xl font-bold text-gray-900 mb-4">
            {t.howItWorks.access.title}
          </h3>
          <div className="space-y-4">
            <div className="bg-white/70 rounded-lg p-4 border-l-4 border-amber-500">
              <p className="text-gray-800 leading-relaxed">
                <span className="font-semibold">•</span> {t.howItWorks.access.noRecordings}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 border-l-4 border-emerald-500">
              <p className="text-gray-800 leading-relaxed">
                <span className="font-semibold">•</span> {t.howItWorks.access.zoomLink}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
