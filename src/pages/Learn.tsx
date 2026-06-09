import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
 BookOpen, Zap, HelpCircle, Phone, FlaskConical, ChevronDown, Video,
 Lightbulb, AlertTriangle, Heart,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { VideoEmbed } from '../components/VideoEmbed';
import { ChipTabs } from '../components/ChipTabs';
import { Accordion } from '../components/Accordion';

interface MythFact { myth: string; fact: string; }

type LearnTab = 'facts' | 'myths' | 'more';

const AWARENESS_ICONS = [AlertTriangle, Heart, Lightbulb];

function MythCard({ item, isML }: { item: MythFact; isML: boolean }) {
 const [open, setOpen] = useState(false);
 return (
  <div className="card overflow-hidden">
   <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-2 transition-colors"
    aria-expanded={open}
   >
    <span className="shrink-0 text-[11px] font-bold tone-rose border px-2 py-0.5 rounded-md mt-0.5 text-red-600 dark:text-red-400">
     MYTH
    </span>
    <p className={`text-sm text-primary font-medium flex-1 leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {item.myth}
    </p>
    <ChevronDown
     size={15}
     className={`shrink-0 text-muted mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    />
   </button>
   {open && (
    <div className="accordion-body border-t border-border px-4 pb-4 pt-3 flex items-start gap-3">
     <span className="shrink-0 text-[11px] font-bold tone-teal border px-2 py-0.5 rounded-md mt-0.5 text-teal-700 dark:text-teal-400">
      FACT
     </span>
     <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {item.fact}
     </p>
    </div>
   )}
  </div>
 );
}

const VIDEO_SLOTS = [
 { id: 'VERIFY_VIDEO_TOOFAN', titleKey: 'learn.videos.slot1' },
 { id: 'VERIFY_VIDEO_VIMUKTHI', titleKey: 'learn.videos.slot2' },
];

export function Learn() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const [tab, setTab] = useState<LearnTab>('facts');
 const [activeFact, setActiveFact] = useState(0);

 const myths = t('learn.sections.myths.items', { returnObjects: true }) as MythFact[];
 const awareness = t('learn.awareness', { returnObjects: true }) as string[];

 const tabs = [
  { id: 'facts' as const, label: t('learn.tabs.facts'), icon: <Lightbulb size={13} /> },
  { id: 'myths' as const, label: t('learn.tabs.myths'), icon: <HelpCircle size={13} /> },
  { id: 'more' as const, label: t('learn.tabs.more'), icon: <BookOpen size={13} /> },
 ];

 return (
  <div className="flex flex-col gap-6">
   <div className="flex items-start gap-3">
    <div className="w-10 h-10 tone-indigo border rounded-xl flex items-center justify-center shrink-0">
     <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
     <h1 className={`heading-text text-2xl font-extrabold text-primary ${isML ? 'ml-text' : ''}`}>
      {t('learn.heading')}
     </h1>
     <p className={`text-secondary text-sm mt-0.5 leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('learn.intro')}
     </p>
    </div>
   </div>

   <ChipTabs tabs={tabs} active={tab} onChange={setTab} isML={isML} />

   {tab === 'facts' && (
    <section className="flex flex-col gap-4 fade-up">
     {Array.isArray(awareness) && awareness.length > 0 && (
      <>
       <div className="grid grid-cols-3 gap-2">
        {awareness.map((_text, i) => {
         const Icon = AWARENESS_ICONS[i % AWARENESS_ICONS.length];
         const selected = activeFact === i;
         return (
          <button
           key={i}
           type="button"
           onClick={() => setActiveFact(i)}
           className={`flex flex-col items-center gap-2 p-3 rounded-card border text-center transition-all ${
            selected
             ? 'tone-teal border ring-2 ring-accent/30'
             : 'bg-surface border-border hover:border-border-strong'
           }`}
           aria-pressed={selected}
          >
           <Icon size={18} className={selected ? 'text-accent' : 'text-muted'} />
           <span className={`text-[10px] font-bold text-muted ${isML ? 'ml-text' : ''}`}>
            {i + 1}
           </span>
          </button>
         );
        })}
       </div>
       <div key={activeFact} className="tone-teal border rounded-card p-4 fade-up">
        <p className={`text-sm text-primary font-medium leading-relaxed ${isML ? 'ml-text' : ''}`}>
         {awareness[activeFact]}
        </p>
       </div>
      </>
     )}

     <Accordion
      title={t('learn.sections.synthetic.title')}
      icon={<FlaskConical size={15} className="text-indigo-500" />}
      tone="tone-indigo border"
      isML={isML}
     >
      <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
       {t('learn.sections.synthetic.content')}
      </p>
     </Accordion>

     <Accordion
      title={t('learn.sections.effects.title')}
      icon={<Zap size={15} className="text-rose-500" />}
      tone="tone-rose border"
      isML={isML}
     >
      <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
       {t('learn.sections.effects.content')}
      </p>
     </Accordion>
    </section>
   )}

   {tab === 'myths' && (
    <section className="flex flex-col gap-2 fade-up">
     <p className={`text-xs text-muted mb-1 ${isML ? 'ml-text' : ''}`}>
      {t('learn.mythsHint')}
     </p>
     {myths.map((item, i) => (
      <MythCard key={i} item={item} isML={isML} />
     ))}
    </section>
   )}

   {tab === 'more' && (
    <section className="flex flex-col gap-4 fade-up">
     <div>
      <div className="flex items-center gap-2 mb-3">
       <Video size={17} className="text-secondary" />
       <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
        {t('learn.videos.heading')}
       </h2>
      </div>
      <div className="flex flex-col gap-4">
       {VIDEO_SLOTS.map((v) => (
        <VideoEmbed key={v.id} videoId={v.id} title={t(v.titleKey)} />
       ))}
      </div>
     </div>

     <div className="cta-banner flex flex-col gap-3">
      <div className="flex items-center gap-2">
       <Phone size={16} />
       <h2 className={`heading-text font-bold text-base ${isML ? 'ml-text' : ''}`}>
        {t('learn.sections.help.title')}
       </h2>
      </div>
      <p className={`text-sm leading-relaxed ${isML ? 'ml-text' : ''}`}>
       {t('learn.sections.help.content')}
      </p>
      <PhoneLink
       phone="14405"
       label="Vimukthi Counselling"
       className="inline-flex items-center gap-2 bg-surface text-teal-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors self-start"
      >
       <Phone size={14} />
       14405 — Vimukthi
      </PhoneLink>
     </div>
    </section>
   )}
  </div>
 );
}
