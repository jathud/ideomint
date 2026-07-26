import Image from 'next/image';
import Link from 'next/link';

const projects = [
  {
    id: 1,
    title: 'The Sound Experience',
    subtitle: 'Concept — Live Concert',
    category: 'Event Branding',
    image: '/work_sound.png',
  },
  {
    id: 2,
    title: 'Echoes of Us',
    subtitle: 'Concept — Music Festival',
    category: 'Visual Identity',
    image: '/work_echoes.png',
  },
  {
    id: 3,
    title: 'Urban Monkey',
    subtitle: 'Concept — Streetwear Brand',
    category: 'Brand Design',
    image: '/work_monkey.png',
  },
  {
    id: 4,
    title: 'Cloud 9 Experiences',
    subtitle: 'Concept — Digital Campaign',
    category: 'Marketing Design',
    image: '/work_cloud9.png',
  },
];

export default function FeaturedWork() {
  return (
    <section id="work" className="text-white section-spacing relative">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-creative-flame/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-digital-pulse/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Heading Block */}
          <div className="flex flex-col justify-between w-full lg:w-[280px] shrink-0">
            <div>
              <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">03 / Featured Work</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                Our vision. <span className="text-creative-flame">Your potential.</span>
              </h2>
            </div>
            
            <Link href="#contact" className="flex items-center gap-2 text-white font-bold hover:text-creative-flame transition-colors group mt-auto pb-4 w-max p-2 -ml-2">
              <span className="text-sm">Start a Project</span>
            </Link>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {projects.map((project) => (
              <Link 
                href="#contact"
                key={project.id}
                className="group flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 will-change-transform"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image 
                    src={project.image} 
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle Top Overlay for gradient if needed */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Content Panel */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {project.title}
                  </h3>
                  <p className="text-sm text-white/70 font-medium mb-6">
                    {project.subtitle}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs font-bold text-creative-flame">
                      {project.category}
                    </p>
                    <span className="text-xs font-bold text-white">View Concept</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
