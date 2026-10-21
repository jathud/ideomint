import Header from './Header';
import Footer from '@/components/sections/Footer';

export default function StudioPage({ title, intro, sections }: {
  title: string; intro: string; sections: { title: string; text: string }[];
}) {
  return (
    <main className="bg-section-ink text-white min-h-screen">
      <Header />
      <article className="container-layout pt-36 pb-24 max-w-4xl">
        <p className="text-xs uppercase tracking-widest text-creative-flame font-bold mb-6">IdeoMint Studio</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-8">{title}</h1>
        <p className="text-lg text-white/80 leading-relaxed mb-12">{intro}</p>
        <div className="space-y-10">
          {sections.map(section => <section key={section.title}>
            <h2 className="text-xl font-bold mb-3">{section.title}</h2>
            <p className="text-white/75 leading-relaxed">{section.text}</p>
          </section>)}
        </div>
        <a className="inline-flex items-center min-h-12 mt-12 text-creative-flame font-bold underline underline-offset-4" href="mailto:hello@ideomint.com">hello@ideomint.com</a>
      </article>
      <Footer />
    </main>
  );
}
