import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';

interface QA { q: string; a: string }

const EXTRAS: Record<number, { linkKey?: string; route?: string; contactIds?: string[] }> = {
  0: { linkKey: 'rights', route: '/rights' },
  1: { linkKey: 'report', route: '/resources?category=report' },
  2: { contactIds: ['vimukthi-14405'] },
  3: { linkKey: 'getHelp', route: '/get-help' },
  5: { linkKey: 'worried', route: '/worried', contactIds: ['childline-1098'] },
};

function AssistantAvatar() {
 return (
  <div
   className="shrink-0 w-7 h-7 rounded-full tone-indigo border flex items-center justify-center"
   aria-hidden="true"
  >
   <HelpCircle size={13} className="text-indigo-600" />
  </div>
 );
}

function FaqAnswer({
 index, item, isML, data,
}: {
 index: number;
 item: QA;
 isML: boolean;
 data: ReturnType<typeof useAppData>['data'];
}) {
 const { t } = useTranslation();
 const extra = EXTRAS[index];
 const contacts = extra?.contactIds ? findContacts(data, extra.contactIds) : [];

 return (
  <div className="flex items-start gap-2 fade-up">
   <AssistantAvatar />
   <div className={`min-w-0 max-w-[92%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3 flex flex-col gap-2.5 ${isML ? 'ml-text' : ''}`}>
    <p className="text-sm text-secondary leading-relaxed">{item.a}</p>
    {contacts.length > 0 && (
     <div className="flex flex-wrap gap-2">
      {contacts.map((c) => <ContactAction key={c.id} contact={c} />)}
     </div>
    )}
    {extra?.linkKey && extra.route && (
     <Link
      to={extra.route}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:opacity-80"
     >
      {t(`faq.links.${extra.linkKey}`)}
      <ArrowRight size={14} />
     </Link>
    )}
   </div>
  </div>
 );
}

export function Faq() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { data } = useAppData();
 const bottomRef = useRef<HTMLDivElement>(null);

 const items = t('faq.items', { returnObjects: true }) as QA[];
 const [picked, setPicked] = useState<number[]>([]);

 const pickQuestion = (index: number) => {
  setPicked((prev) => [...prev, index]);
 };

 const resetChat = () => setPicked([]);

 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
 }, [picked]);

 return (
  <div className="flex flex-col gap-3">
   <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
    {/* Chat header */}
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2">
     <div className="flex items-center gap-2.5 min-w-0">
      <AssistantAvatar />
      <div className="min-w-0">
       <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
        {t('faq.heading')}
       </p>
       <p className={`text-[11px] text-muted truncate ${isML ? 'ml-text' : ''}`}>
        {t('appName')} · {t('guide.chatPrivate')}
       </p>
      </div>
     </div>
     {picked.length > 0 && (
      <button type="button" onClick={resetChat} className="btn-ghost py-1.5 px-2.5 text-xs shrink-0">
       <RotateCcw size={13} />
       <span className={isML ? 'ml-text' : ''}>{t('guide.startOver')}</span>
      </button>
     )}
    </div>

    {/* Messages */}
    <div
     className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3"
     role="log"
     aria-live="polite"
     aria-relevant="additions"
    >
     <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className={`max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5 ${isML ? 'ml-text' : ''}`}>
       <p className="text-sm text-secondary leading-relaxed">{t('faq.intro')}</p>
      </div>
     </div>

     <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className={`max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5 ${isML ? 'ml-text' : ''}`}>
       <p className="text-sm font-semibold text-primary leading-relaxed">{t('faq.chatPickQuestion')}</p>
      </div>
     </div>

     {Array.isArray(items) && picked.map((index, turn) => {
      const item = items[index];
      if (!item) return null;
      return (
       <div key={`${index}-${turn}`} className="flex flex-col gap-3">
        <div className="flex justify-end fade-up">
         <div className={`max-w-[88%] rounded-2xl rounded-tr-md bg-accent text-accent-text px-3.5 py-2.5 shadow-sm ${isML ? 'ml-text' : ''}`}>
          <p className="text-sm font-semibold leading-relaxed">{item.q}</p>
         </div>
        </div>
        <FaqAnswer index={index} item={item} isML={isML} data={data} />
       </div>
      );
     })}

     <div ref={bottomRef} aria-hidden="true" />
    </div>

    {/* Question chips */}
    {Array.isArray(items) && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3 flex flex-col items-center text-center">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
      <div className="flex flex-wrap justify-center gap-1.5 max-h-[7.5rem] overflow-y-auto w-full scrollbar-none">
       {items.map((item, i) => (
        <button
         key={i}
         type="button"
         onClick={() => pickQuestion(i)}
         className={`rounded-full border border-border-strong bg-surface-2 px-3 py-1.5 text-xs font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors text-left max-w-full ${isML ? 'ml-text' : ''}`}
        >
         {item.q}
        </button>
       ))}
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
