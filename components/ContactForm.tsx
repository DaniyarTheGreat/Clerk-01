'use client'

import { useState, FormEvent } from 'react'
import { useLanguage } from '../lib/language-context'
import { submitContactForm } from '../lib/api'

export default function ContactForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!email || !category || !message) {
      setSubmitStatus({
        type: 'error',
        message: t.contactForm.validationError || 'Please fill in all fields'
      })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      await submitContactForm({
        email: email.trim(),
        category: category,
        message: message.trim(),
      })
      
      setSubmitStatus({
        type: 'success',
        message: t.contactForm.successMessage || 'Thank you! Your message has been sent successfully.'
      })
      
      // Reset form
      setEmail('')
      setCategory('')
      setMessage('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-24">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-amiri text-3xl md:text-4xl font-bold text-emerald-900 mb-4 text-shadow-readable">
            {t.contactForm.title || 'Contact Us'}
          </h2>
          <p className="text-gray-700 max-w-xl mx-auto font-medium text-shadow-readable">
            {t.contactForm.subtitle || 'Have a question or feedback? We\'d love to hear from you.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-md rounded-xl shadow-xl border border-white/30 p-8 md:p-10">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.contactForm.emailLabel || 'Email'}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                placeholder={t.contactForm.emailPlaceholder || 'your.email@example.com'}
                disabled={isSubmitting}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                {t.contactForm.categoryLabel || 'Category'}
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white/90"
                disabled={isSubmitting}
              >
                <option value="">{t.contactForm.categoryPlaceholder || 'Select a category'}</option>
                <option value="Bug">{t.contactForm.categories?.bug || 'Bug'}</option>
                <option value="Feedback">{t.contactForm.categories?.feedback || 'Feedback'}</option>
                <option value="General">{t.contactForm.categories?.general || 'General'}</option>
                <option value="Cancel Order">{t.contactForm.categories?.cancelOrder || 'Cancel Order'}</option>
                <option value="Other">{t.contactForm.categories?.other || 'Other'}</option>
              </select>
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t.contactForm.messageLabel || 'Message'}
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none resize-none"
                placeholder={t.contactForm.messagePlaceholder || 'Enter your message here...'}
                disabled={isSubmitting}
              />
            </div>

            {/* Status Message */}
            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg ${
                  submitStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting
                ? (t.contactForm.submitting || 'Sending...')
                : (t.contactForm.submitButton || 'Send Message')}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

