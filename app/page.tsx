import Hero from '../components/Hero'
import NoticeBanner from '../components/NoticeBanner'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Courses from '../components/Courses'
import ClassSchedule from '../components/ClassSchedule'
import Pricing from '../components/Pricing'
import FAQ from '../components/FAQ'
import CTA from '../components/CTA'
import ContactForm from '../components/ContactForm'

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <Hero />
      <NoticeBanner />
      <Features />
      <HowItWorks />
      <Courses />
      <ClassSchedule />
      <Pricing />
      <FAQ />
      <CTA />
      <ContactForm />
    </div>
  )
}
