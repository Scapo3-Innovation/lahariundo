import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, Info, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ChipTabs } from '../components/ChipTabs';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';

type Substance = 'cannabis' | 'stimulants' | 'opioids';
type BodyPart = 'brain' | 'heart' | 'lungs' | 'liver' | 'stomach' | 'kidneys';

const SUBSTANCES: Substance[] = ['cannabis', 'stimulants', 'opioids'];
const PARTS: BodyPart[] = ['brain', 'heart', 'lungs', 'liver', 'stomach', 'kidneys'];

// Hotspot positions over the silhouette (percentage of the figure box).
const HOTSPOTS: Record<BodyPart, { top: string; left: string }> = {
  brain: { top: '6%', left: '50%' },
  lungs: { top: '30%', left: '50%' },
  heart: { top: '33%', left: '38%' },
  liver: { top: '45%', left: '61%' },
  stomach: { top: '50%', left: '47%' },
  kidneys: { top: '58%', left: '50%' },
};

export function Effects() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();

  const [substance, setSubstance] = useState<Substance>('cannabis');
  const [part, setPart] = useState<BodyPart | null>(null);

  const vimukthi = findContact(data, 'vimukthi-14405');

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<HeartPulse size={18} className="text-rose-600" />}
        title={t('effects.heading')}
        subtitle={t('effects.intro')}
        isML={isML}
      />

      {/* Substance picker */}
      <div>
        <h2 className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('effects.pickSubstance')}</h2>
        <ChipTabs
          tabs={SUBSTANCES.map((s) => ({ id: s, label: t(`effects.substances.${s}`) }))}
          active={substance}
          onChange={(s) => { setSubstance(s); }}
          isML={isML}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Figure with hotspots */}
        <div>
          <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('effects.pickPart')}</p>
          <div className="relative mx-auto w-full max-w-[260px] aspect-[1/2]">
            {/* Decorative silhouette */}
            <svg
              viewBox="0 0 100 200"
              className="w-full h-full text-surface-3"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="50" cy="18" r="13" fill="currentColor" />
              <rect x="40" y="32" width="20" height="8" rx="4" fill="currentColor" />
              <path
                d="M30 44 Q50 38 70 44 L74 96 Q72 104 64 104 L60 104 L58 150 Q58 158 52 158 Q50 130 50 104 Q50 130 48 158 Q42 158 42 150 L40 104 L36 104 Q28 104 26 96 Z"
                fill="currentColor"
              />
              <path d="M30 46 L18 90 Q16 96 22 98 Q28 96 30 88 Z" fill="currentColor" />
              <path d="M70 46 L82 90 Q84 96 78 98 Q72 96 70 88 Z" fill="currentColor" />
            </svg>

            {/* Keyboard-accessible hotspot buttons */}
            {PARTS.map((p) => {
              const pos = HOTSPOTS[p];
              const selected = part === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPart(p)}
                  aria-pressed={selected}
                  aria-label={t(`effects.parts.${p}`)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    selected
                      ? 'bg-accent text-accent-text border-accent ring-2 ring-accent/30 scale-105'
                      : 'bg-surface text-secondary border-border-strong hover:border-accent hover:text-accent'
                  } ${isML ? 'ml-text' : ''}`}
                >
                  {t(`effects.parts.${p}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex flex-col gap-3">
          {part ? (
            <div className="tone-rose border rounded-card p-4 fade-up" key={`${substance}-${part}`}>
              <p className={`ui-label mb-1 ${isML ? 'ml-text' : ''}`}>
                {t('effects.selectedPrefix')} {t(`effects.parts.${part}`)}
              </p>
              <h3 className={`heading-text font-bold text-primary text-base mb-2 ${isML ? 'ml-text' : ''}`}>
                {t(`effects.substances.${substance}`)}
              </h3>
              <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                {t(`effects.content.${substance}.${part}`)}
              </p>
            </div>
          ) : (
            <div className="compact-card flex items-center justify-center text-center min-h-[8rem]">
              <p className={`text-sm text-muted ${isML ? 'ml-text' : ''}`}>{t('effects.noPart')}</p>
            </div>
          )}

          <p className={`text-[11px] text-muted flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
            <Info size={12} className="mt-0.5 shrink-0" />
            {t('effects.nonGraphicNote')}
          </p>
        </div>
      </div>

      {/* Supportive CTA */}
      <section className="cta-banner flex flex-wrap items-center justify-between gap-3">
        <p className={`text-sm flex-1 min-w-[200px] ${isML ? 'ml-text' : ''}`}>{t('effects.ctaText')}</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/get-help" className="btn-action bg-surface text-accent hover:opacity-90">
            {t('effects.cta')}
            <ArrowRight size={12} />
          </Link>
          {vimukthi && <ContactAction contact={vimukthi} />}
        </div>
      </section>
    </div>
  );
}
