import { useState, useEffect, useRef } from 'react';
import { Phone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HelplineActions } from './HelplineActions';
import { useAppData } from '../context/DataContext';
import { isPlaceholderValue } from '../utils/verify';

export function ContactBar() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { data } = useAppData();
 const [open, setOpen] = useState(false);
 const panelRef = useRef<HTMLDivElement>(null);

 const helplines = (data?.helplines ?? []).filter(
  (h) => !isPlaceholderValue(h.value),
 );

 useEffect(() => {
  if (!open) return;
  const onKey = (e: KeyboardEvent) => {
   if (e.key === 'Escape') setOpen(false);
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
 }, [open]);

 if (helplines.length === 0) return null;

 return (
  <div
   className="fixed z-50 flex flex-col items-end gap-2"
   style={{
    bottom: 'max(1rem, env(safe-area-inset-bottom))',
    right: 'max(1rem, env(safe-area-inset-right))',
   }}
  >
   {open && (
    <>
     <button
      type="button"
      className="fixed inset-0 z-[-1] bg-black/20 backdrop-blur-[1px]"
      aria-label="Close helplines"
      onClick={() => setOpen(false)}
     />
     <div
      ref={panelRef}
      className="w-[min(20rem,calc(100vw-2rem))] bg-surface rounded-card border border-border shadow-elevated p-4 fade-up"
      role="dialog"
      aria-label={t('contactBar.title')}
     >
      <div className="flex items-center justify-between gap-2 mb-3">
       <p className={`text-sm font-bold text-primary ${isML ? 'ml-text' : ''}`}>
        {t('contactBar.title')}
       </p>
       <button
        type="button"
        onClick={() => setOpen(false)}
        className="icon-btn shrink-0"
        aria-label="Close"
       >
        <X size={16} />
       </button>
      </div>
      <HelplineActions layout="stack" onAction={() => setOpen(false)} />
     </div>
    </>
   )}

   <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className={[
     'w-14 h-14 rounded-full shadow-elevated flex items-center justify-center transition-all',
     open
      ? 'bg-surface border border-border text-secondary'
      : 'bg-red-600 text-white hover:bg-red-700',
    ].join(' ')}
    aria-label={open ? 'Close helplines' : t('contactBar.title')}
    aria-expanded={open}
   >
    {open ? <X size={22} /> : <Phone size={22} />}
   </button>
  </div>
 );
}
