'use client';

import React from 'react';
import { Palette, Megaphone, Camera, User } from 'lucide-react';
import Header from '@/components/ui/Header';
import Footer from '@/components/sections/Footer';
import PricingCard from './PricingCard';
import CustomPlanForm from './CustomPlanForm';
import WorkingTerms from './WorkingTerms';
import AnimatedSection from '@/components/ui/AnimatedSection';

/* ────────────────────────────────────
   ADD-ON DATA
   ──────────────────────────────────── */
const addOns = [
  { name: 'Extra static post', price: '2,000' },
  { name: 'Extra carousel post', price: '3,000' },
  { name: 'Extra short reel (existing footage)', price: '4,000' },
  { name: 'Extra short reel with filming', price: '7,500' },
  { name: 'Extra 2-hour shoot session', price: '15,000' },
  { name: 'Half-day shoot', price: '25,000' },
  { name: 'Full-day shoot', price: '45,000' },
  { name: 'Product photography session', price: '20,000' },
  { name: 'Event photography', price: '25,000' },
  { name: 'Event videography / aftermovie', price: '45,000' },
  { name: 'Social-media ad setup', price: '10,000' },
  { name: 'Website landing page', price: '45,000' },
  { name: 'Full website', price: 'Custom' },
  { name: 'Packaging design', price: '15,000' },
  { name: 'Menu or brochure design', price: '10,000' },
  { name: 'Additional revision round', price: '3,000' },
];

/* ────────────────────────────────────
   CATEGORY NAV ITEMS
   ──────────────────────────────────── */
const categories = [
  { icon: Palette, label: 'Build Your Brand', anchor: '#build-brand', color: 'text-creative-flame' },
  { icon: Megaphone, label: 'Grow Your Presence', anchor: '#grow-presence', color: 'text-signal-lime' },
  { icon: Camera, label: 'Create Better Content', anchor: '#create-content', color: 'text-digital-pulse' },
  { icon: User, label: 'Build Your Personal Brand', anchor: '#personal-brand', color: 'text-creative-flame' },
];

