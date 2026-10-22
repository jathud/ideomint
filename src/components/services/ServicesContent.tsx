import { ArrowRight, Globe, Megaphone, Camera } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/sections/Footer';
import AnimatedSection from '@/components/ui/AnimatedSection';
import CustomPlanForm from './CustomPlanForm';

const services = [
  { id: 'websites', title: 'Websites', icon: Globe, headline: 'A digital home that means business.', description: 'Clear, responsive websites that help people understand your business, trust your brand and take the next step.', audience: 'Businesses launching online, refreshing their website or introducing a new offer.', capabilities: ['Business websites', 'Campaign landing pages', 'Responsive web design', 'Website content and enquiry journeys'] },
  { id: 'grow-presence', title: 'Marketing', icon: Megaphone, headline: 'Give your business a stronger presence.', description: 'Thoughtful campaigns and consistent communication that connect your brand with the people you want to reach.', audience: 'Businesses looking for ongoing marketing support, a focused campaign or an event launch.', capabilities: ['Social media strategy and management', 'Digital campaigns and ad creative', 'Event marketing', 'Campaign planning and reporting'] },
  { id: 'create-content', title: 'Content & Creative', icon: Camera, headline: 'Make something worth noticing.', description: 'Photography, film and design that bring your story into focus, shaped around your audience and where the work will live.', audience: 'Brands with a story to tell, a product to launch or an experience to capture.', capabilities: ['Photography and video production', 'Reels and short-form content', 'Campaign design and visual storytelling', 'Event photography and aftermovies'] },
];
const supporting = [
  { id: 'build-brand', title: 'Brand Strategy & Identity', description: 'A clear foundation for how your business looks, sounds and presents itself.', capabilities: ['Brand discovery and positioning', 'Logo and visual identity', 'Colour, typography and brand guidelines', 'Launch materials and brand applications'] },
  { id: 'personal-brand', title: 'Personal Branding', description: 'Help people understand who you are, what you stand for and the value you bring.', capabilities: ['Positioning and profile direction', 'Content strategy and storytelling', 'Founder photography and video', 'YouTube and social content support'] },
];

