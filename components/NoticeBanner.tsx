'use client'

import { useLanguage } from '../lib/language-context'

export default function NoticeBanner() {
  const { t } = useLanguage()

  return (
    <section className="bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 border-y border-purple-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">📢</span>
          <p className="text-purple-900 font-semibold text-center">
            {t.notice.womenOnly}
          </p>
        </div>
      </div>
    </section>
  )
}
