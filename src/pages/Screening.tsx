import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ClipboardList, RefreshCw, Phone, AlertCircle,
  ChevronLeft, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

type Answer = 'yes' | 'sometimes' | 'no' | null;
type ResultKey = 'low' | 'moderate' | 'high';

function scoreAnswer(a: Answer): number {
  if (a === 'yes') return 2;
  if (a === 'sometimes') return 1;
  return 0;
}

function getResultKey(total: number, max: number): ResultKey {
  const r = total / max;
  if (r < 0.3) return 'low';
  if (r < 0.6) return 'moderate';
  return 'high';
}

const RESULT_CONFIG = {
  low: {
    card: 'tone-emerald border',
    icon: <CheckCircle2 size={18} className="text-emerald-600" />,
  },
  moderate: {
    card: 'tone-amber border',
    icon: <AlertCircle size={18} className="text-amber-600" />,
  },
  high: {
    card: 'tone-teal border',
    icon: <Phone size={18} className="text-teal-600" />,
  },
};

type ChatItem =
  | { kind: 'intro'; id: string }
  | { kind: 'action'; id: string }
  | { kind: 'question'; id: string; index: number; text: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'result'; id: string; resultKey: ResultKey };

function buildChatItems(
  started: boolean,
  submitted: boolean,
  current: number,
  answers: Answer[],
  questions: string[],
  resultKey: ResultKey,
  t: (key: string) => string,
): ChatItem[] {
  const items: ChatItem[] = [{ kind: 'intro', id: 'intro' }];

  if (!started) {
    items.push({ kind: 'action', id: 'action' });
    return items;
  }

  const lastQuestion = submitted ? questions.length - 1 : current;

  for (let i = 0; i <= lastQuestion; i++) {
    items.push({ kind: 'question', id: `q-${i}`, index: i, text: questions[i] });
    if (answers[i] !== null) {
      items.push({ kind: 'user', id: `u-${i}`, text: t(`screening.${answers[i]}`) });
    }
  }

  if (submitted) {
    items.push({ kind: 'result', id: 'result', resultKey });
  }

  return items;
}

function AssistantAvatar() {
  return (
    <div
      className="shrink-0 w-7 h-7 rounded-full bg-accent-soft border border-border flex items-center justify-center"
      aria-hidden="true"
    >
      <ClipboardList size={14} className="text-violet-600" />
    </div>
  );
}

