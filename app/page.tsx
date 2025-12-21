import Hero from '../components/Hero'
import Features from '../components/Features'
import Pricing from '../components/Pricing'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'

export default function Home() {
  return (
    <div className="bg-white font-sans">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  )
}
