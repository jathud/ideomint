'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { archivePortfolio, publishPortfolio, savePortfolio, preparePortfolioUpload, completePortfolioUpload } from '@/app/admin/actions';
import { portfolioServices } from '@/lib/portfolio/categories';
import type { PortfolioContent, PortfolioRecord } from '@/lib/portfolio/validation';

const fieldClass = 'block w-full mt-2 rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-white focus:outline-creative-flame disabled:opacity-50';
const secondaryClass = 'border border-white/20 px-5 py-3 rounded-full text-sm font-bold hover:border-creative-flame disabled:opacity-40';
const labels: { key: Exclude<keyof PortfolioContent, 'services' | 'photos'>; label: string; max: number; multiline?: boolean }[] = [
  { key: 'title', label: 'Project title', max: 80 }, { key: 'subtitle', label: 'Subtitle / client', max: 100 },
  { key: 'description', label: 'Project overview', max: 1500, multiline: true }, { key: 'role', label: 'Capabilities / what we delivered', max: 300 },
  { key: 'location', label: 'Location', max: 120 }, { key: 'label', label: 'Attribution (client or our initiative)', max: 140 },
];

export default function PortfolioEditor({ initial }: { initial: PortfolioRecord }) {
  const [record, setRecord] = useState(initial);
  const [content, setContent] = useState(initial.draft);
  const [slug, setSlug] = useState(initial.slug);
  const [order, setOrder] = useState(initial.sort_order);
  const [featured, setFeatured] = useState(initial.featured);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const uploadRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (next: PortfolioContent) => { setContent(next); setDirty(true); setMessage(''); };
  const save = async () => {
    const result = await savePortfolio({ id: record.id, version: record.version, slug, content, sort_order: order, featured });
    if (!result.record) throw new Error(result.error || 'Saving failed.');
    setRecord(result.record); setContent(result.record.draft); setDirty(false);
    if (!record.version) window.history.replaceState(null, '', `/admin/work/${record.id}`);
    return result.record;
  };
  const run = async (task: () => Promise<void>) => {
    setBusy(true); setError(''); setMessage('');
    try { await task(); } catch (failure) { setError(failure instanceof Error ? failure.message : 'The request failed. Please try again.'); } finally { setBusy(false); }
  };
  const updatePhoto = (index: number, patch: Partial<PortfolioContent['photos'][number]>) => change({ ...content, photos: content.photos.map((photo, i) => i === index ? { ...photo, ...patch } : photo) });
  const movePhoto = (index: number, step: number) => {
    const photos = [...content.photos];
    const target = index + step;
    if (target < 0 || target >= photos.length) return;
    [photos[index], photos[target]] = [photos[target], photos[index]];
    change({ ...content, photos });
  };

  return <div>
    <Link href="/admin/work" onClick={event => { if (dirty && !window.confirm('Leave without saving your latest changes?')) event.preventDefault(); }} className="text-sm text-creative-flame">← All projects</Link>
    <div className="flex flex-wrap justify-between gap-4 items-end my-7"><div><h1 className="text-3xl md:text-4xl font-black tracking-tight">{record.version ? 'Edit project' : 'New project'}</h1><p className="text-xs text-white/50 mt-3 uppercase tracking-widest">{record.status} · {dirty ? 'Unsaved changes' : record.version ? 'Saved draft' : 'Not saved yet'}</p></div><p className="text-xs text-white/50 max-w-sm leading-relaxed">The first image is the cover. Images use the existing gallery frame, so new projects follow the same layout.</p></div>
    <form onSubmit={event => { event.preventDefault(); void run(async () => { await save(); setMessage('Draft saved. The published version is unchanged.'); }); }}>
      <fieldset disabled={busy} className="min-w-0">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
          <section className="min-w-0 space-y-5 border border-white/10 rounded-2xl p-5 md:p-7">
            <h2 className="text-xl font-bold">Project details</h2>
            {labels.map(field => <label key={field.key} className="block text-sm font-bold">{field.label}{field.multiline ? <textarea rows={4} maxLength={field.max} value={content[field.key]} onChange={event => change({ ...content, [field.key]: event.target.value })} className={fieldClass} /> : <input maxLength={field.max} value={content[field.key]} onChange={event => change({ ...content, [field.key]: event.target.value })} className={fieldClass} />}</label>)}
          </section>
          <section className="min-w-0 space-y-6 border border-white/10 rounded-2xl p-5 md:p-7 self-start">
            <h2 className="text-xl font-bold">Categories & publishing</h2>
            <fieldset><legend className="text-sm font-bold mb-3">Services (choose all that apply)</legend><div className="space-y-3">{portfolioServices.map(service => <label key={service} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={content.services.includes(service)} onChange={event => change({ ...content, services: event.target.checked ? [...content.services, service] : content.services.filter(value => value !== service) })} className="accent-creative-flame w-4 h-4" />{service}</label>)}</div></fieldset>
            <label className="block text-sm font-bold">Unique slug<input value={slug} onChange={event => { setSlug(event.target.value); setDirty(true); }} required maxLength={100} placeholder="ideofest-episode-02" className={fieldClass} /><span className="text-xs text-white/50 font-normal block mt-2">Lowercase words and hyphens. This identifies the project; it does not create a new public page.</span></label>
            <label className="block text-sm font-bold">Display order<input type="number" min={0} max={10000} step={1} value={order} onChange={event => { setOrder(Number(event.target.value)); setDirty(true); }} className={fieldClass} /><span className="text-xs font-normal text-white/50 mt-2 block">Smaller numbers appear first.</span></label>
            <label className="flex gap-3 items-center text-sm"><input type="checkbox" checked={featured} onChange={event => { setFeatured(event.target.checked); setDirty(true); }} className="accent-creative-flame w-4 h-4" />Feature in homepage portfolio</label>
            <p className="text-xs text-white/50 leading-relaxed">Publishing replaces the public snapshot. Saving alone does not publish. Archiving hides the project and keeps its images and history.</p>
          </section>
        </div>
        <section className="border border-white/10 rounded-2xl p-5 md:p-7 mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6"><div><h2 className="text-xl font-bold">Gallery images</h2><p className="text-sm text-white/50 mt-2">JPEG, PNG, WebP · up to 10 MB each · up to 60 images. Group names become gallery filters.</p></div><button type="button" disabled={!record.version || busy} onClick={() => uploadRef.current?.click()} className={secondaryClass}>Add images</button></div>
          {!record.version && <p className="text-sm text-creative-flame mb-5">Choose categories and a slug, then save the draft to enable uploads.</p>}
          <input ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" aria-label="Upload project images" onChange={event => {
            const files = Array.from(event.target.files ?? []); event.target.value = '';
            if (!files.length) return;
            void run(async () => {
              if (files.length + content.photos.length > 60) throw new Error('A project can have up to 60 images.');
              const photos = [...content.photos];
              const failures: string[] = [];
              for (const file of files) {
                const upload = await preparePortfolioUpload(record.id, file.type, file.size);
                if (!upload.key || !upload.signedUrl) { failures.push(`${file.name}: ${upload.error}`); continue; }
                try {
                  const body = new FormData(); body.append('cacheControl', '0'); body.append('', file);
                  const response = await fetch(upload.signedUrl, { method: 'PUT', body });
                  if (!response.ok) { failures.push(`${file.name}: Upload failed. Please try again.`); continue; }
                } catch { failures.push(`${file.name}: Upload connection failed. Please try again.`); continue; }
                const result = await completePortfolioUpload(record.id, upload.key);
                if (result.src) photos.push({ src: result.src, alt: '', theme: 'The Work' });
                else failures.push(`${file.name}: ${result.error}`);
              }
              change({ ...content, photos });
              if (failures.length) throw new Error(failures.join(' '));
              setMessage('Images uploaded privately. Add descriptions, save, and preview before publishing.');
            });
          }} />
          <div className="space-y-4">{content.photos.map((photo, index) => <div key={photo.src} className="grid sm:grid-cols-[120px_1fr] gap-4 p-4 border border-white/10 rounded-xl">
            <div><Image src={photo.src} alt="" width={120} height={90} unoptimized={photo.src.startsWith('/api/portfolio/media/')} className="w-full max-w-[160px] aspect-[4/3] object-cover rounded-lg" /><span className="text-xs text-creative-flame block mt-2">{index === 0 ? 'Cover / image 1' : `Image ${index + 1}`}</span></div>
            <div className="min-w-0"><label className="block text-xs font-bold">Image description<input maxLength={240} value={photo.alt} onChange={event => updatePhoto(index, { alt: event.target.value })} className={fieldClass} placeholder="Describe what appears in this image" /></label><label className="block mt-3 text-xs font-bold">Photo group<input maxLength={60} value={photo.theme} onChange={event => updatePhoto(index, { theme: event.target.value })} className={fieldClass} /></label><div className="flex flex-wrap gap-4 mt-3 text-xs"><button type="button" disabled={index === 0} onClick={() => movePhoto(index, -1)} className="min-h-11 disabled:opacity-30">Move up</button><button type="button" disabled={index === content.photos.length - 1} onClick={() => movePhoto(index, 1)} className="min-h-11 disabled:opacity-30">Move down</button><button type="button" onClick={() => { if (window.confirm('Remove this image from the draft? The original file and published gallery will remain until you republish.')) change({ ...content, photos: content.photos.filter((_, i) => i !== index) }); }} className="text-creative-flame min-h-11">Remove from draft</button></div></div>
          </div>)}</div>
        </section>
        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <button type="submit" className="rounded-full bg-creative-flame text-section-ink px-6 py-3 font-bold text-sm disabled:opacity-50">{busy ? 'Working…' : 'Save draft'}</button>
          <button type="button" className={secondaryClass} onClick={() => void run(async () => { const saved = await save(); router.push(`/admin/work/${saved.id}/preview`); })}>Save & preview</button>
          <button type="button" disabled={!record.version || dirty} className={secondaryClass} onClick={() => {
            if (!window.confirm('Publish the saved draft? It will replace this project’s public content.')) return;
            void run(async () => { const result = await publishPortfolio(record.id, record.version); if (result.error) throw new Error(result.error); setRecord({ ...record, status: 'published', version: record.version + 1 }); setMessage('Published snapshot saved. It appears on the homepage when CMS mode is enabled and the project is featured.'); router.refresh(); });
          }}>Publish saved draft</button>
          <button type="button" disabled={!record.version || dirty || record.status === 'archived'} className={`${secondaryClass} text-white/60`} onClick={() => {
            if (!window.confirm('Archive this project and remove it from the public portfolio? Images and revision history will be kept.')) return;
            void run(async () => { const result = await archivePortfolio(record.id, record.version); if (result.error) throw new Error(result.error); setRecord({ ...record, status: 'archived', version: record.version + 1 }); setMessage('Archived. The project can be edited and published again.'); router.refresh(); });
          }}>Archive</button>
        </div>
      </fieldset>
    </form>
    {error && <p role="alert" className="mt-5 text-sm leading-relaxed text-creative-flame">{error}</p>}
    <p role="status" className="mt-5 text-sm text-white/70">{message}</p>
  </div>;
}
