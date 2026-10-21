import Header from "@/components/ui/Header";
import AgencyAbout from "@/components/sections/AgencyAbout";
import Hero from "@/components/sections/Hero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import dynamic from 'next/dynamic';
import JsonLd from "@/components/seo/JsonLd";
import { homepagePortfolio } from '@/lib/portfolio/repository';

// Lazy load everything below the fold
const Manifesto = dynamic(() => import("@/components/sections/Manifesto"));
const Services = dynamic(() => import("@/components/sections/Services"));
const Sandbox = dynamic(() => import("@/components/sections/Sandbox"));
const ExperienceReel = dynamic(() => import("@/components/sections/ExperienceReel"));

const Process = dynamic(() => import("@/components/sections/Process"));
const Contact = dynamic(() => import("@/components/sections/Contact"));
const Footer = dynamic(() => import("@/components/sections/Footer"));

export default async function Home() {
  const portfolioProjects = await homepagePortfolio();
  return (
    <main className="min-h-screen bg-section-ink selection:bg-creative-flame selection:text-white overflow-hidden w-full relative">
      <JsonLd data={[
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Ideomint',
          url: 'https://ideomint.com',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          name: 'Ideomint',
          description: 'Creative experience company offering design, branding, and digital services.',
          url: 'https://ideomint.com',
          priceRange: '$$',
        },
      ]} />
      <Header />
      <Hero />
      <AnimatedSection><Services /></AnimatedSection>
      <ExperienceReel projects={portfolioProjects} />
      <AgencyAbout />
      <Manifesto />
      <Process />
      <Sandbox />
      <AnimatedSection><Contact /></AnimatedSection>
      <Footer />
    </main>
  );
}
