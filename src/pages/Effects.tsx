import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, Info, ArrowRight, Thermometer, AlertTriangle, Baby } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
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

  const chooseSubstance = (s: SubstanceId) => { setSubstance(s); setOrgan(null); };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<HeartPulse size={18} className="text-rose-600" />}
        title={t('effects.heading')}
        subtitle={t('effects.intro')}
        isML={isML}
      />

      {/* Substance picker — full width grid */}
      <section className="card p-4 sm:p-5">
        <p className={`form-label ${isML ? 'ml-text' : ''}`}>{t('effects.pickSubstance')}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          {SUBSTANCES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => chooseSubstance(s)}
              aria-pressed={substance === s}
              className={`identity-pick-btn identity-pick-btn-compact text-center ${substance === s ? 'identity-pick-btn-active' : ''} ${isML ? 'ml-text' : ''}`}
            >
              {t(`effects.substances.${s}`)}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-start">
        {/* Figure column */}
        <div className="flex flex-col gap-3">
          <section className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <p className={`form-label mb-0 ${isML ? 'ml-text' : ''}`}>{t('effects.figureLabel')}</p>
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

            <p className={`text-xs text-muted text-center mt-3 leading-relaxed ${isML ? 'ml-text' : ''}`}>
              {t('effects.affectedLegend')}
            </p>
          </section>

          {/* Organ quick-pick */}
          <section className="card p-4">
            <p className={`form-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('effects.organListHeading')}</p>
            <div className="flex flex-wrap gap-2">
              {ORGANS.map((id) => {
                const isAffected = affected.includes(id);
                const isSel = organ === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOrgan(id)}
                    aria-pressed={isSel}
                    className={[
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors',
                      isSel
                        ? 'bg-accent text-accent-text border-accent'
                        : isAffected
                          ? 'bg-surface border-accent/40 text-primary hover:border-accent'
                          : 'bg-surface-2 border-border text-secondary hover:border-border-strong hover:text-primary',
                      isML ? 'ml-text' : '',
                    ].join(' ')}
                  >
                    {organLabel(id)}
                    {isAffected && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSel ? 'bg-accent-text' : 'bg-accent'}`} aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-24" aria-live="polite">
          {content.bodyWarning && (
            <div className="tone-amber border rounded-card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Thermometer size={15} className="text-amber-600 shrink-0" />
                <h3 className={`font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>
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
              className={`card p-4 sm:p-5 fade-up ${selectedIsEmergency ? 'tone-red border' : ''}`}
            >
              <p className={`text-xs text-muted mb-1 ${isML ? 'ml-text' : ''}`}>
                {t('effects.detailHeading')} · {organLabel(organ as OrganId)}
              </p>
              <h3 className={`font-bold text-primary text-base mb-2 ${isML ? 'ml-text' : ''}`}>
                {t(`effects.substances.${substance}`)}
              </h3>
              <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                {tx(selectedEffect.text)}
              </p>

              {selectedIsEmergency && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2.5">
                  <p className={`text-sm font-semibold text-red-700 dark:text-red-400 ${isML ? 'ml-text' : ''}`}>
                    {t('effects.emergencyText')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/resources?category=emergency"
                      className="btn-action bg-red-600 text-white hover:bg-red-700"
                    >
                      <AlertTriangle size={12} />
                      {t('effects.emergencyCta')}
                    </Link>
                    {emergencyContacts.map((c) => <ContactAction key={c.id} contact={c} />)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-6 flex items-center justify-center text-center min-h-[10rem]">
              <p className={`text-sm text-muted leading-relaxed max-w-xs ${isML ? 'ml-text' : ''}`}>
                {t('effects.selectOrgan')}
              </p>
            </div>
          )}

          {content.note && (
            <div className="tone-amber border rounded-card p-4 flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className={`text-sm font-semibold text-primary ${isML ? 'ml-text' : ''}`}>{t('effects.noteHeading')}</p>
                <p className={`text-sm text-secondary leading-relaxed mt-1 ${isML ? 'ml-text' : ''}`}>{tx(content.note)}</p>
              </div>
            </div>
          )}

          {figure === 'female' && content.pregnancy && (
            <div className="tone-violet border rounded-card p-4 flex items-start gap-2.5">
              <Baby size={14} className="text-violet-500 mt-0.5 shrink-0" />
              <div>
                <p className={`text-sm font-semibold text-primary ${isML ? 'ml-text' : ''}`}>{t('effects.pregnancyHeading')}</p>
                <p className={`text-sm text-secondary leading-relaxed mt-1 ${isML ? 'ml-text' : ''}`}>{tx(content.pregnancy)}</p>
              </div>
            </div>
          )}

          <div className="rounded-card border border-border bg-surface-2 p-4 space-y-2">
            <p className={`text-xs text-muted flex items-start gap-1.5 leading-relaxed ${isML ? 'ml-text' : ''}`}>
              <Info size={12} className="mt-0.5 shrink-0" />
              {t('effects.nonGraphicNote')}
            </p>
            <p className={`text-xs text-muted ${isML ? 'ml-text' : ''}`}>{t('effects.source')}</p>
          </div>
        </div>
      </div>

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