/* ════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════ */
export default function ServicesContent() {
  return (
    <main className="min-h-screen bg-section-ink selection:bg-creative-flame selection:text-white overflow-hidden w-full relative">
      <div className="noise-overlay" />
      <Header />

      {/* ━━━━ HERO ━━━━ */}
      <section className="relative text-white pt-32 lg:pt-40 pb-16 lg:pb-24">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-creative-flame/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-digital-pulse/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-layout relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                Services &amp; Pricing
              </span>
              <div className="h-px bg-white/20 w-12" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              What We Help You{' '}
              <span className="text-creative-flame">Build</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl">
              Ideomint helps businesses and people become clear, visible, and
              memorable through branding, content, social media, and personal
              brand growth.
            </p>
          </div>

          {/* Category Navigation Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {categories.map((cat) => (
              <a
                key={cat.label}
                href={cat.anchor}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-h-[140px] flex flex-col items-center justify-center text-center gap-4 group hover:bg-white/[0.08] hover:border-white/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className={`w-6 h-6 ${cat.color}`} />
                </div>
                <span className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors leading-tight">
                  {cat.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━ 01 / BUILD YOUR BRAND ━━━━ */}
      <AnimatedSection>
        <section id="build-brand" className="text-white section-spacing relative">
          <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-creative-flame/10 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

          <div className="container-layout relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  01 / Build Your Brand
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-6">
                Make your business look{' '}
                <span className="text-creative-flame">clear, professional, and memorable.</span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed mb-6">
                From your logo to your colours, visual style, and brand direction,
                we help create a brand people can recognise and trust.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  'Brand discovery session', 'Logo design', 'Brand colours and fonts',
                  'Brand style direction', 'Basic brand guide', 'Social-media profile look',
                  'Launch templates', 'Business-card or stationery design',
                ].map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <p className="text-sm text-white/50 leading-relaxed">
                <span className="text-white/70 font-bold">Best for:</span> New businesses, businesses that look outdated, or businesses that want a more premium identity.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
              <PricingCard
                name="Brand Start"
                price="From LKR 45,000"
                description="For new businesses ready to look professional from day one."
                features={[
                  'Brand discovery call',
                  'One main logo concept',
                  'Up to 2 logo revisions',
                  'Final logo files',
                  'Brand colour palette',
                  'Font recommendations',
                  'Basic social-media profile image and cover',
                  '3 social-media launch templates',
                  'Mini brand guide',
                ]}
                exclusions={[
                  'Website',
                  'Monthly social-media management',
                  'Photography or videography',
                  'Packaging design',
                  'Printing costs',
                ]}
              />
              <PricingCard
                name="Brand Build"
                price="From LKR 95,000"
                description="For businesses ready for a complete and memorable identity."
                features={[
                  'Brand discovery and strategy session',
                  'Brand positioning direction',
                  'Main logo and logo variations',
                  'Colour and typography system',
                  'Brand pattern or visual element',
                  'Social-media profile kit',
                  '6 social-media launch templates',
                  'Business-card design',
                  'Letterhead or quotation template',
                  'Brand guideline PDF',
                  'Presentation mockups',
                ]}
                exclusions={[
                  'Website',
                  'Monthly content',
                  'Photography or videography',
                  'Packaging',
                  'Printing costs',
                ]}
              />
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ━━━━ 02 / GROW YOUR PRESENCE ━━━━ */}
      <AnimatedSection>
        <section id="grow-presence" className="text-white section-spacing relative">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-signal-lime/8 rounded-full blur-[140px] translate-x-1/4 pointer-events-none" />

          <div className="container-layout relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  02 / Grow Your Presence
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-6">
                Stay active online and help more people{' '}
                <span className="text-creative-flame">discover your business.</span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed mb-6">
                We plan, design, write, and manage your social media so your
                business stays active, professional, and organised every month.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <p className="text-xs text-white/50 leading-relaxed">
                  <span className="text-white/70 font-bold">Note:</span> Social-media content can be created using client-provided photos and videos, existing brand materials, motion graphics, or separately booked content shoots. Professional photography and video shoots are not automatically included in monthly social-media packages.
                </p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                name="Start"
                price="From LKR 25,000"
                period="per month"
                description="For businesses beginning to post consistently."
                features={[
                  'Facebook and Instagram management',
                  '4 static or carousel posts',
                  '2 short reels',
                  'Captions and hashtags',
                  'Monthly posting plan',
                  'Posting and scheduling',
                  'Basic profile review',
                  'Monthly performance update',
                  '1 revision per design',
                ]}
              />
              <PricingCard
                name="Grow"
                price="From LKR 42,000"
                period="per month"
                description="For businesses that want to look active, professional, and consistent online."
                isFeatured
                featuredLabel="Most Chosen"
                features={[
                  'Facebook and Instagram management',
                  '8 static or carousel posts',
                  '4 short reels',
                  'Captions and hashtags',
                  'Monthly content calendar',
                  'Posting and scheduling',
                  'Profile improvement',
                  'Basic competitor review',
                  'Monthly performance report',
                  'One monthly planning call',
                  '2 revisions per design',
                ]}
              />
              <PricingCard
                name="Lead"
                price="From LKR 65,000"
                period="per month"
                description="For businesses ready for stronger visibility, campaigns, and consistent growth."
                features={[
                  'Facebook and Instagram management',
                  '12 static or carousel posts',
                  '6 short reels',
                  'Captions and hashtag research',
                  'Full monthly content calendar',
                  'Monthly campaign idea',
                  'Profile improvement',
                  'Monthly strategy meeting',
                  'Monthly performance report',
                  'Basic ad creative support',
                  'Basic comment and message guidance',
                  '2 revisions per design',
                ]}
              />
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 max-w-md">
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-white/70 font-bold">Note:</span> Paid advertising budget is not included. Ad spend is paid separately by the client.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ━━━━ 03 / CREATE BETTER CONTENT ━━━━ */}
      <AnimatedSection>
        <section id="create-content" className="text-white section-spacing relative">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-digital-pulse/10 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

          <div className="container-layout relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  03 / Create Better Content
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-6">
                Photos, videos, reels, and visuals that make people{' '}
                <span className="text-creative-flame">stop and notice.</span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed mb-6">
                We create the photos, videos, reels, posters, and campaign visuals
                your brand needs to look professional and stand out online.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  'Product photography', 'Business photography', 'Reels and short videos',
                  'Promotional videos', 'Founder or team videos', 'Posters and campaign designs',
                  'Event photography', 'Event aftermovies', 'Video editing',
                  'Script and content idea support',
                ].map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/50 leading-relaxed">
                  <span className="text-white/70 font-bold">Note:</span> You can book content creation as a one-time project or add it to your monthly social-media package.
                </p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                name="Content Starter"
                price="From LKR 20,000"
                period="per project"
                description="For businesses that need a few strong visuals."
                features={[
                  '4 post designs',
                  '2 edited short reels',
                  'Captions for delivered content',
                  'Ready-to-post files',
                  '1 revision per design',
                ]}
              />
              <PricingCard
                name="Content Growth"
                price="From LKR 35,000"
                period="per project"
                description="For businesses that want a stronger batch of professional content."
                features={[
                  '8 post designs',
                  '4 edited short reels',
                  'Captions',
                  'One content planning discussion',
                  'Ready-to-post files',
                  '2 revisions per design',
                ]}
              />
              <PricingCard
                name="Content Campaign"
                price="From LKR 60,000"
                period="per project"
                description="For launches, promotions, seasonal offers, and campaign announcements."
                features={[
                  'Campaign concept',
                  '12 post designs',
                  '6 edited short reels',
                  'Caption writing',
                  'Story templates',
                  'Campaign content calendar',
                  'Promotional visual direction',
                  '2 revisions per design',
                ]}
              />
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 max-w-lg">
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-white/70 font-bold">Note:</span> Photography and video shoots are charged separately based on location, duration, crew, equipment, travel, and editing requirements.
              </p>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ━━━━ 04 / BUILD YOUR PERSONAL BRAND ━━━━ */}
      <AnimatedSection>
        <section id="personal-brand" className="text-white section-spacing relative">
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-creative-flame/10 rounded-full blur-[120px] translate-x-1/3 pointer-events-none" />

          <div className="container-layout relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  04 / Build Your Personal Brand
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-6">
                Be known for the{' '}
                <span className="text-creative-flame">right thing.</span>
              </h2>

              <p className="text-lg text-white/70 leading-relaxed mb-6">
                We help founders, professionals, creators, YouTubers, speakers,
                musicians, trainers, and public-facing people build a clear online
                identity through strategy, filming, content, and consistent storytelling.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  'Personal brand strategy', 'Profile and bio improvement',
                  'Personal visual identity', 'Content topics and video ideas',
                  'Instagram, TikTok, YouTube, LinkedIn', 'Monthly content plan',
                  'Video shoot sessions', 'Reel filming and editing',
                  'Script support', 'Thumbnail direction',
                  'Caption support', 'Posting guidance',
                ].map((s) => (
                  <span
                    key={s}
                    className="text-xs font-medium text-white/50 bg-white/5 border border-white/10 rounded-full px-4 py-2"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="bg-creative-flame/10 border border-creative-flame/20 rounded-xl p-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  <span className="text-creative-flame font-bold">Our promise:</span> We do not promise fame, followers, or viral videos. We help you build a clear, professional, and consistent online presence so people understand who you are and why they should follow you.
                </p>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <PricingCard
                name="Personal Start"
                price="From LKR 40,000"
                period="per month"
                description="For people taking their first serious step online."
                features={[
                  'Personal brand discussion',
                  'Bio and profile improvement',
                  'Content direction',
                  '4 branded posts',
                  '2 short reels',
                  'One short shoot session per month (up to 2 hours, one location)',
                  '30-day content ideas',
                  'Ready-to-post files',
                  'Basic posting guidance',
                ]}
              />
              <PricingCard
                name="Personal Grow"
                price="From LKR 65,000"
                period="per month"
                description="For founders, professionals, creators, and speakers who want to show up consistently."
                isFeatured
                featuredLabel="Recommended"
                features={[
                  'Personal brand strategy session',
                  'Personal visual identity direction',
                  'Profile optimisation',
                  '8 branded posts',
                  '4 short reels',
                  'One half-day content shoot per month (up to 4 hours, one location)',
                  'Video ideas and script support',
                  'Monthly content calendar',
                  'Caption support',
                  'Monthly review call',
                  'Ready-to-post content files',
                ]}
              />
              <PricingCard
                name="Personal Lead"
                price="From LKR 95,000"
                period="per month"
                description="For serious creators, YouTubers, founders, musicians, and public-facing professionals."
                features={[
                  'Full personal-brand positioning',
                  'Personal visual identity direction',
                  'Instagram, TikTok, LinkedIn, or YouTube content direction',
                  '12 branded posts',
                  '6 to 8 short reels',
                  'Two content shoot sessions per month (each up to 4 hours)',
                  'Script support',
                  'Video editing',
                  'Caption support',
                  'Monthly content calendar',
                  'Monthly strategy review',
                  'Thumbnail direction for YouTube or long-form content',
                  'Personal brand collaboration-readiness guidance',
                ]}
              />
            </div>

            <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4 max-w-md">
              <p className="text-xs text-white/50 leading-relaxed">
                <span className="text-white/70 font-bold">Note:</span> Long YouTube videos are not included unless clearly stated in the proposal.
              </p>
            </div>

            {/* YouTube Add-On Card */}
            <div className="mt-12 max-w-lg">
              <h3 className="text-sm font-bold text-signal-lime uppercase tracking-widest mb-4">
                YouTube Content Add-On
              </h3>
              <div className="bg-signal-lime/5 backdrop-blur-md border border-signal-lime/20 rounded-2xl p-6 md:p-8">
                <div className="mb-4">
                  <span className="text-2xl font-black text-signal-lime">
                    From LKR 45,000
                  </span>
                  <span className="text-sm text-white/50 font-medium ml-2">
                    per month
                  </span>
                </div>
                <ul className="flex flex-col gap-2 mb-4">
                  {[
                    '2 long-form YouTube videos per month (up to 8–10 min each)',
                    '4 YouTube Shorts created from the same content',
                    'Basic video editing',
                    'Thumbnail design',
                    'Title and description suggestions',
                    'Upload-ready files',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-signal-lime shrink-0 mt-2" />
                      <span className="text-sm text-white/70 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-white/40 leading-relaxed">
                  Does not include full-day shooting, travel outside agreed area, studio rental, complex cinematic editing, heavy animation, or extra long-form videos. Creators who need more can request a custom plan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ━━━━ ADD-ON SERVICES ━━━━ */}
      <AnimatedSection>
        <section className="text-white section-spacing relative">
          <div className="container-layout relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                  Extras
                </span>
                <div className="h-px bg-white/20 w-12" />
              </div>

              <h2 className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4">
                Need a Little{' '}
                <span className="text-creative-flame">More?</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {addOns.map((addon) => (
                <div
                  key={addon.name}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <span className="text-sm text-white/70 font-medium leading-tight">
                    {addon.name}
                  </span>
                  <span className="text-xs font-bold text-creative-flame whitespace-nowrap">
                    {addon.price === 'Custom'
                      ? 'Custom'
                      : `LKR ${addon.price}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ━━━━ CUSTOM PLAN ━━━━ */}
      <AnimatedSection>
        <section id="custom-plan" className="text-white section-spacing relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-creative-flame/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-digital-pulse/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container-layout relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Column */}
              <div className="flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">
                    Custom Plan
                  </span>
                  <div className="h-px bg-white/20 w-12" />
                </div>

                <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-6">
                  Need Something{' '}
                  <span className="text-creative-flame">Different?</span>
                </h2>

                <p className="text-lg text-white/70 leading-relaxed mb-8">
                  Every business is at a different stage. Tell us what you need,
                  and we will create a plan based on your goals, budget, and timeline.
                </p>

                {/* Working Terms */}
                <div className="mt-auto">
                  <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">
                    Simple Working Terms
                  </h3>
                  <WorkingTerms />
                </div>
              </div>

              {/* Right Column — Form */}
              <CustomPlanForm />
            </div>
          </div>
        </section>
      </AnimatedSection>

      <Footer />
    </main>
  );
}
