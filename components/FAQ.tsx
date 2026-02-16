'use client'

import { useState } from 'react'
import { useLanguage } from '../lib/language-context'

function FAQQuestion({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 px-4 flex items-start justify-between text-left hover:bg-gray-50 transition-colors rounded-lg"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <span className={`text-emerald-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function FAQCategory({ category, isOpen, onToggle }: { category: any; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all duration-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{category.icon}</span>
          <h3 className="font-semibold text-lg text-gray-900">
            {category.title}
          </h3>
        </div>
        <span className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-3 ml-4 md:ml-12 bg-white border border-emerald-100 rounded-lg shadow-sm overflow-hidden">
          {category.questions.map((faq: any, i: number) => (
            <FAQQuestion key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const { t } = useLanguage()
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({})

  const toggleCategory = (index: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  return (
    <section id="faq" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-shadow-readable">
            {t.faq.title}
          </h2>
          <p className="text-gray-700 font-medium text-shadow-readable">
            {t.faq.subtitle}
          </p>
        </div>
        
        <div>
          {t.faq.categories.map((category: any, i: number) => (
            <FAQCategory
              key={i}
              category={category}
              isOpen={openCategories[i] || false}
              onToggle={() => toggleCategory(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
