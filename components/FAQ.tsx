'use client'

import { useState } from 'react'
import { useLanguage } from '../lib/language-context'

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-emerald-100">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-medium text-gray-900">{question}</span>
        <span className={`text-emerald-600 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <p className="pb-5 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  const { t } = useLanguage()

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.faq.title}
          </h2>
          <p className="text-gray-600">
            {t.faq.subtitle}
          </p>
        </div>
        
        <div>
          {t.faq.items.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}

