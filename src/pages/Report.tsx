import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Megaphone, Phone, MessageCircle, Globe, Mail, ShieldAlert, AlertTriangle, ShieldCheck, Smartphone } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

interface ChannelDef {
 key: string;
 icon: ReactNode;
 contactIds: string[];
 tone?: string;
}

// Channel layout + which data.json contacts each one surfaces. No digits here.
const CHANNELS: ChannelDef[] = [
 { key: 'manas_call', icon: <Phone size={14} className="text-teal-700" />, contactIds: ['manas-call'] },
 { key: 'manas_web', icon: <Globe size={14} className="text-indigo-600" />, contactIds: ['manas-web'] },
 { key: 'manas_email', icon: <Mail size={14} className="text-secondary" />, contactIds: ['manas-email'] },
 { key: 'umang', icon: <Smartphone size={14} className="text-violet-600" />, contactIds: ['manas-umang'] },
 { key: 'wa_kerala', icon: <MessageCircle size={14} className="text-green-600" />, contactIds: ['kerala-wa-antinarcotics'] },
 { key: 'antinarcotics_cell', icon: <Phone size={14} className="text-teal-700" />, contactIds: ['antinarcotics-cell-1', 'antinarcotics-cell-2'] },
 { key: 'emergency', icon: <ShieldAlert size={14} className="text-red-600" />, contactIds: ['emergency-112'], tone: 'tone-red border' },
];

export function Report() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { data } = useAppData();
 const tokens = useContactTokens();
 const safetyTips = t('report.safetyTips', { returnObjects: true }) as string[];

 return (
  <div className="flex flex-col gap-5">
   <PageHeader
    icon={<Megaphone size={18} className="text-amber-700" />}
    title={t('report.heading')}
    subtitle={t('report.intro')}
    isML={isML}
   />

   <section>
    <h2 className={`heading-text font-bold text-primary text-base mb-2.5 ${isML ? 'ml-text' : ''}`}>
     {t('report.how')}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
     {CHANNELS.map(({ key, icon, contactIds, tone = 'compact-card' }) => {
      const contacts = findContacts(data, contactIds);
      return (
       <div key={key} className={`${tone} flex flex-col gap-2`}>
        <div className="flex items-center gap-2">
         {icon}
         <h3 className={`font-bold text-primary text-sm leading-snug ${isML ? 'ml-text' : ''}`}>
          {t(`report.channels.${key}.title`, tokens)}
         </h3>
        </div>
        <p className={`text-xs text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
         {t(`report.channels.${key}.desc`, tokens)}
        </p>
        <div className="mt-auto pt-0.5 flex flex-wrap gap-1.5">
         {contacts.map((c) => <ContactAction key={c.id} contact={c} />)}
        </div>
       </div>
      );
     })}
    </div>
   </section>

   <section>
    <h2 className={`heading-text font-bold text-primary text-base mb-2.5 ${isML ? 'ml-text' : ''}`}>
     {t('report.safety')}
    </h2>
    <div className="tone-amber border rounded-card p-3">
     <ul className="space-y-2">
      {safetyTips.map((tip, i) => (
       <li key={i} className="flex items-start gap-2">
        <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
        <span className={`text-sm text-secondary ${isML ? 'ml-text' : ''}`}>{tip}</span>
       </li>
      ))}
     </ul>
    </div>
   </section>

   <div className="flex items-start gap-2.5 bg-surface-2 rounded-card border border-border p-3">
    <ShieldCheck size={14} className="text-teal-700 mt-0.5 shrink-0" />
    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('report.privacy')}
    </p>
   </div>
  </div>
 );
}
