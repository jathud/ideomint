import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const insights = [
  {
    id: 1,
    category: 'Strategy',
    title: 'The Evolution of Experiential Marketing in 2026',
    date: 'Oct 12, 2026',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
    color: 'creative-flame'
  },
  {
    id: 2,
    category: 'Design',
    title: 'Designing for the Senses: Beyond Visual Interfaces',
    date: 'Sep 28, 2026',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop',
    color: 'signal-lime'
  },
  {
    id: 3,
    category: 'Culture',
    title: 'How Music Festivals Shape Brand Architecture',
    date: 'Sep 15, 2026',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop',
    color: 'digital-pulse'
  }
];

export default function Insights() {
  return (
    <section id="insights" className="section-spacing text-white relative">
      <div className="container-layout">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 lg:gap-8 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">06 / Ideomint Raw</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              Building in public.<br />
              <span className="text-white/40">Raw & unfiltered.</span>
            </h2>
          </div>
          <Link href="#contact" className="flex items-center gap-2 text-sm font-bold text-white hover:text-digital-pulse transition-colors group pb-2 w-max mt-4 md:mt-0 p-2 -ml-2 md:m-0">
            View All Articles
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {insights.map((article) => (
            <Link href="#contact" key={article.id} className="group cursor-pointer flex flex-col">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                <Image 
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-section-ink/20 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  article.color === 'creative-flame' ? 'text-creative-flame' :
                  article.color === 'signal-lime' ? 'text-signal-lime' :
                  'text-digital-pulse'
                }`}>
                  {article.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span className="text-xs text-white/50 font-medium">{article.date}</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-4 line-clamp-2 group-hover:text-white/80 transition-colors">
                {article.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm font-bold text-white/40 group-hover:text-white transition-colors mt-auto">
                Read Article
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
