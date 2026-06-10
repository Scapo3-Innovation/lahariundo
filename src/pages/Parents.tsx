import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Users, Check, X, ChevronRight, ChevronLeft, Phone, GraduationCap, RotateCcw,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

type WizardStep = 'intro' | 'signs' | 'talk' | 'next' | 'help';
type Role = 'parent' | 'teacher';

const STEPS: WizardStep[] = ['intro', 'signs', 'talk', 'next', 'help'];

const WARNING_SIGNS = [
  'Sudden changes in mood, behaviour, or friends',
  'Loss of interest in school, sports, or hobbies',
  'Unexplained money missing from home',
  'Staying out very late or disappearing for days',
  'New secretive behaviour; hiding phone/belongings',
  'Red eyes, smell of smoke, slurred speech',
  'Declining grades or school attendance',
  'Sudden new expensive items with no explanation',
];

const WARNING_SIGNS_ML = [
  'പെട്ടെന്നൊരു മൂഡ്, പെരുമാറ്റം, സുഹൃദ് മാറ്റം',
  'സ്കൂൾ, കായിക, ഹോബിയിൽ താൽപ്പര്യം നഷ്ടം',
  'വീട്ടിൽ നിന്ന് പണം കാണാതാകൽ',
  'വളരെ വൈകി തിരിച്ചുവരൽ അല്ലെങ്കിൽ ദിവസങ്ങൾ കാണാതിരിക്കൽ',
  'ഫോൺ/ജാമ്യ വസ്തുക്കൾ ഒളിപ്പിക്കൽ',
  'ചുവന്ന കണ്ണ്, പുക മണം, അവ്യക്ത സംഭാഷണം',
  'ഗ്രേഡ് കുറഞ്ഞ് / സ്കൂൾ ഒഴിവാക്കൽ',
  'കാരണം ഇല്ലാതെ പുതിയ വിലകൂടിയ സാധനങ്ങൾ',
];


type TalkTip = { kind: 'do' | 'dont'; text: string };

