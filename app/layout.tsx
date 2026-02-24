import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Amiri, Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../lib/language-context'
import { CartProvider } from '../lib/cart-context'
import ClerkApiAuth from '../components/ClerkApiAuth'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import LanguageSelector from '../components/LanguageSelector'
import ScrollFadeBackground from '../components/ScrollFadeBackground'

const amiri = Amiri({
  variable: '--font-amiri',
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'SAQIA MADRASA- Learn the Quran Online',
  description: 'Master Quran recitation, Tajweed, and Arabic with expert teachers',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <body className={`${amiri.variable} ${inter.variable} antialiased font-sans relative`}>
          <ClerkApiAuth />
          <ScrollFadeBackground />
          <LanguageProvider>
            <CartProvider>
              <div className="relative z-10">
                <Navigation />
                <LanguageSelector />
                <main className="pt-20">
                  {children}
                </main>
                <Footer />
              </div>
            </CartProvider>
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
