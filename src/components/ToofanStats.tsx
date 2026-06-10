import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, CalendarClock, FileText, AlertTriangle } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import type { ToofanStats as Stats } from '../types';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Count up from 0 to target with requestAnimationFrame. No storage, no network. */
function useCountUp(target: number, durationMs = 1100): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (prefersReducedMotion()) { setValue(target); return; }
    let raf = 0;
    let start: number | null = null;
    const tick = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min(1, (ts - start) / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}

function Counter({ target, label, isML }: { target: number; label: string; isML: boolean }) {
  const value = useCountUp(target);
  return (
    <div className="compact-card text-center">
      <p className="heading-text text-3xl font-extrabold text-accent tabular-nums">
        {value.toLocaleString('en-IN')}
      </p>
      <p className={`text-xs text-secondary mt-0.5 ${isML ? 'ml-text' : ''}`}>{label}</p>
    </div>
  );
}

function SeizureBar({ stat, max, isML }: { stat: Stats['seizures'][number]; max: number; isML: boolean }) {
  const value = useCountUp(stat.value);
  const pct = max > 0 ? Math.max(4, Math.round((stat.value / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className={`text-xs text-secondary ${isML ? 'ml-text' : ''}`}>
          {isML ? stat.label_ml : stat.label_en}
        </span>
        <span className="text-xs font-bold text-primary tabular-nums">
          {value.toLocaleString('en-IN')} <span className={`text-muted font-semibold ${isML ? 'ml-text' : ''}`}>{isML ? stat.unit_ml : stat.unit_en}</span>
        </span>
      </div>
      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ToofanStats({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();
  const stats = data?.toofanStats;

  const headingRef = useRef<HTMLHeadingElement>(null);

  if (!stats) return null;

  const maxSeizure = stats.seizures.reduce((m, s) => Math.max(m, s.value), 0);
  const sourceLabel = isML ? stats.source_label_ml : stats.source_label_en;

  return (
    <section className={`card p-4 flex flex-col gap-3 ${className}`} aria-labelledby="toofan-heading">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-accent shrink-0" />
        <h2
          id="toofan-heading"
          ref={headingRef}
          className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}
        >
          {t('toofan.heading')}
        </h2>
      </div>

      {/* Provenance — always visible so figures are never mistaken for live data */}
      <div className="flex flex-col gap-1.5">
        <p className={`text-[11px] text-muted flex items-center gap-1.5 ${isML ? 'ml-text' : ''}`}>
          <CalendarClock size={12} className="shrink-0" />
          <span className="font-semibold">{t('toofan.asOf')}:</span> {stats.as_of_date}
        </p>
        <p className={`text-[11px] text-muted flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
          <FileText size={12} className="shrink-0 mt-0.5" />
          <span><span className="font-semibold">{t('toofan.source')}:</span> {sourceLabel}</span>
        </p>
        {stats.placeholder && (
          <p className={`text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-start gap-1.5 tone-amber border rounded-lg px-2 py-1.5 ${isML ? 'ml-text' : ''}`}>
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            {t('toofan.placeholder')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Counter target={stats.cases} label={t('toofan.cases')} isML={isML} />
        <Counter target={stats.arrests} label={t('toofan.arrests')} isML={isML} />
      </div>

      {stats.seizures.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className={`ui-label ${isML ? 'ml-text' : ''}`}>{t('toofan.seizuresHeading')}</p>
          {stats.seizures.map((s) => (
            <SeizureBar key={s.id} stat={s} max={maxSeizure} isML={isML} />
          ))}
        </div>
      )}
    </section>
  );
}
