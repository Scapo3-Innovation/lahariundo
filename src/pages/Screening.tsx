import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
 ClipboardList, RefreshCw, Phone, AlertCircle,
 ChevronRight, ChevronLeft, CheckCircle2,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { PageHeader } from '../components/PageHeader';

type Answer = 'yes' | 'sometimes' | 'no' | null;

function scoreAnswer(a: Answer): number {
 if (a === 'yes')    return 2;
 if (a === 'sometimes') return 1;
 return 0;
}

function getResultKey(total: number, max: number): 'low' | 'moderate' | 'high' {
 const r = total / max;
 if (r < 0.3) return 'low';
 if (r < 0.6) return 'moderate';
 return 'high';
}

const RESULT_CONFIG = {
 low: {
  bar: 'bg-emerald-500',
  card: 'tone-emerald border',
  text: 'text-emerald-800',
  icon: <CheckCircle2 size={18} className="text-emerald-600" />,
 },
 moderate: {
  bar: 'bg-amber-500',
  card: 'tone-amber border',
  text: 'text-amber-800',
  icon: <AlertCircle size={18} className="text-amber-600" />,
 },
 high: {
  bar: 'bg-teal-600',
  card: 'tone-teal border',
  text: 'text-teal-800',
  icon: <Phone size={18} className="text-teal-600" />,
 },
};

const ANSWER_STYLES = {
 yes:    { selected: 'border-rose-400 bg-rose-50 text-rose-700', idle: 'border-border text-secondary hover:border-rose-300 hover:bg-rose-50' },
 sometimes: { selected: 'border-amber-400 bg-amber-50 text-amber-700', idle: 'border-border text-secondary hover:border-amber-300 hover:bg-amber-50' },
 no:    { selected: 'border-emerald-400 bg-emerald-50 text-emerald-700', idle: 'border-border text-secondary hover:border-emerald-300 hover:bg-emerald-50' },
};

export function Screening() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 const questions = t('screening.questions', { returnObjects: true }) as string[];
 const [started,  setStarted]  = useState(false);
 const [current,  setCurrent]  = useState(0);
 const [answers,  setAnswers]  = useState<Answer[]>(Array(questions.length).fill(null));
 const [submitted, setSubmitted] = useState(false);

 const answer = (val: Answer) => {
  const updated = [...answers];
  updated[current] = val;
  setAnswers(updated);
  if (current < questions.length - 1) setCurrent(current + 1);
 };

 const restart = () => {
  setAnswers(Array(questions.length).fill(null));
  setCurrent(0);
  setSubmitted(false);
  setStarted(false);
 };

 const total   = answers.reduce((s, a) => s + scoreAnswer(a), 0);
 const max    = questions.length * 2;
 const resultKey = getResultKey(total, max);
 const cfg    = RESULT_CONFIG[resultKey];

 if (!started) {
  return (
   <div className="fade-up">
    <PageHeader
     icon={<ClipboardList size={18} className="text-violet-600" />}
     title={t('screening.heading')}
     subtitle={t('screening.intro')}
     isML={isML}
    />

    <div className="flex items-start gap-2 tone-amber border rounded-card p-3 mb-5">
     <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
     <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {t('screening.disclaimer')}
     </p>
    </div>

    <button
     onClick={() => setStarted(true)}
     className="btn-primary w-full sm:w-auto"
    >
     {t('screening.start')}
    </button>
   </div>
  );
 }

 if (submitted) {
  return (
   <div className="fade-up">
    <h1 className={`heading-text text-xl sm:text-2xl font-extrabold text-primary mb-4 ${isML ? 'ml-text' : ''}`}>
     {t(`screening.results.${resultKey}.label`)}
    </h1>

    <div className={`rounded-card border p-4 mb-4 ${cfg.card}`}>
     <div className="flex items-start gap-2.5">
      {cfg.icon}
      <p className={`text-sm leading-relaxed text-secondary ${isML ? 'ml-text' : ''}`}>
       {t(`screening.results.${resultKey}.message`)}
      </p>
     </div>
    </div>

    <div className="cta-banner mb-3">
     <p className={`text-sm mb-2.5 font-semibold ${isML ? 'ml-text' : ''}`}>
      {t('screening.alwaysMessage')}
     </p>
     <PhoneLink
      phone="14405"
      label="Vimukthi Counselling"
      className="btn-action bg-surface text-teal-700 hover:bg-teal-50"
     >
      <Phone size={12} />
      14405 — Vimukthi
     </PhoneLink>
    </div>

    <Link
     to="/get-help"
     className="card-hover flex items-center justify-between p-3 mb-4 group"
    >
     <span className={`text-sm font-semibold text-teal-700 ${isML ? 'ml-text' : ''}`}>
      {t('nav.getHelp')}
     </span>
     <ChevronRight size={16} className="text-muted group-hover:text-teal-500 transition-colors" />
    </Link>

    <button
     onClick={restart}
     className="flex items-center gap-1.5 text-sm text-muted hover:text-secondary transition-colors min-h-[44px] px-2"
    >
     <RefreshCw size={12} />
     {t('screening.restart')}
    </button>
   </div>
  );
 }

 const currentAnswer = answers[current];
 const progress   = (current / questions.length) * 100;

 return (
  <div className="fade-up">
   <div className="flex items-center gap-2.5 mb-4">
    <span className="text-xs font-bold text-muted tabular-nums">
     {current + 1}/{questions.length}
    </span>
    <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
     <div
      className="h-full bg-teal-600 rounded-full transition-all duration-400"
      style={{ width: `${progress}%` }}
     />
    </div>
    <ClipboardList size={13} className="text-muted" />
   </div>

   <div className="compact-card mb-4 min-h-[5rem] flex items-center">
    <p className={`text-sm sm:text-base text-primary leading-relaxed font-medium ${isML ? 'ml-text' : ''}`}>
     {questions[current]}
    </p>
   </div>

   <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
    {(['yes', 'sometimes', 'no'] as const).map((val) => {
     const s = ANSWER_STYLES[val];
     const active = currentAnswer === val;
     return (
      <button
       key={val}
       onClick={() => answer(val)}
       className={`py-3 px-3 rounded-lg border-2 text-sm font-semibold min-h-[44px] transition-all ${
        active ? s.selected : s.idle
       } ${isML ? 'ml-text' : ''}`}
      >
       {t(`screening.${val}`)}
      </button>
     );
    })}
   </div>

   <div className="flex justify-between items-center">
    <button
     onClick={() => setCurrent(Math.max(0, current - 1))}
     disabled={current === 0}
     className="flex items-center gap-1 text-sm text-muted hover:text-secondary disabled:opacity-30 transition-colors min-h-[44px] px-2"
    >
     <ChevronLeft size={14} />
     {t('screening.prev')}
    </button>

    {current === questions.length - 1 && currentAnswer !== null ? (
     <button
      onClick={() => setSubmitted(true)}
      className="btn-primary"
     >
      {t('screening.submit')}
     </button>
    ) : (
     <button
      onClick={() => current < questions.length - 1 && setCurrent(current + 1)}
      disabled={currentAnswer === null}
      className="flex items-center gap-1 text-sm text-teal-700 font-semibold hover:text-teal-900 disabled:opacity-30 transition-colors min-h-[44px] px-2"
     >
      {t('screening.next')}
      <ChevronRight size={14} />
     </button>
    )}
   </div>
  </div>
 );
}
