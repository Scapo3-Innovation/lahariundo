import { Phone, MessageCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhoneLink } from './PhoneLink';
import { useAppData } from '../context/DataContext';
import { isPlaceholderValue } from '../utils/verify';

interface Props {
 layout?: 'row' | 'stack';
 onAction?: () => void;
}

export function HelplineActions({ layout = 'row', onAction }: Props) {
 const { t, i18n } = useTranslation();
 const { data } = useAppData();
 const isML = i18n.language === 'ml';

 const helplines = (data?.helplines ?? []).filter(
  (h) => !isPlaceholderValue(h.value),
 );

 if (helplines.length === 0) return null;

 const containerClass = layout === 'stack'
  ? 'flex flex-col gap-2'
  : 'flex flex-col sm:flex-row gap-2 sm:flex-wrap';

 return (
  <div>
   <p className="text-xs text-muted mb-2.5 flex items-center gap-1.5">
    <ShieldCheck size={11} className="text-accent shrink-0" />
    <span className={isML ? 'ml-text' : ''}>{t('contactBar.privacy')}</span>
   </p>
   <div className={containerClass}>
    {helplines.map((h) => {
     const label = isML ? h.label_ml : h.label_en;

     if (h.type === 'call') {
      return (
       <PhoneLink
        key={h.id}
        phone={h.value}
        label={label}
        onAction={onAction}
        className={[
         'flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold min-h-[44px] transition-colors',
         layout === 'stack' ? 'w-full' : 'w-full sm:w-auto',
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
        onClick={onAction}
        className={[
         'flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-green-600 text-white text-xs font-bold min-h-[44px] hover:bg-green-700 transition-colors',
         layout === 'stack' ? 'w-full' : 'w-full sm:w-auto',
        ].join(' ')}
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
 );
}
