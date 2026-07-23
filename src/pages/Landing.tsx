import { Navbar } from '@/components/shared/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Workflow } from '@/components/landing/Workflow'
import { AgentArchitecture } from '@/components/landing/AgentArchitecture'
import { Testimonials } from '@/components/landing/Testimonials'
import { Footer } from '@/components/landing/Footer'

export function Landing() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <AgentArchitecture />
      <Testimonials />
      <Footer />
    </div>
  )
}
