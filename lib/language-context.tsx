'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import enTranslations from '../locales/en.json'
import trTranslations from '../locales/tr.json'
import ruTranslations from '../locales/ru.json'
import zhTranslations from '../locales/zh.json'

type Language = 'en' | 'tr' | 'ru' | 'zh'

type Translations = typeof enTranslations

const translations: Record<Language, Translations> = {
  en: enTranslations,
  tr: trTranslations,
  ru: ruTranslations,
  zh: zhTranslations,
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('quran-academy-language') as Language
    if (savedLanguage && ['en', 'tr', 'ru', 'zh'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('quran-academy-language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