export function Screening() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();
  const tokens = useContactTokens();
  const vimukthi = findContact(data, 'vimukthi-14405');
  const bottomRef = useRef<HTMLDivElement>(null);

  const questions = t('screening.questions', { returnObjects: true }) as string[];
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const total = answers.reduce((s, a) => s + scoreAnswer(a), 0);
  const max = questions.length * 2;
  const resultKey = getResultKey(total, max);
  const cfg = RESULT_CONFIG[resultKey];

  const chatItems = useMemo(
    () => buildChatItems(started, submitted, current, answers, questions, resultKey, t),
    [started, submitted, current, answers, questions, resultKey, t, i18n.language],
  );

  const progress = submitted
    ? 100
    : started
      ? ((current + (answers[current] !== null && current === questions.length - 1 ? 1 : 0)) / questions.length) * 100
      : 0;

  const answer = (val: Answer) => {
    const updated = [...answers];
    updated[current] = val;
    for (let i = current + 1; i < updated.length; i++) updated[i] = null;
    setAnswers(updated);
    if (current < questions.length - 1) setCurrent(current + 1);
  };

  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const restart = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrent(0);
    setSubmitted(false);
    setStarted(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [started, submitted, current, answers]);

  const showAnswerChips = started && !submitted;
  const showSubmitChip = showAnswerChips && current === questions.length - 1 && answers[current] !== null;
  const showBeginChip = !started;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
        {/* Chat header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <AssistantAvatar />
            <div className="min-w-0 flex-1">
              <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
                {t('screening.heading')}
              </p>
              <p className={`text-[11px] text-muted truncate ${isML ? 'ml-text' : ''}`}>
                {t('appName')} · {t('guide.chatPrivate')}
              </p>
              {started && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold text-muted tabular-nums shrink-0">
                    {submitted ? questions.length : current + 1}/{questions.length}
                  </span>
                  <div className="flex-1 h-1 bg-surface-3 rounded-full overflow-hidden min-w-[4rem]">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {started && !submitted && (
              <button
                type="button"
                onClick={back}
                disabled={current === 0}
                className="btn-ghost py-1.5 px-2.5 text-xs disabled:opacity-40"
                aria-label={t('screening.prev')}
              >
                <ChevronLeft size={14} />
                <span className={isML ? 'ml-text' : ''}>{t('screening.prev')}</span>
              </button>
            )}
            {started && (
              <button
                type="button"
                onClick={restart}
                className="btn-ghost py-1.5 px-2.5 text-xs"
              >
                <RefreshCw size={13} />
                <span className={isML ? 'ml-text' : ''}>{t('screening.restart')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {chatItems.map((item) => {
            if (item.kind === 'intro') {
              return (
                <div key={item.id} className="flex items-start gap-2 fade-up">
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
                    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {t('screening.intro')}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.kind === 'action') {
              return (
                <div key={item.id} className="flex items-start gap-2 fade-up">
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
                    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {t('screening.startPrompt')}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.kind === 'user') {
              return (
                <div key={item.id} className="flex justify-end fade-up">
                  <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-accent text-accent-text px-3.5 py-2.5 shadow-sm">
                    <p className={`text-sm font-semibold leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.kind === 'question') {
              return (
                <div key={item.id} className="flex items-start gap-2 fade-up">
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
                    <p className={`text-[10px] font-bold text-muted mb-1 tabular-nums ${isML ? 'ml-text' : ''}`}>
                      {item.index + 1}/{questions.length}
                    </p>
                    <p className={`text-sm font-semibold text-primary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <ChatResult
                key={item.id}
                resultKey={item.resultKey}
                cfg={cfg}
                isML={isML}
                tokens={tokens}
                vimukthi={vimukthi}
              />
            );
          })}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Quick replies */}
        {(showBeginChip || showAnswerChips) && (
          <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3 flex flex-col items-center text-center">
            <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
              {showBeginChip
                ? t('guide.chatHint')
                : showSubmitChip
                  ? t('screening.seeResultPrompt')
                  : `${t('screening.pickAnswer')} · ${current + 1}/${questions.length}`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {showBeginChip && (
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className={`rounded-full border border-accent bg-accent text-accent-text px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity ${isML ? 'ml-text' : ''}`}
                >
                  {t('screening.start')}
                </button>
              )}
              {showAnswerChips && !showSubmitChip && (
                (['yes', 'sometimes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => answer(val)}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors min-h-[44px] ${
                      answers[current] === val
                        ? 'border-accent bg-accent text-accent-text'
                        : 'border-border-strong bg-surface-2 text-primary hover:border-accent hover:bg-accent-soft'
                    } ${isML ? 'ml-text' : ''}`}
                  >
                    {t(`screening.${val}`)}
                  </button>
                ))
              )}
              {showSubmitChip && (
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  className={`rounded-full border border-accent bg-accent text-accent-text px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity ${isML ? 'ml-text' : ''}`}
                >
                  {t('screening.submit')}
                </button>
              )}
            </div>
            {showBeginChip && (
              <p className={`text-[10px] text-muted mt-2 leading-relaxed max-w-md ${isML ? 'ml-text' : ''}`}>
                {t('screening.disclaimer', tokens)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatResult({
  resultKey, cfg, isML, tokens, vimukthi,
}: {
  resultKey: ResultKey;
  cfg: (typeof RESULT_CONFIG)[ResultKey];
  isML: boolean;
  tokens: ReturnType<typeof useContactTokens>;
  vimukthi: ReturnType<typeof findContact>;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
        <div className={`rounded-2xl rounded-tl-md border px-3.5 py-3 ${cfg.card}`}>
          <div className="flex items-start gap-2.5">
            {cfg.icon}
            <div>
              <p className={`text-sm font-bold text-primary mb-1 ${isML ? 'ml-text' : ''}`}>
                {t(`screening.results.${resultKey}.label`)}
              </p>
              <p className={`text-sm leading-relaxed text-secondary ${isML ? 'ml-text' : ''}`}>
                {t(`screening.results.${resultKey}.message`, tokens)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3">
          <p className={`text-sm font-semibold text-primary mb-2.5 ${isML ? 'ml-text' : ''}`}>
            {t('screening.alwaysMessage', tokens)}
          </p>
          {vimukthi && (
            <PhoneLink
              phone={vimukthi.value}
              label={isML ? vimukthi.label_ml : vimukthi.label_en}
              className="btn-action bg-accent text-accent-text hover:opacity-90"
            >
              <Phone size={12} />
              {vimukthi.value} — Vimukthi
            </PhoneLink>
          )}
        </div>

        <Link
          to="/get-help"
          className="rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
        >
          <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
            {t('nav.getHelp')}
          </span>
          <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
        </Link>
      </div>
    </div>
  );
}
