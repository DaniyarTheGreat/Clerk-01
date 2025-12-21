'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../lib/language-context'

const languageOptions = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'tr' as const, name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  { code: 'zh' as const, name: '中文', flag: '🇨🇳' },
]

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<typeof language>(language)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Update selected language when language changes externally
    setSelectedLanguage(language)
  }, [language])

  const currentLanguage = languageOptions.find(lang => lang.code === language) || languageOptions[0]

  const handleApply = () => {
    setLanguage(selectedLanguage)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedLanguage(language) // Reset to current language
    setIsOpen(false)
  }

  return (
    <div className="fixed right-6 z-50 transition-all duration-300" style={{ top: isScrolled ? '88px' : '120px' }}>
      <div className="relative">
        {/* Language Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all hover:border-emerald-400"
          aria-label="Select language"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {currentLanguage.code.toUpperCase()}
          </span>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={handleCancel}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-50">
              <div className="p-4 border-b border-emerald-100">
                <h3 className="font-semibold text-gray-900 text-sm">{t.language.select}</h3>
              </div>
              <div className="py-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                      selectedLanguage === lang.code ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 text-sm">{lang.name}</div>
                      <div className="text-xs text-gray-500">{t.language.options[lang.code]}</div>
                    </div>
                    {selectedLanguage === lang.code && (
                      <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-emerald-100 flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  {t.language.cancel}
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  {t.language.apply}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

