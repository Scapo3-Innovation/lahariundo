import { useTranslation } from 'react-i18next';
import { Phone, MessageCircle, Globe, Mail, AlertTriangle } from 'lucide-react';
import { PhoneLink } from './PhoneLink';
import type { ResolvedContact } from '../utils/contacts';

interface Props {
  contact: ResolvedContact;
  /** Optional extra classes for the action element. */
  className?: string;
}

const BASE = 'btn-action';

/**
 * Renders the correct tappable action for any data.json contact
 * (call / whatsapp / web / email). Unverified contacts render as a
 * non-interactive "verify locally" chip, mirroring Resources.tsx.
 */
export function ContactAction({ contact, className = '' }: Props) {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const label = isML ? contact.label_ml : contact.label_en;

  if (!contact.verified) {
    return (
      <span
        className="inline-flex items-center gap-1 bg-surface-2 text-muted px-2 py-1 rounded-lg text-[10px] font-bold cursor-not-allowed select-none"
        aria-disabled="true"
        title={t('resources.unverifiedNote')}
      >
        <AlertTriangle size={10} />
        {t('resources.unverifiedNote')}
      </span>
    );
  }

  switch (contact.channel) {
    case 'call':
      return (
        <PhoneLink
          phone={contact.value}
          label={label}
          className={`${BASE} bg-teal-700 text-white hover:bg-teal-800 ${className}`}
        >
          <Phone size={12} />
          {t('resources.channels.call')} {contact.value}
        </PhoneLink>
      );
    case 'whatsapp':
      return (
        <a
          href={`https://wa.me/${contact.value}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BASE} bg-green-600 text-white hover:bg-green-700 ${className}`}
          aria-label={`${t('resources.channels.whatsapp')}: ${label}`}
        >
          <MessageCircle size={12} />
          {t('resources.channels.whatsapp')}
        </a>
      );
    case 'web':
      return (
        <a
          href={contact.value}
          target="_blank"
          rel="noopener noreferrer"
          className={`${BASE} bg-indigo-600 text-white hover:bg-indigo-700 ${className}`}
          aria-label={`${t('resources.channels.web')}: ${label}`}
        >
          <Globe size={12} />
          {t('resources.channels.web')}
        </a>
      );
    case 'email':
      return (
        <a
          href={`mailto:${contact.value}`}
          className={`${BASE} bg-slate-700 text-white hover:bg-slate-800 ${className}`}
          aria-label={`${t('resources.channels.email')}: ${label}`}
        >
          <Mail size={12} />
          {t('resources.channels.email')}
        </a>
      );
  }
}
