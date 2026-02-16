'use client'

import { useState } from 'react'
import { useLanguage } from '../lib/language-context'

export default function ClassSchedule() {
  const { t } = useLanguage()
  const [expandedRegion, setExpandedRegion] = useState<number | null>(null)

  return (
    <section id="schedule" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-shadow-readable">
            {t.schedule.title}
          </h2>
          <p className="text-gray-700 text-lg font-medium text-shadow-readable">
            {t.schedule.subtitle}
          </p>
        </div>

        {/* Time Zone Reminder */}
        <div className="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-6 mb-12 shadow-sm">
          <h3 className="font-semibold text-purple-900 text-lg mb-3">
            {t.schedule.timeZoneReminder.title}
          </h3>
          <p className="text-purple-800 leading-relaxed">
            {t.schedule.timeZoneReminder.description}
          </p>
        </div>

        {/* Local Times */}
        <div className="mb-8">
          <h3 className="font-amiri text-2xl font-bold text-gray-900 mb-6 text-center">
            {t.schedule.localTimes.title}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4 items-start">
            {t.schedule.localTimes.regions.map((region: any, index: number) => (
              <div
                key={index}
                className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer self-start"
                onClick={() => setExpandedRegion(expandedRegion === index ? null : index)}
              >
                <div className="p-4 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{region.name}</h4>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`text-gray-500 transition-transform ${expandedRegion === index ? 'rotate-180' : ''}`}
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {expandedRegion === index && (
                  <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">Advanced</p>
                        <p className="font-semibold text-emerald-700">{region.advanced}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">Intermediate</p>
                        <p className="font-semibold text-blue-700">{region.intermediate}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs mb-1">Beginner</p>
                        <p className="font-semibold text-amber-700">{region.beginner}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 font-semibold mb-2">
            {t.schedule.localTimes.note}
          </p>
          <p className="text-blue-800 leading-relaxed">
            {t.schedule.localTimes.noteDescription}
          </p>
        </div>
      </div>
    </section>
  )
}
