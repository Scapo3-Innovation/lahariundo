import { useTranslation } from 'react-i18next';
import { Users, Check, X, ChevronRight, Phone, GraduationCap } from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';

const WARNING_SIGNS = [
 'Sudden changes in mood, behaviour, or friends',
 'Loss of interest in school, sports, or hobbies',
 'Unexplained money missing from home',
 'Staying out very late or disappearing for days',
 'New secretive behaviour; hiding phone/belongings',
 'Red eyes, smell of smoke, slurred speech',
 'Declining grades or school attendance',
 'Sudden new expensive items with no explanation',
];

const WARNING_SIGNS_ML = [
 'പെട്ടെന്നൊരു മൂഡ്, പെരുമാറ്റം, സുഹൃദ് മാറ്റം',
 'സ്കൂൾ, കായിക, ഹോബിയിൽ താൽപ്പര്യം നഷ്ടം',
 'വീട്ടിൽ നിന്ന് പണം കാണാതാകൽ',
 'വളരെ വൈകി തിരിച്ചുവരൽ അല്ലെങ്കിൽ ദിവസങ്ങൾ കാണാതിരിക്കൽ',
 'ഫോൺ/ജാമ്യ വസ്തുക്കൾ ഒളിപ്പിക്കൽ',
 'ചുവന്ന കണ്ണ്, പുക മണം, അവ്യക്ത സംഭാഷണം',
 'ഗ്രേഡ് കുറഞ്ഞ് / സ്കൂൾ ഒഴിവാക്കൽ',
 'കാരണം ഇല്ലാതെ പുതിയ വിലകൂടിയ സാധനങ്ങൾ',
];

export function Parents() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 const doItems   = t('parents.doItems',  { returnObjects: true }) as string[];
 const dontItems  = t('parents.dontItems', { returnObjects: true }) as string[];
 const nextSteps  = t('parents.nextSteps', { returnObjects: true }) as string[];
 const teacherItems = t('parents.teacherItems', { returnObjects: true }) as string[];
 const warningSigns = isML ? WARNING_SIGNS_ML : WARNING_SIGNS;

 return (
  <div className="flex flex-col gap-6">
   {/* Heading */}
   <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
     <Users size={20} className="text-emerald-700" />
    </div>
    <div className="min-w-0 flex-1">
     <h1 className={`heading-text text-xl sm:text-2xl font-extrabold text-primary break-words ${isML ? 'ml-text' : ''}`}>
      {t('parents.heading')}
     </h1>
     <p className={`text-secondary text-sm mt-0.5 leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('parents.intro')}
     </p>
    </div>
   </div>

   {/* Warning signs checklist */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-1 ${isML ? 'ml-text' : ''}`}>
     {t('parents.warningHeading')}
    </h2>
    <p className={`text-xs text-secondary mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('parents.warningNote')}
    </p>
    <div className="bg-surface rounded-card border border-border p-4">
     <ul className="space-y-2.5">
      {warningSigns.map((sign, i) => (
       <li key={i} className="flex items-start gap-2.5">
        <span className="mt-1.5 w-3 h-3 border-2 border-slate-300 rounded shrink-0" aria-hidden="true" />
        <span className={`text-sm text-secondary ${isML ? 'ml-text' : ''}`}>{sign}</span>
       </li>
      ))}
     </ul>
    </div>
   </section>

   {/* How to talk — do/don't */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-1 ${isML ? 'ml-text' : ''}`}>
     {t('parents.talkHeading')}
    </h2>
    <p className={`text-xs text-secondary mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('parents.talkNote')}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
     <div className="bg-emerald-50 rounded-card border border-emerald-200 p-4">
      <h3 className={`heading-text font-bold text-emerald-700 text-sm mb-3 ${isML ? 'ml-text' : ''}`}>
       {t('parents.talkDo')}
      </h3>
      <ul className="space-y-2">
       {doItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
         <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" />
         <span className={`text-xs text-emerald-900 leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
        </li>
       ))}
      </ul>
     </div>
     <div className="bg-rose-50 rounded-card border border-rose-200 p-4">
      <h3 className={`heading-text font-bold text-rose-700 text-sm mb-3 ${isML ? 'ml-text' : ''}`}>
       {t('parents.talkDont')}
      </h3>
      <ul className="space-y-2">
       {dontItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
         <X size={12} className="text-rose-500 mt-0.5 shrink-0" />
         <span className={`text-xs text-rose-900 leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </section>

   {/* Next steps */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-3 ${isML ? 'ml-text' : ''}`}>
     {t('parents.nextHeading')}
    </h2>
    <div className="flex flex-col gap-2">
     {nextSteps.map((step, i) => (
      <div key={i} className="flex items-start gap-3 bg-surface rounded-card border border-border shadow-sm p-3.5">
       <span className="w-6 h-6 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {i + 1}
       </span>
       <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{step}</p>
      </div>
     ))}
    </div>
   </section>

   {/* Vimukthi CTA */}
   <div className="cta-banner p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div className="min-w-0">
     <p className={`text-sm font-bold ${isML ? 'ml-text' : ''}`}>Vimukthi Helpline</p>
     <p className={`text-xs opacity-90 ${isML ? 'ml-text' : ''}`}>Free guidance for families</p>
    </div>
    <PhoneLink
     phone="14405"
     label="Vimukthi Counselling"
     className="inline-flex items-center justify-center gap-1.5 bg-surface text-teal-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors w-full sm:w-auto min-h-[44px]"
    >
     <Phone size={13} /> 14405
    </PhoneLink>
   </div>

   {/* For teachers */}
   <section>
    <h2 className={`heading-text font-bold text-primary text-lg mb-3 flex items-center gap-2 ${isML ? 'ml-text' : ''}`}>
     <GraduationCap size={18} className="text-secondary" />
     {t('parents.teacherHeading')}
    </h2>
    <div className="bg-surface rounded-card border border-border p-4">
     <ul className="space-y-3">
      {teacherItems.map((item, i) => (
       <li key={i} className="flex items-start gap-2">
        <ChevronRight size={13} className="text-teal-600 mt-0.5 shrink-0" />
        <span className={`text-sm text-secondary ${isML ? 'ml-text' : ''}`}>{item}</span>
       </li>
      ))}
     </ul>
    </div>
   </section>
  </div>
 );
}
