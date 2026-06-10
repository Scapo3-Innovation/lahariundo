import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sprout, ChevronDown, Gift, Heart, MapPin,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';

interface Step { title: string; body: string; reassure: string }

export function Recovery() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();

  const steps = t('recovery.steps', { returnObjects: true }) as Step[];
  const [open, setOpen] = useState(0); // first step open by default
  const contacts = findContacts(data, ['vimukthi-14405', 'deaddiction-14446']);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<Sprout size={18} className="text-emerald-600" />}
        title={t('recovery.heading')}
        subtitle={t('recovery.intro')}
        isML={isML}
      />

      <div className="tone-emerald border rounded-card p-3 flex items-center gap-2">
        <Gift size={15} className="text-emerald-600 shrink-0" />
        <p className={`text-sm font-semibold text-primary ${isML ? 'ml-text' : ''}`}>
          {t('recovery.freeNote')}
        </p>
      </div>

      <p className={`text-xs text-muted ${isML ? 'ml-text' : ''}`}>{t('recovery.tapHint')}</p>

      {/* Stepper */}
      <ol className="flex flex-col">
        {Array.isArray(steps) && steps.map((step, i) => {
          const isOpen = open === i;
          const isLast = i === steps.length - 1;
          return (
            <li key={i} className="flex gap-3">
              {/* Rail */}
              <div className="flex flex-col items-center shrink-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isOpen
                      ? 'bg-accent text-accent-text border-accent'
                      : 'bg-surface text-secondary border-border-strong'
                  }`}
                >
                  {i + 1}
                </span>
                {!isLast && <span className="w-0.5 flex-1 bg-border-strong my-1" aria-hidden="true" />}
              </div>

              {/* Card */}
              <div className="flex-1 pb-3">
                <div className="card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-surface-2/60 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className={`flex-1 heading-text font-bold text-sm text-primary ${isML ? 'ml-text' : ''}`}>
                      {step.title}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="accordion-body border-t border-border px-3.5 pb-3.5 pt-3 flex flex-col gap-2.5">
                      <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                        {step.body}
                      </p>
                      <p className={`flex items-start gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 ${isML ? 'ml-text' : ''}`}>
                        <Heart size={14} className="mt-0.5 shrink-0" />
                        {step.reassure}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* CTAs */}
      <section className="cta-banner flex flex-col gap-3">
        <div>
          <h2 className={`heading-text font-bold text-base ${isML ? 'ml-text' : ''}`}>
            {t('recovery.ctaHeading')}
          </h2>
          <p className={`text-sm leading-relaxed mt-1 ${isML ? 'ml-text' : ''}`}>
            {t('recovery.ctaText')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/get-help"
            className="btn-action bg-surface text-accent hover:opacity-90"
          >
            <MapPin size={12} />
            {t('recovery.ctaLocator')}
          </Link>
          {contacts.map((c) => (
            <ContactAction key={c.id} contact={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
