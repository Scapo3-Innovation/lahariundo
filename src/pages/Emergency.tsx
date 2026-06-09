import { useTranslation } from 'react-i18next';
import { Phone, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { PageHeader } from '../components/PageHeader';

const EMERGENCY_NUMBERS = [
 { value: '112', labelKey: 'emergency.numbers.national', color: 'bg-red-600 hover:bg-red-700', textColor: 'text-red-600', bgLight: 'tone-red border' },
 { value: '108', labelKey: 'emergency.numbers.ambulance', color: 'bg-orange-600 hover:bg-orange-700', textColor: 'text-orange-600', bgLight: 'tone-orange border' },
 { value: '100', labelKey: 'emergency.numbers.police', color: 'bg-blue-700 hover:bg-blue-800', textColor: 'text-blue-700', bgLight: 'tone-blue border' },
];

export function Emergency() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const steps = t('emergency.overdose.steps', { returnObjects: true }) as string[];

 return (
  <div className="flex flex-col gap-5">
   <PageHeader
    icon={<AlertTriangle size={18} className="text-red-600" />}
    title={t('emergency.heading')}
    subtitle={t('emergency.intro')}
    isML={isML}
   />

   <section>
    <h2 className={`heading-text font-bold text-primary text-base mb-2.5 ${isML ? 'ml-text' : ''}`}>
     {t('emergency.numbers.heading')}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
     {EMERGENCY_NUMBERS.map(({ value, labelKey, color, textColor, bgLight }) => (
      <div
       key={value}
       className={`${bgLight} rounded-card p-3 flex flex-col gap-2`}
      >
       <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={`heading-text text-2xl font-extrabold tabular-nums ${textColor}`}>
         {value}
        </span>
        <p className={`text-sm font-semibold text-secondary ${isML ? 'ml-text' : ''}`}>
         {t(labelKey)}
        </p>
       </div>
       <PhoneLink
        phone={value}
        label={t(labelKey)}
        className={`btn-action ${color} text-white self-start`}
       >
        <Phone size={12} />
        {t('resources.channels.call')}
       </PhoneLink>
      </div>
     ))}
    </div>
   </section>

   <section>
    <h2 className={`heading-text font-bold text-primary text-base mb-2 ${isML ? 'ml-text' : ''}`}>
     {t('emergency.overdose.heading')}
    </h2>

    <div className="bg-red-600 rounded-card px-3 py-2.5 mb-3">
     <p className={`text-white font-bold text-sm leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('emergency.overdose.callFirst')}
     </p>
    </div>

    <div className="compact-card">
     <ol className="space-y-2.5">
      {steps.map((step, i) => (
       <li key={i} className="flex items-start gap-2.5">
        <span className="shrink-0 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
         {i + 1}
        </span>
        <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{step}</p>
       </li>
      ))}
     </ol>
    </div>
   </section>

   <section className="tone-amber border rounded-card p-3">
    <h3 className={`heading-text font-bold text-primary text-sm mb-1.5 ${isML ? 'ml-text' : ''}`}>
     {t('emergency.overdose.recoveryHeading')}
    </h3>
    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('emergency.overdose.recoveryDesc')}
    </p>
   </section>

   <div className="flex items-start gap-2.5 bg-surface-2 rounded-card border border-border p-3">
    <ShieldCheck size={14} className="text-teal-700 mt-0.5 shrink-0" />
    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('emergency.privacy')}
    </p>
   </div>
  </div>
 );
}
