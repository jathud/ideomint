import Header from "@/components/ui/Header";
import Hero from "@/components/sections/Hero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import dynamic from 'next/dynamic';
import JsonLd from "@/components/seo/JsonLd";

// Lazy load everything below the fold
const Manifesto = dynamic(() => import("@/components/sections/Manifesto"));
const Services = dynamic(() => import("@/components/sections/Services"));
const Teardown = dynamic(() => import("@/components/sections/Teardown"));
const Sandbox = dynamic(() => import("@/components/sections/Sandbox"));
const Stats = dynamic(() => import("@/components/sections/Stats"));

const Comparison = dynamic(() => import("@/components/sections/Comparison"));
const Process = dynamic(() => import("@/components/sections/Process"));
const Contact = dynamic(() => import("@/components/sections/Contact"));
const Footer = dynamic(() => import("@/components/sections/Footer"));

export default function Home() {
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
      <Manifesto />
      <AnimatedSection><Services /></AnimatedSection>
      <Teardown />
      <Sandbox />
      <Stats />

      <AnimatedSection><Comparison /></AnimatedSection>
      <Process />
      <AnimatedSection><Contact /></AnimatedSection>
      <Footer />
    </main>
  );
}
