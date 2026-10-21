'use client';
import { useState } from 'react';
import { importLegacyPortfolio } from '@/app/admin/actions';
import { useRouter } from 'next/navigation';
export default function LegacyImport() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  return <div><button disabled={pending} className="text-sm border border-white/20 px-5 py-3 rounded-full hover:border-creative-flame disabled:opacity-50" onClick={async () => {
    if (!window.confirm('Import IdeoFest and Choice to Lead as private drafts? Existing projects and local images will not be overwritten.')) return;
    setPending(true);
    try { const result = await importLegacyPortfolio(); setMessage(result.error ?? `${result.count} drafts imported. Nothing was published.`); router.refresh(); }
    catch { setMessage('Import failed. Please retry.'); } finally { setPending(false); }
  }}>{pending ? 'Importing…' : 'Import existing work as drafts'}</button><p role="status" className="text-xs text-white/60 mt-3">{message}</p></div>;
}
