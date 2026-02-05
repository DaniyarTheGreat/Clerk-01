'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '../lib/language-context'
import { useCart } from '../lib/cart-context'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const { t } = useLanguage()
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const [isMounted, setIsMounted] = useState(false)

  // Avoid SSR/client hydration mismatch for cart badge (cart loads from storage on client).
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <a href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <div className="h-16 flex items-center justify-center bg-white">
            <Image
              src="/logo.svg"
              alt="Saqia Madrasa Logo"
              width={80}
              height={80}
              className="h-16 w-auto object-contain"
              quality={100}
              priority
              style={{ 
                filter: 'contrast(1.1)',
                mixBlendMode: 'multiply'
              }}
            />
          </div>
          <span className="font-amiri text-2xl md:text-3xl font-bold text-emerald-900 tracking-tight">Saqia Madrasa</span>
        </a>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.features}
          </a>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-emerald-700 transition">
            {t.nav.pricing}
          </Link>
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
          <Link href="/cart" className="relative">
            <button className="relative p-2 text-gray-600 hover:text-emerald-700 transition cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {isMounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          <SignedOut>
            <SignInButton>
              <button className="text-sm text-emerald-700 hover:text-emerald-900 transition font-medium cursor-pointer">
                {t.nav.signIn}
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm px-4 py-2 transition cursor-pointer">
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

