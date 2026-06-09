import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
 Scale, AlertTriangle, CheckCircle, XCircle, EyeOff, PhoneCall, ShieldCheck, Gavel,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { ChipTabs } from '../components/ChipTabs';
import { Accordion } from '../components/Accordion';

type RightsTab = 's64a' | 'confidentiality' | 'legalAid';

export function Rights() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const [tab, setTab] = useState<RightsTab>('s64a');

 const whatPoints = t('rights.s64a.whatPoints', { returnObjects: true }) as string[];
 const conditions = t('rights.s64a.conditions', { returnObjects: true }) as string[];
 const limitations = t('rights.s64a.limitations', { returnObjects: true }) as string[];

 const tabs = [
  { id: 's64a' as const, label: t('rights.tabs.s64a'), icon: <Gavel size={13} /> },
  { id: 'confidentiality' as const, label: t('rights.tabs.confidentiality'), icon: <EyeOff size={13} /> },
  { id: 'legalAid' as const, label: t('rights.tabs.legalAid'), icon: <ShieldCheck size={13} /> },
 ];

 return (
  <div className="flex flex-col gap-6">
   <div className="flex items-start gap-3">
    <div className="w-10 h-10 tone-indigo border rounded-xl flex items-center justify-center shrink-0">
     <Scale size={20} className="text-indigo-600 dark:text-indigo-400" />
    </div>
    <div>
     <h1 className={`heading-text text-2xl font-extrabold text-primary ${isML ? 'ml-text' : ''}`}>
      {t('rights.heading')}
     </h1>
     <p className={`text-secondary text-sm mt-0.5 leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('rights.intro')}
     </p>
    </div>
   </div>

   <Accordion
    title={t('rights.disclaimerShort')}
    icon={<AlertTriangle size={15} className="text-red-500" />}
    tone="tone-red border"
    isML={isML}
   >
    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('rights.disclaimer')}
    </p>
   </Accordion>

   <ChipTabs tabs={tabs} active={tab} onChange={setTab} isML={isML} />

   {tab === 's64a' && (
    <section className="flex flex-col gap-3 fade-up">
     <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
      {t('rights.s64a.heading')}
     </h2>

     <div className="grid gap-2">
      {whatPoints.map((point, i) => (
       <div
        key={i}
        className="tone-blue border rounded-card p-3 flex items-start gap-3"
       >
        <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center shrink-0">
         {i + 1}
        </span>
        <p className={`text-sm text-primary leading-snug ${isML ? 'ml-text' : ''}`}>{point}</p>
       </div>
      ))}
     </div>

     <Accordion
      title={t('rights.s64a.conditionsHeading')}
      badge={
       <span className="text-[10px] font-bold bg-accent-soft text-accent px-2 py-0.5 rounded-full">
        {conditions.length}
       </span>
      }
      icon={<CheckCircle size={15} className="text-accent" />}
      tone="bg-surface border-border"
      isML={isML}
     >
      <ul className="space-y-2.5">
       {conditions.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
         <CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />
         <span className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
        </li>
       ))}
      </ul>
     </Accordion>

     <Accordion
      title={t('rights.s64a.limitationsHeading')}
      badge={
       <span className="text-[10px] font-bold tone-rose border px-2 py-0.5 rounded-full text-red-600 dark:text-red-400">
        {limitations.length}
       </span>
      }
      icon={<XCircle size={15} className="text-red-500" />}
      tone="bg-surface border-border"
      isML={isML}
     >
      <ul className="space-y-2.5">
       {limitations.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
         <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
         <span className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
        </li>
       ))}
      </ul>
     </Accordion>
    </section>
   )}

   {tab === 'confidentiality' && (
    <section className="fade-up tone-indigo border rounded-card p-5">
     <div className="flex items-center gap-2 mb-3">
      <EyeOff size={16} className="text-indigo-500" />
      <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
       {t('rights.confidentiality.heading')}
      </h2>
     </div>
     <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('rights.confidentiality.body')}
     </p>
    </section>
   )}

   {tab === 'legalAid' && (
    <section className="fade-up cta-banner flex flex-col gap-3">
     <div className="flex items-center gap-2">
      <ShieldCheck size={16} />
      <h2 className={`heading-text font-bold text-base ${isML ? 'ml-text' : ''}`}>
       {t('rights.legalAid.heading')}
      </h2>
     </div>
     <p className={`text-sm leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('rights.legalAid.body')}
     </p>
     <PhoneLink
      phone="15100"
      label="Legal Services Authority"
      className="inline-flex items-center gap-2 bg-surface text-teal-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors self-start"
     >
      <PhoneCall size={14} />
      15100 — Free Legal Aid
     </PhoneLink>
    </section>
   )}

   <div className="flex flex-col gap-2">
    <Link
     to="/get-help"
     className="btn-ghost w-full py-3 border-accent text-accent hover:bg-accent-soft"
    >
     {t('rights.ctas.getHelp')}
    </Link>
    <PhoneLink
     phone="14446"
     label="National De-addiction"
     className="btn-ghost w-full py-3"
    >
     <PhoneCall size={14} />
     {t('rights.ctas.deaddiction')}
    </PhoneLink>
   </div>
  </div>
 );
}
