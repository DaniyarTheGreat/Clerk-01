'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useLanguage } from '../lib/language-context'

export default function Navigation() {
  const { t } = useLanguage()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <span className="font-amiri text-xl font-bold text-emerald-900">Quran Academy</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.features}
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.pricing}
          </a>
          <a href="#faq" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.faq}
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.about}
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.contact}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton>
              <button className="text-sm text-emerald-700 hover:text-emerald-900 transition font-medium">
                {t.nav.signIn}
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm px-4 py-2 transition">
                {t.nav.getStarted}
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </header>
  )
}