export function Parents() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();
  const tokens = useContactTokens();
  const vimukthi = findContact(data, 'vimukthi-14405');

  const doItems = t('parents.doItems', { returnObjects: true }) as string[];
  const dontItems = t('parents.dontItems', { returnObjects: true }) as string[];
  const nextSteps = t('parents.nextSteps', { returnObjects: true, ...tokens }) as string[];
  const teacherItems = t('parents.teacherItems', { returnObjects: true }) as string[];
  const warningSigns = isML ? WARNING_SIGNS_ML : WARNING_SIGNS;

  const talkTips: TalkTip[] = [
    ...doItems.map((text) => ({ kind: 'do' as const, text })),
    ...dontItems.map((text) => ({ kind: 'dont' as const, text })),
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const [role, setRole] = useState<Role>('parent');
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [tipIdx, setTipIdx] = useState(0);

  const step = STEPS[stepIdx];
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const restart = () => {
    setStepIdx(0);
    setChecked(new Set());
    setTipIdx(0);
    setRole('parent');
  };

  const goNext = () => {
    if (step === 'talk' && tipIdx < talkTips.length - 1) {
      setTipIdx((i) => i + 1);
      return;
    }
    if (stepIdx < STEPS.length - 1) {
      setStepIdx((i) => i + 1);
      if (step === 'talk') setTipIdx(0);
    }
  };

  const goBack = () => {
    if (step === 'talk' && tipIdx > 0) {
      setTipIdx((i) => i - 1);
      return;
    }
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
      if (STEPS[stepIdx - 1] === 'talk') setTipIdx(talkTips.length - 1);
    }
  };

  const toggleSign = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const currentTip = talkTips[tipIdx];
  const atLastTip = step === 'talk' && tipIdx >= talkTips.length - 1;
  const nextLabel = step === 'talk' && !atLastTip
    ? t('parents.nextTip')
    : stepIdx === STEPS.length - 1
      ? t('parents.restart')
      : t('parents.continue');

  const handlePrimary = () => {
    if (stepIdx === STEPS.length - 1) restart();
    else goNext();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
        {/* Header */}
        <div className="shrink-0 px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-accent-soft border border-border flex items-center justify-center shrink-0">
                <Users size={16} className="text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
                  {t('parents.heading')}
                </p>
                <p className={`text-[11px] text-muted tabular-nums ${isML ? 'ml-text' : ''}`}>
                  {t('parents.wizard.stepOf', { current: stepIdx + 1, total: STEPS.length })}
                </p>
              </div>
            </div>
            {stepIdx > 0 && (
              <button type="button" onClick={restart} className="btn-ghost py-1.5 px-2.5 text-xs shrink-0">
                <RotateCcw size={13} />
                <span className={isML ? 'ml-text' : ''}>{t('parents.restart')}</span>
              </button>
            )}
          </div>

          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-accent rounded-full transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {STEPS.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <span
                  key={s}
                  className={[
                    'shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors',
                    active ? 'bg-accent text-accent-text' : done ? 'bg-accent-soft text-accent' : 'bg-surface-3 text-muted',
                    isML ? 'ml-text' : '',
                  ].join(' ')}
                >
                  {t(`parents.wizard.${s}`)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {step === 'intro' && (
            <div className="fade-up flex flex-col gap-5 max-w-lg mx-auto">
              <div>
                <h2 className={`heading-text text-lg font-bold text-primary mb-2 ${isML ? 'ml-text' : ''}`}>
                  {t('parents.heading')}
                </h2>
                <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                  {t('parents.intro')}
                </p>
              </div>
              <div>
                <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('parents.roleQuestion')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(['parent', 'teacher'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={[
                        'rounded-card border-2 p-4 text-left transition-all min-h-[4.5rem]',
                        role === r
                          ? 'border-accent bg-accent-soft'
                          : 'border-border bg-surface-2 hover:border-border-strong',
                      ].join(' ')}
                    >
                      <span className={`text-sm font-bold text-primary block ${isML ? 'ml-text' : ''}`}>
                        {t(`parents.role${r === 'parent' ? 'Parent' : 'Teacher'}`)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'signs' && (
            <div className="fade-up flex flex-col gap-4 max-w-2xl mx-auto w-full">
              <div>
                <h2 className={`heading-text text-lg font-bold text-primary mb-1 ${isML ? 'ml-text' : ''}`}>
                  {t('parents.warningHeading')}
                </h2>
                <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                  {t('parents.warningNote')}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className={`ui-label ${isML ? 'ml-text' : ''}`}>{t('parents.signsTapHint')}</p>
                {checked.size > 0 && (
                  <span className={`inline-flex items-center gap-1.5 rounded-full bg-accent text-accent-text px-3 py-1 text-xs font-bold ${isML ? 'ml-text' : ''}`}>
                    <Check size={12} />
                    {t('parents.signsSelected', { count: checked.size })}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {warningSigns.map((sign, i) => {
                  const on = checked.has(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSign(i)}
                      aria-pressed={on}
                      className={[
                        'relative flex flex-col items-center justify-center text-center gap-2 rounded-card border-2 p-3 sm:p-3.5 min-h-[7.25rem] sm:min-h-[8rem] transition-all',
                        on
                          ? 'border-accent bg-accent-soft ring-2 ring-accent/25 shadow-sm'
                          : 'border-border bg-surface-2 hover:border-accent/50 hover:bg-surface-3',
                      ].join(' ')}
                    >
                      {on && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent text-accent-text flex items-center justify-center shadow-sm">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                      <span className={`text-[11px] sm:text-xs font-semibold text-primary leading-snug ${isML ? 'ml-text' : ''}`}>
                        {sign}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'talk' && currentTip && (
            <div className="fade-up flex flex-col gap-4 max-w-lg mx-auto">
              <div>
                <h2 className={`heading-text text-lg font-bold text-primary mb-1 ${isML ? 'ml-text' : ''}`}>
                  {t('parents.talkHeading')}
                </h2>
                <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                  {t('parents.talkNote')}
                </p>
              </div>

              <p className={`text-xs font-bold text-muted tabular-nums ${isML ? 'ml-text' : ''}`}>
                {t('parents.tipOf', { current: tipIdx + 1, total: talkTips.length })}
              </p>

              <div
                className={[
                  'rounded-card border-2 p-5 min-h-[10rem] flex flex-col',
                  currentTip.kind === 'do'
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 mb-3">
                  {currentTip.kind === 'do' ? (
                    <Check size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <X size={16} className="text-rose-500 shrink-0" />
                  )}
                  <span
                    className={[
                      'text-xs font-bold uppercase tracking-wide',
                      currentTip.kind === 'do' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400',
                      isML ? 'ml-text' : '',
                    ].join(' ')}
                  >
                    {currentTip.kind === 'do' ? t('parents.talkDo') : t('parents.talkDont')}
                  </span>
                </div>
                <p
                  className={[
                    'text-base sm:text-lg font-semibold leading-relaxed flex-1',
                    currentTip.kind === 'do' ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100',
                    isML ? 'ml-text' : '',
                  ].join(' ')}
                >
                  {currentTip.text}
                </p>
              </div>
            </div>
          )}

          {step === 'next' && (
            <div className="fade-up flex flex-col gap-4 max-w-lg mx-auto">
              <h2 className={`heading-text text-lg font-bold text-primary ${isML ? 'ml-text' : ''}`}>
                {t('parents.nextHeading')}
              </h2>
              <ol className="flex flex-col gap-2">
                {nextSteps.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-card border border-border bg-surface-2 p-3.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-text text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {step === 'help' && (
            <div className="fade-up flex flex-col gap-4 max-w-lg mx-auto">
              <div className="cta-banner p-4 flex flex-col gap-3">
                <div>
                  <p className={`text-sm font-bold ${isML ? 'ml-text' : ''}`}>Vimukthi Helpline</p>
                  <p className={`text-xs opacity-90 mt-0.5 ${isML ? 'ml-text' : ''}`}>
                    {t('parents.helplineSub')}
                  </p>
                </div>
                {vimukthi && (
                  <PhoneLink
                    phone={vimukthi.value}
                    label={isML ? vimukthi.label_ml : vimukthi.label_en}
                    className="inline-flex items-center justify-center gap-1.5 bg-surface text-teal-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors w-full min-h-[44px]"
                  >
                    <Phone size={13} />
                    {vimukthi.value}
                  </PhoneLink>
                )}
              </div>

              {role === 'teacher' && (
                <div className="rounded-card border border-border bg-surface-2 p-4">
                  <h3 className={`heading-text font-bold text-primary text-sm mb-3 flex items-center gap-2 ${isML ? 'ml-text' : ''}`}>
                    <GraduationCap size={16} className="text-secondary shrink-0" />
                    {t('parents.teacherHeading')}
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {teacherItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight size={13} className="text-accent mt-0.5 shrink-0" />
                        <span className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                to="/get-help"
                className="rounded-card border border-border bg-surface px-4 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
              >
                <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
                  {t('parents.ctaGetHelp')}
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="shrink-0 border-t border-border bg-surface px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIdx === 0}
            className="btn-ghost py-2 px-3 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            <span className={isML ? 'ml-text' : ''}>{t('guide.back')}</span>
          </button>
          <button
            type="button"
            onClick={handlePrimary}
            className="btn-primary py-2 px-4 text-sm"
          >
            <span className={isML ? 'ml-text' : ''}>{nextLabel}</span>
            {stepIdx < STEPS.length - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
