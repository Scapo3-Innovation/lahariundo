import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, Info, ArrowRight, Thermometer, AlertTriangle, Baby, Siren } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ChipTabs } from '../components/ChipTabs';
import { ContactAction } from '../components/ContactAction';
import { AnatomyFigure, type FigureKind } from '../components/AnatomyFigure';
import { useAppData } from '../context/DataContext';
import { findContact, findContacts } from '../utils/contacts';
import { EFFECTS, ORGANS, SUBSTANCES, type SubstanceId, type OrganId, type Bilingual } from '../data/effectsContent';

const FIGURES: FigureKind[] = ['neutral', 'male', 'female'];

export function Effects() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();

  const [substance, setSubstance] = useState<SubstanceId>('cannabis');
  const [organ, setOrgan] = useState<OrganId | null>(null);
  const [figure, setFigure] = useState<FigureKind>('neutral');

  const tx = (b: Bilingual) => (isML ? b.ml : b.en);
  const content = EFFECTS[substance];
  const affected = content.affected;
  const emergencyOrgans = ORGANS.filter((o) => content.organs[o].emergency);
  const organLabel = (id: OrganId) => t(`effects.parts.${id}`);

  const vimukthi = findContact(data, 'vimukthi-14405');
  const emergencyContacts = findContacts(data, ['emergency-112', 'ambulance-108']);

  const selectedEffect = organ ? content.organs[organ] : null;
  const selectedIsEmergency = !!selectedEffect?.emergency;

  // Reset organ selection when substance changes so stale text never lingers.
  const chooseSubstance = (s: SubstanceId) => { setSubstance(s); setOrgan(null); };

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
          onChange={chooseSubstance}
          isML={isML}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Figure column */}
        <div className="flex flex-col gap-3">
          {/* Figure toggle */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className={`ui-label ${isML ? 'ml-text' : ''}`}>{t('effects.figureLabel')}</span>
            <div className="tab-toggle tab-toggle-compact" role="group" aria-label={t('effects.figureLabel')}>
              {FIGURES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFigure(f)}
                  aria-pressed={figure === f}
                  className={`tab-toggle-btn text-xs ${figure === f ? 'tab-toggle-btn-active' : ''} ${isML ? 'ml-text' : ''}`}
                >
                  {t(`effects.figures.${f}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-3 flex flex-col items-center">
            <AnatomyFigure
              figure={figure}
              affected={affected}
              emergencyOrgans={emergencyOrgans}
              selected={organ}
              bodyWarning={!!content.bodyWarning}
              onSelect={setOrgan}
              organLabel={organLabel}
              affectedLabel={t('effects.affectedBadge')}
            />
            <p className={`text-[11px] text-muted text-center mt-1 ${isML ? 'ml-text' : ''}`}>
              {t('effects.affectedLegend')}
            </p>
          </div>

          {/* Non-visual fallback: plain organ list (also a convenient picker) */}
          <div>
            <h3 className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('effects.organListHeading')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {ORGANS.map((id) => {
                const isAffected = affected.includes(id);
                const isSel = organ === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOrgan(id)}
                    aria-pressed={isSel}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors ${
                      isSel
                        ? 'bg-accent text-accent-text border-accent'
                        : 'bg-surface border-border text-secondary hover:border-accent hover:text-accent'
                    } ${isML ? 'ml-text' : ''}`}
                  >
                    <span>{organLabel(id)}</span>
                    {isAffected && (
                      <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isSel ? 'bg-accent-text/20' : 'bg-accent-soft text-accent'}`}>
                        {t('effects.affectedBadge')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col gap-3" aria-live="polite">
          {/* Whole-body warning (e.g. stimulants → body temperature) */}
          {content.bodyWarning && (
            <div className="tone-amber border rounded-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Thermometer size={15} className="text-amber-600 shrink-0" />
                <h3 className={`heading-text font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>
                  {t('effects.bodyWarningHeading')}
                </h3>
              </div>
              <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                {tx(content.bodyWarning)}
              </p>
            </div>
          )}

          {selectedEffect ? (
            <div
              key={`${substance}-${organ}`}
              className={`${selectedIsEmergency ? 'tone-red border' : 'tone-rose border'} rounded-card p-4 fade-up`}
            >
              <p className={`ui-label mb-1 ${isML ? 'ml-text' : ''}`}>
                {t('effects.selectedPrefix')} {organLabel(organ as OrganId)}
              </p>
              <h3 className={`heading-text font-bold text-primary text-base mb-2 ${isML ? 'ml-text' : ''}`}>
                {t(`effects.substances.${substance}`)}
              </h3>
              <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                {tx(selectedEffect.text)}
              </p>

              {selectedIsEmergency && (
                <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
                  <p className={`text-sm font-bold text-red-700 dark:text-red-400 flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
                    <Siren size={14} className="mt-0.5 shrink-0" />
                    {t('effects.emergencyText')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/emergency" className="btn-action bg-red-600 text-white hover:bg-red-700">
                      <AlertTriangle size={12} />
                      {t('effects.emergencyCta')}
                    </Link>
                    {emergencyContacts.map((c) => <ContactAction key={c.id} contact={c} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="compact-card flex items-center justify-center text-center min-h-[7rem]">
              <p className={`text-sm text-muted ${isML ? 'ml-text' : ''}`}>{t('effects.noPart')}</p>
            </div>
          )}

          {/* Closing note (mixed/adulterated drugs) */}
          {content.note && (
            <div className="tone-amber border rounded-card p-3 flex items-start gap-2">
              <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className={`text-xs font-bold text-primary ${isML ? 'ml-text' : ''}`}>{t('effects.noteHeading')}</p>
                <p className={`text-xs text-secondary leading-relaxed mt-0.5 ${isML ? 'ml-text' : ''}`}>{tx(content.note)}</p>
              </div>
            </div>
          )}

          {/* Pregnancy note — only on the female figure */}
          {figure === 'female' && content.pregnancy && (
            <div className="tone-violet border rounded-card p-3 flex items-start gap-2">
              <Baby size={13} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className={`text-xs font-bold text-primary ${isML ? 'ml-text' : ''}`}>{t('effects.pregnancyHeading')}</p>
                <p className={`text-xs text-secondary leading-relaxed mt-0.5 ${isML ? 'ml-text' : ''}`}>{tx(content.pregnancy)}</p>
              </div>
            </div>
          )}

          <p className={`text-[11px] text-muted flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
            <Info size={12} className="mt-0.5 shrink-0" />
            {t('effects.nonGraphicNote')}
          </p>
          <p className={`text-[11px] text-muted ${isML ? 'ml-text' : ''}`}>{t('effects.source')}</p>
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
