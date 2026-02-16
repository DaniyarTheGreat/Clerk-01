'use client'

import { useLanguage } from '../lib/language-context'

export default function NoticeBanner() {
  const { t } = useLanguage()

  return (
    <section className="py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 bg-purple-50 border-2 border-purple-200 rounded-2xl py-4 px-6 shadow-sm">
          <span className="text-2xl flex-shrink-0">📢</span>
          <p className="text-purple-900 font-bold text-center text-shadow-readable">
            {t.notice.womenOnly}
          </p>
        </div>
      </div>
    </section>
  )
}
