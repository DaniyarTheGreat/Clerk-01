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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Avoid SSR/client hydration mismatch for cart badge (cart loads from storage on client).
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navLinks = (
    <>
      <Link href="/#features" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.features}
      </Link>
      <Link href="/#courses" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.courses}
      </Link>
      <Link href="/pricing" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.pricing}
      </Link>
      <SignedIn>
        <Link href="/cancel" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
          {t.nav.cancel}
        </Link>
      </SignedIn>
      <Link href="/#faq" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.faq}
      </Link>
      <Link href="/#features" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.about}
      </Link>
      <Link href="/#contact" className="text-sm text-gray-700 font-medium hover:text-emerald-700 transition" onClick={() => setMobileMenuOpen(false)}>
        {t.nav.contact}
      </Link>
    </>
  )

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
          <span className="font-amiri text-2xl md:text-3xl font-bold text-emerald-900 tracking-tight">SAQIA MADRASA</span>
        </a>
        
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-700 hover:text-emerald-700 transition rounded-lg"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link href="/cart" className="relative">
            <button className="relative p-2 text-gray-700 hover:text-emerald-700 transition cursor-pointer">
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

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-emerald-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            {navLinks}
          </div>
        </div>
      )}
    </header>
  )
}

