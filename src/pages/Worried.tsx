import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, Eye, Activity, Users, ChevronRight, Phone, Check } from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { ChipTabs } from '../components/ChipTabs';
import { StepWizard } from '../components/StepWizard';

type SignCategory = 'physical' | 'behavioural' | 'social';

const SIGN_CONFIG: Record<SignCategory, { icon: React.ReactNode; tone: string; activeTone: string }> = {
 physical: {
  icon: <Activity size={14} />,
  tone: 'tone-rose border',
  activeTone: 'ring-2 ring-rose-500/40 bg-rose-500/15 border-rose-500/30',
 },
 behavioural: {
  icon: <Eye size={14} />,
  tone: 'tone-amber border',
  activeTone: 'ring-2 ring-amber-500/40 bg-amber-500/15 border-amber-500/30',
 },
 social: {
  icon: <Users size={14} />,
  tone: 'tone-indigo border',
  activeTone: 'ring-2 ring-indigo-500/40 bg-indigo-500/15 border-indigo-500/30',
 },
};

export function Worried() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const signCategories: SignCategory[] = ['physical', 'behavioural', 'social'];
 const talkSteps = t('worried.talkSteps', { returnObjects: true }) as string[];

 const [activeCat, setActiveCat] = useState<SignCategory>('physical');
 const [checked, setChecked] = useState<Set<string>>(new Set());

 const items = t(`worried.signs.${activeCat}.items`, { returnObjects: true }) as string[];
 const cfg = SIGN_CONFIG[activeCat];
 const checkedCount = checked.size;

 const toggleSign = (key: string) => {
  setChecked((prev) => {
   const next = new Set(prev);
   if (next.has(key)) next.delete(key);
   else next.add(key);
   return next;
  });
 };

 return (
  <div className="flex flex-col gap-6">
   <div className="flex items-start gap-3">
    <div className="w-10 h-10 tone-rose border rounded-xl flex items-center justify-center shrink-0">
     <Heart size={20} className="text-rose-600 dark:text-rose-400" />
    </div>
    <div className="min-w-0 flex-1">
     <h1 className={`heading-text text-xl sm:text-2xl font-extrabold text-primary break-words ${isML ? 'ml-text' : ''}`}>
      {t('worried.heading')}
     </h1>
     <p className={`text-secondary text-sm mt-0.5 leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('worried.intro')}
     </p>
    </div>
   </div>

   {/* Interactive warning signs */}
   <section>
    <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
     <h2 className={`heading-text font-bold text-primary text-lg ${isML ? 'ml-text' : ''}`}>
      {t('worried.signsHeading')}
     </h2>
     {checkedCount > 0 && (
      <span className={`shrink-0 text-xs font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
       {t('worried.signsSelected', { count: checkedCount })}
      </span>
     )}
    </div>
    <p className={`text-xs text-muted mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('worried.signsTapHint')}
    </p>

    <ChipTabs
     tabs={signCategories.map((cat) => ({
      id: cat,
      label: t(`worried.signs.${cat}.title`),
      icon: SIGN_CONFIG[cat].icon,
     }))}
     active={activeCat}
     onChange={setActiveCat}
     isML={isML}
    />

    <div className="mt-3 flex flex-col gap-2">
     {items.map((item, i) => {
      const key = `${activeCat}-${i}`;
      const isChecked = checked.has(key);
      return (
       <button
        key={key}
        type="button"
        onClick={() => toggleSign(key)}
        className={`w-full flex items-start gap-3 p-3 rounded-card border text-left transition-all ${
         isChecked ? cfg.activeTone : `${cfg.tone} hover:bg-surface-2/80`
        }`}
        aria-pressed={isChecked}
       >
        <span
         className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          isChecked
           ? 'bg-accent border-accent text-accent-text'
           : 'border-border-strong bg-surface'
         }`}
        >
         {isChecked && <Check size={12} strokeWidth={3} />}
        </span>
        <span className={`text-sm text-primary leading-snug ${isML ? 'ml-text' : ''}`}>{item}</span>
       </button>
      );
     })}
    </div>
   </section>

   {/* Step-by-step talk guide */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('worried.talkHeading')}
    </h2>
    <StepWizard
     steps={talkSteps}
     isML={isML}
     stepLabel={(current, total) => t('worried.talkStepOf', { current, total })}
     prevLabel={t('screening.prev')}
     nextLabel={t('screening.next')}
     restartLabel={t('screening.restart')}
    />
   </section>

   {/* Getting help */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('worried.helpHeading')}
    </h2>
    <div className="cta-banner mb-3">
     <p className={`text-sm leading-relaxed mb-3 ${isML ? 'ml-text' : ''}`}>
      {t('worried.helpText')}
     </p>
     <PhoneLink
      phone="14405"
      label="Vimukthi Counselling"
      className="inline-flex items-center gap-2 bg-surface text-teal-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors"
     >
      <Phone size={14} />
      Vimukthi — 14405
     </PhoneLink>
    </div>
    <Link
     to="/get-help"
     className="card-hover flex items-center justify-between p-4 group"
    >
     <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
      {t('worried.nextSteps')}
     </span>
     <ChevronRight size={18} className="text-muted group-hover:text-accent transition-colors" />
    </Link>
   </section>
  </div>
 );
}
