import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhoneLink } from './PhoneLink';
import { useAppData } from '../context/DataContext';
import { isPlaceholderValue } from '../utils/verify';

export function ContactBar() {
 const { t, i18n } = useTranslation();
 const { data } = useAppData();
 const isML = i18n.language === 'ml';

 const helplines = (data?.helplines ?? []).filter(
  (h) => !isPlaceholderValue(h.value),
 );

 if (helplines.length === 0) return null;

 return (
  <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-t border-border">
   <div className="w-full px-4 sm:px-6 py-2.5">
    <p className="text-[10px] text-muted text-center mb-2 flex items-center justify-center gap-1.5">
     <ShieldCheck size={11} className="text-accent shrink-0" />
     <span className={isML ? 'ml-text' : ''}>{t('contactBar.privacy')}</span>
    </p>
    <div className="flex gap-2 justify-center flex-wrap">
     {helplines.map((h) => {
      const label = isML ? h.label_ml : h.label_en;

      if (h.type === 'call') {
       return (
        <PhoneLink
         key={h.id}
         phone={h.value}
         label={label}
         className={[
          'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors',
          h.emergency
           ? 'bg-red-600 text-white hover:bg-red-700'
           : 'bg-accent text-white hover:opacity-90',
         ].join(' ')}
        >
         <Phone size={12} />
         <span className={isML ? 'ml-text' : ''}>{label}</span>
        </PhoneLink>
       );
      }

      if (h.type === 'whatsapp') {
       return (
        <a
         key={h.id}
         href={`https://wa.me/${h.value}`}
         target="_blank"
         rel="noopener noreferrer"
         className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 text-white text-[11px] font-bold whitespace-nowrap hover:bg-green-700 transition-colors"
         aria-label={`${t('contactBar.whatsapp')}: ${label}`}
        >
         <MessageCircle size={12} />
         <span className={isML ? 'ml-text' : ''}>{label}</span>
        </a>
       );
      }

      return null;
     })}
    </div>
   </div>
  </div>
 );
}