export default function ServicesContent() {
  return (
    <main className="min-h-screen bg-section-ink text-white selection:bg-creative-flame selection:text-white overflow-hidden w-full relative">
      <Header />
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-10">
        <div aria-hidden="true" className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,60,0.09),transparent_65%)] pointer-events-none" />
        <div className="container-layout relative">
          <p className="text-creative-flame font-bold tracking-widest text-xs uppercase mb-6">IdeoMint / Our capabilities</p>
          <div className="grid lg:grid-cols-[1.45fr_1fr] items-end gap-6 lg:gap-16">
            <h1 className="text-[clamp(2.5rem,5.5vw,5.5rem)] font-black leading-[1.03] tracking-tight">Ideas with ambition.<br /><span className="text-creative-flame">Work with purpose.</span></h1>
            <div className="lg:pb-1 max-w-md">
              <p className="text-base md:text-lg text-white/70 leading-relaxed">Websites, marketing and creative work built around your business. One creative partner, from the first idea to the finished work.</p>
              <a href="#custom-plan" className="inline-flex items-center gap-3 text-sm font-bold min-h-11 mt-4">Tell us what you have in mind <ArrowRight aria-hidden="true" className="w-4 h-4 text-creative-flame" /></a>
            </div>
          </div>
          <nav aria-label="Services" className="grid sm:grid-cols-3 mt-8 md:mt-12 border-y border-white/15">
            {services.map((service, index) => (
              <a key={service.id} href={'#' + service.id} className="group flex items-center gap-3 py-4 md:py-5 sm:px-5 first:pl-0 border-b sm:border-b-0 last:border-b-0 border-white/10 sm:border-r sm:last:border-r-0 hover:text-creative-flame transition-colors">
                <span className="text-xs text-creative-flame font-bold">0{index + 1}</span>
                <span className="font-bold text-sm md:text-base">{service.title}</span>
                <ArrowRight aria-hidden="true" className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </nav>
        </div>
      </section>
      {services.map((service, index) => (
        <AnimatedSection key={service.id}>
          <section id={service.id} className="scroll-mt-24 relative">
            <div className="container-layout">
              <div className="grid lg:grid-cols-[0.28fr_1fr_0.9fr] gap-6 lg:gap-10 py-10 md:py-14 border-b border-white/15">
                <div className="flex lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-5">
                  <span aria-hidden="true" className="text-5xl lg:text-7xl font-black tracking-tighter text-white/15 leading-none">0{index + 1}</span>
                  <service.icon aria-hidden="true" className="w-6 h-6 text-creative-flame" />
                </div>
                <div>
                  <p className="text-creative-flame text-xs font-bold tracking-widest uppercase mb-4">{service.title}</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-[1.12] mb-5 max-w-lg">{service.headline}</h2>
                  <p className="text-base text-white/70 leading-relaxed max-w-lg">{service.description}</p>
                  <a href="#custom-plan" className="group inline-flex items-center gap-3 text-sm font-bold min-h-11 mt-5">Discuss Your Project <ArrowRight aria-hidden="true" className="w-4 h-4 text-creative-flame group-hover:translate-x-1 transition-transform" /></a>
                </div>
                <div className="lg:pl-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">What we can create</h3>
                  <ul className="divide-y divide-white/10">{service.capabilities.map(item => <li key={item} className="py-3 text-sm md:text-base text-white/85 flex gap-3"><span aria-hidden="true" className="text-creative-flame">/</span>{item}</li>)}</ul>
                  <p className="text-sm text-white/60 leading-relaxed mt-5"><span className="text-white/85 font-semibold">A good fit for: </span>{service.audience}</p>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>
      ))}
      <AnimatedSection>
        <section className="container-layout py-10 md:py-14">
          <p className="text-xs uppercase tracking-widest text-creative-flame font-bold mb-6">A stronger foundation. A clearer voice.</p>
          <div className="grid md:grid-cols-2 gap-5">
            {supporting.map(service => (
              <section key={service.id} id={service.id} className="scroll-mt-24 relative border border-white/10 rounded-xl p-6 md:p-8 bg-white/[0.025]">
                <div aria-hidden="true" className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-creative-flame rounded-tl-xl" />
                <h2 className="text-2xl font-bold mb-3">{service.title}</h2>
                <p className="text-sm text-white/70 leading-relaxed mb-5 max-w-md">{service.description}</p>
                <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-3 text-sm text-white/80">{service.capabilities.map(item => <li key={item}>{item}</li>)}</ul>
                <a href="#custom-plan" className="inline-flex items-center gap-3 min-h-11 mt-5 text-sm font-bold">Discuss Your Project <ArrowRight aria-hidden="true" className="w-4 h-4 text-creative-flame" /></a>
              </section>
            ))}
          </div>
        </section>
      </AnimatedSection>
      <AnimatedSection>
        <section id="custom-plan" className="scroll-mt-24 relative py-10 md:py-16">
          <div aria-hidden="true" className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,60,0.07),transparent_65%)] pointer-events-none" />
          <div className="container-layout relative grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-16 items-start">
            <div className="lg:pt-6">
              <p className="text-creative-flame text-xs uppercase tracking-widest font-bold mb-5">Your next project</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">Built around<br /><span className="text-creative-flame">your business.</span></h2>
              <p className="text-base md:text-lg text-white/70 leading-relaxed mb-5 max-w-md">Every project is scoped around your goals, deliverables and timeline. Share your requirements, and we&apos;ll prepare a tailored proposal.</p>
              <p className="text-sm text-white/60 leading-relaxed max-w-md">Need a single project or ongoing support? We&apos;ll agree the scope, schedule, revisions and investment with you before work begins. Any advertising spend, travel or third-party costs will be identified in your proposal.</p>
            </div>
            <CustomPlanForm />
          </div>
        </section>
      </AnimatedSection>
      <Footer />
    </main>
  );
}
