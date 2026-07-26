import Image from 'next/image';
import Link from 'next/link';

const events = [
  {
    id: 1,
    title: 'Ideomint Live — Volume 01',
    location: 'London, UK',
    date: '24 OCT',
    badgeColor: 'bg-signal-lime text-section-ink',
    image: '/event_vol01.png',
  },
  {
    id: 2,
    title: 'The Midnight Pulse',
    location: 'Berlin, DE',
    date: '12 NOV',
    badgeColor: 'bg-digital-pulse text-white',
    image: '/event_midnight.png',
  },
  {
    id: 3,
    title: 'The Open Forge',
    location: 'Amsterdam, NL',
    date: '05 DEC',
    badgeColor: 'bg-creative-flame text-white',
    image: '/event_open.png',
  },
  {
    id: 4,
    title: 'The Final Spark',
    location: 'Paris, FR',
    date: '31 DEC',
    badgeColor: 'bg-signal-lime text-section-ink',
    image: '/event_final.png',
  },
];

export default function UpcomingEvents() {
  return (
    <section id="events" className="text-white section-spacing relative">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-digital-pulse/15 rounded-full blur-[100px] translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-creative-flame/15 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />
      
      <div className="container-layout relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Heading Block */}
          <div className="flex flex-col justify-between w-full lg:w-[280px] shrink-0">
            <div>
              <div className="flex items-center gap-4 mb-6">
              <span className="text-creative-flame font-bold tracking-widest text-xs uppercase">04 / Live Events</span>
              <div className="h-px bg-white/20 w-12" />
            </div>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-black leading-[1.1] tracking-tight mb-8">
                Be part of the <span className="text-creative-flame">next experience.</span>
              </h2>
            </div>
            
            <Link href="#contact" className="flex items-center justify-center gap-2 bg-white text-section-ink px-8 py-4 md:px-6 md:py-3 rounded-full text-base md:text-sm font-bold hover:bg-white/90 transition-colors group w-full md:w-max mt-auto relative z-10">
              View All Events
            </Link>
          </div>

          {/* Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
            {events.map((event) => (
              <Link 
                href="#contact"
                key={event.id}
                className="group flex flex-col bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all duration-500 will-change-transform"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image 
                    src={event.image} 
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Date Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-sm font-bold text-xs tracking-widest uppercase ${event.badgeColor}`}>
                    {event.date}
                  </div>
                </div>
                
                {/* Content Panel */}
                <div className="p-6 flex flex-col flex-grow relative">
                  <h3 className="text-lg font-bold text-white mb-2 pr-12 leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-white/60 font-medium mt-auto pt-4">
                    {event.location}
                  </p>
                  
                  {/* Ticket Link */}
                  <div className="mt-6">
                    <span className="font-bold text-sm tracking-widest uppercase">Get Tickets</span>
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
