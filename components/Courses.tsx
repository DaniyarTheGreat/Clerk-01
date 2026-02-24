'use client'

import { useLanguage } from '../lib/language-context'

export default function Courses() {
  const { t } = useLanguage()

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      text: 'text-emerald-700',
      badge: 'bg-emerald-600',
      hover: 'hover:shadow-emerald-200'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      text: 'text-blue-700',
      badge: 'bg-blue-600',
      hover: 'hover:shadow-blue-200'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      text: 'text-amber-700',
      badge: 'bg-amber-600',
      hover: 'hover:shadow-amber-200'
    }
  }

  return (
    <section id="courses" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <h2 className="font-amiri text-4xl md:text-5xl lg:text-6xl font-bold text-shadow-readable bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-4">
              {t.courses.title}
            </h2>
            <div className="mx-auto w-24 h-1 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400 rounded-full"></div>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto text-lg font-medium text-shadow-readable-white">
            {t.courses.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {t.courses.items.map((course, i) => {
            const colors = colorClasses[course.color as keyof typeof colorClasses]
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} transition-all duration-300 ${colors.hover} hover:shadow-xl hover:-translate-y-1`}
              >
                {/* Badge */}
                <div className={`absolute top-4 right-4 ${colors.badge} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                  {course.level}
                </div>

                {/* Icon */}
                <div className={`${colors.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mt-6 ml-6 mb-4`}>
                  {course.icon}
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                  <h3 className="font-amiri text-2xl font-bold text-gray-900 mb-4">
                    {course.name}
                  </h3>

                  {/* Curriculum */}
                  <div className="mb-4">
                    <p className={`text-sm font-semibold ${colors.text} mb-2`}>
                      {t.courses.labels.curriculum}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {course.curriculum}
                    </p>
                  </div>

                  {/* Goal */}
                  <div className="mb-4">
                    <p className={`text-sm font-semibold ${colors.text} mb-2`}>
                      {t.courses.labels.goal}
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {course.goal}
                    </p>
                  </div>

                  {/* Schedule for Advanced course */}
                  {course.schedule && (
                    <div className="mb-4 p-3 bg-white/60 rounded-lg">
                      <p className={`text-sm font-semibold ${colors.text} mb-2`}>
                        {course.schedule.title}
                      </p>
                      <ul className="space-y-1">
                        {course.schedule.items.map((item, idx) => (
                          <li key={idx} className="text-gray-700 text-sm flex items-start">
                            <span className="text-emerald-600 mr-2">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Divider */}
                  <div className={`border-t ${colors.border} my-4`}></div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className={`text-xs font-semibold ${colors.text} mb-1`}>
                        {t.courses.labels.schedule}
                      </p>
                      <p className="text-gray-900 text-sm font-medium">
                        {course.time}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${colors.text} mb-1`}>
                        {t.courses.labels.fee}
                      </p>
                      <p className="text-gray-900 text-sm font-medium">
                        {course.fee} <span className="text-gray-500 text-xs">/{course.duration}</span>
                      </p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">{t.courses.labels.capacity}:</span> {t.courses.labels.capacityValue}
                    </p>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className={`absolute bottom-0 right-0 w-32 h-32 ${colors.bg} opacity-20 rounded-tl-full`}></div>
              </div>
            )
          })}
        </div>

        {/* Enrollment Note */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg shadow-sm">
            <p className="text-sm text-purple-900 leading-relaxed">
              <span className="font-semibold">📌 {t.courses.enrollmentNote}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
