import { useTranslation } from 'react-i18next';
import { Megaphone, Phone, MessageCircle, Globe, Mail, ShieldAlert, AlertTriangle, ShieldCheck, Smartphone } from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { PageHeader } from '../components/PageHeader';

interface Channel {
 key: string;
 icon: React.ReactNode;
 actionEl: React.ReactNode;
 bg?: string;
 border?: string;
}

const ACTION = 'btn-action';

export function Report() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const safetyTips = t('report.safetyTips', { returnObjects: true }) as string[];

 const channels: Channel[] = [
  {
   key: 'manas_call',
   icon: <Phone size={14} className="text-teal-700" />,
   actionEl: (
    <PhoneLink
     phone="1933"
     label="MANAS 1933"
     className={`${ACTION} bg-teal-700 text-white hover:bg-teal-800`}
    >
     <Phone size={12} />
     Call 1933
    </PhoneLink>
   ),
  },
  {
   key: 'manas_web',
   icon: <Globe size={14} className="text-indigo-600" />,
   actionEl: (
    <a
     href="https://ncbmanas.gov.in"
     target="_blank"
     rel="noopener noreferrer"
     className={`${ACTION} bg-indigo-600 text-white hover:bg-indigo-700`}
    >
     <Globe size={12} />
     ncbmanas.gov.in
    </a>
   ),
  },
  {
   key: 'manas_email',
   icon: <Mail size={14} className="text-secondary" />,
   actionEl: (
    <a
     href="mailto:info.ncbmanas@gov.in"
     className={`${ACTION} bg-slate-700 text-white hover:bg-slate-800`}
    >
     <Mail size={12} />
     info.ncbmanas@gov.in
    </a>
   ),
  },
  {
   key: 'umang',
   icon: <Smartphone size={14} className="text-violet-600" />,
   actionEl: (
    <a
     href="https://web.umang.gov.in"
     target="_blank"
     rel="noopener noreferrer"
     className={`${ACTION} bg-violet-600 text-white hover:bg-violet-700`}
    >
     <Globe size={12} />
     Open UMANG
    </a>
   ),
  },
  {
   key: 'wa_kerala',
   icon: <MessageCircle size={14} className="text-green-600" />,
   actionEl: (
    <a
     href="https://wa.me/9995966666"
     target="_blank"
     rel="noopener noreferrer"
     className={`${ACTION} bg-green-600 text-white hover:bg-green-700`}
    >
     <MessageCircle size={12} />
     WhatsApp 9995966666
    </a>
   ),
  },
  {
   key: 'antinarcotics_cell',
   icon: <Phone size={14} className="text-teal-700" />,
   actionEl: (
    <div className="flex flex-wrap gap-1.5">
     <PhoneLink
      phone="9497979794"
      label="Anti-Narcotic Cell"
      className={`${ACTION} bg-teal-700 text-white hover:bg-teal-800`}
     >
      <Phone size={12} />
      9497979794
     </PhoneLink>
     <PhoneLink
      phone="9497927797"
      label="Anti-Narcotic Cell"
      className={`${ACTION} bg-teal-700 text-white hover:bg-teal-800`}
     >
      <Phone size={12} />
      9497927797
     </PhoneLink>
    </div>
   ),
  },
  {
   key: 'emergency',
   icon: <ShieldAlert size={14} className="text-red-600" />,
   bg: 'tone-red border',
   border: '',
   actionEl: (
    <PhoneLink
     phone="112"
     label="Emergency 112"
     className={`${ACTION} bg-red-600 text-white hover:bg-red-700`}
    >
     <Phone size={12} />
     Call 112
    </PhoneLink>
   ),
  },
 ];

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
     {channels.map(({ key, icon, actionEl, bg = 'compact-card', border = '' }) => (
      <div key={key} className={`${bg} ${border} flex flex-col gap-2`}>
       <div className="flex items-center gap-2">
        {icon}
        <h3 className={`font-bold text-primary text-sm leading-snug ${isML ? 'ml-text' : ''}`}>
         {t(`report.channels.${key}.title`)}
        </h3>
       </div>
       <p className={`text-xs text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
        {t(`report.channels.${key}.desc`)}
       </p>
       <div className="mt-auto pt-0.5">{actionEl}</div>
      </div>
     ))}
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
