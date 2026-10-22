import Header from "@/components/ui/Header";
import AgencyAbout from "@/components/sections/AgencyAbout";
import Hero from "@/components/sections/Hero";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { Metadata } from 'next';
import { pageMetadata, agencyDescription, siteUrl, serviceGraph } from '@/lib/seo';
import JsonLd from "@/components/seo/JsonLd";
import { homepagePortfolio } from '@/lib/portfolio/repository';

// Render public copy in the initial HTML; hydrate interactions progressively.
import Manifesto from "@/components/sections/Manifesto";
import Services from "@/components/sections/Services";
import Sandbox from "@/components/sections/Sandbox";
import ExperienceReel from "@/components/sections/ExperienceReel";

import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export const metadata: Metadata = pageMetadata('IdeoMint — Websites, Marketing & Creative', agencyDescription, '/');

export default async function Home() {
  const projects = await homepagePortfolio();
  return (
    <main className="min-h-screen bg-section-ink selection:bg-creative-flame selection:text-white overflow-hidden w-full relative">
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'IdeoMint', url: siteUrl, publisher: { '@id': `${siteUrl}/#organization` } },
        { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: siteUrl, name: 'IdeoMint — Websites, Marketing & Creative', description: agencyDescription, isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#organization` } },
        ...serviceGraph(),
        { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Selected work by IdeoMint', itemListElement: projects.map((project, index) => ({ '@type': 'ListItem', position: index + 1, item: { '@type': 'CreativeWork', name: project.title, description: project.description, creditText: project.label, creator: { '@id': `${siteUrl}/#organization` } } })) },
      ]} />
      <Header />
      <Hero />
      <AnimatedSection><Services /></AnimatedSection>
      <ExperienceReel projects={projects} />
      <AgencyAbout />
      <Manifesto />
      <Process />
      <Sandbox />
      <AnimatedSection><Contact /></AnimatedSection>
      <Footer />
    </main>
  );
}
