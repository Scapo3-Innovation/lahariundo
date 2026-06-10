import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Scale, AlertTriangle, CheckCircle, XCircle, EyeOff, PhoneCall, ShieldCheck,
  ChevronLeft, RotateCcw, ChevronRight,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

type Step = 'home' | 's64a' | 's64a_conditions' | 's64a_limitations' | 'confidentiality' | 'legalAid';

interface Option { key: string; next: Step }
interface MenuNode { kind: 'menu'; options: Option[] }
interface ContentNode { kind: 'content'; step: Step; options: Option[] }
type Node = MenuNode | ContentNode;

const NODES: Record<Step, Node> = {
  home: {
    kind: 'menu',
    options: [
      { key: 's64a', next: 's64a' },
      { key: 'confidentiality', next: 'confidentiality' },
      { key: 'legalAid', next: 'legalAid' },
    ],
  },
  s64a: {
    kind: 'content',
    step: 's64a',
    options: [
      { key: 'conditions', next: 's64a_conditions' },
      { key: 'limitations', next: 's64a_limitations' },
      { key: 'home', next: 'home' },
    ],
  },
  s64a_conditions: {
    kind: 'content',
    step: 's64a_conditions',
    options: [
      { key: 'limitations', next: 's64a_limitations' },
      { key: 'home', next: 'home' },
    ],
  },
  s64a_limitations: {
    kind: 'content',
    step: 's64a_limitations',
    options: [
      { key: 'conditions', next: 's64a_conditions' },
      { key: 'home', next: 'home' },
    ],
  },
  confidentiality: {
    kind: 'content',
    step: 'confidentiality',
    options: [{ key: 'home', next: 'home' }],
  },
  legalAid: {
    kind: 'content',
    step: 'legalAid',
    options: [{ key: 'home', next: 'home' }],
  },
};

type ChatItem =
  | { kind: 'intro'; id: string }
  | { kind: 'disclaimer'; id: string }
  | { kind: 'menu'; id: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'content'; id: string; step: Step };

function findOption(from: Step, to: Step): Option | undefined {
  const node = NODES[from];
  return node.options.find((o) => o.next === to);
}

function optionLabel(key: string, t: (k: string) => string): string {
  if (key === 'home') return t('rights.chatMenuOther');
  if (key === 'conditions') return t('rights.chatFollowConditions');
  if (key === 'limitations') return t('rights.chatFollowLimitations');
  return t(`rights.menu.${key}`);
}

function buildChatItems(path: Step[], t: (key: string) => string): ChatItem[] {
  const items: ChatItem[] = [
    { kind: 'intro', id: 'intro' },
    { kind: 'disclaimer', id: 'disclaimer' },
  ];

  for (let i = 0; i < path.length; i++) {
    const step = path[i];
    const node = NODES[step];

    if (i > 0) {
      const prev = path[i - 1];
      const opt = findOption(prev, step);
      if (opt) {
        items.push({ kind: 'user', id: `u-${prev}-${opt.key}`, text: optionLabel(opt.key, t) });
      }
    }

    if (node.kind === 'menu') {
      items.push({ kind: 'menu', id: `menu-${step}` });
    } else {
      items.push({ kind: 'content', id: `c-${step}`, step });
    }
  }

  return items;
}

function AssistantAvatar() {
  return (
    <div
      className="shrink-0 w-7 h-7 rounded-full bg-accent-soft border border-border flex items-center justify-center"
      aria-hidden="true"
    >
      <Scale size={14} className="text-indigo-600 dark:text-indigo-400" />
    </div>
  );
}

export function Rights() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();
  const tokens = useContactTokens();
  const legalAidContact = findContact(data, 'legal-aid-15100');
  const deaddictionContact = findContact(data, 'deaddiction-14446');
  const bottomRef = useRef<HTMLDivElement>(null);

  const [path, setPath] = useState<Step[]>(['home']);
  const current = path[path.length - 1];
  const currentNode = NODES[current];
  const chatItems = useMemo(() => buildChatItems(path, t), [path, t, i18n.language]);

  const choose = (next: Step) => {
    if (next === 'home') setPath(['home']);
    else setPath((p) => [...p, next]);
  };

  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const startOver = () => setPath(['home']);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [path]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AssistantAvatar />
            <div className="min-w-0">
              <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
                {t('rights.heading')}
              </p>
              <p className={`text-[11px] text-muted truncate ${isML ? 'ml-text' : ''}`}>
                {t('appName')} · {t('rights.chatPlainLanguage')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={back}
              disabled={path.length === 1}
              className="btn-ghost py-1.5 px-2.5 text-xs disabled:opacity-40"
              aria-label={t('guide.back')}
            >
              <ChevronLeft size={14} />
              <span className={isML ? 'ml-text' : ''}>{t('guide.back')}</span>
            </button>
            {path.length > 1 && (
              <button
                type="button"
                onClick={startOver}
                className="btn-ghost py-1.5 px-2.5 text-xs"
              >
                <RotateCcw size={13} />
                <span className={isML ? 'ml-text' : ''}>{t('guide.startOver')}</span>
              </button>
            )}
          </div>
        </div>

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
                      {t('rights.intro')}
                    </p>
                  </div>
                </div>
              );
            }

            if (item.kind === 'disclaimer') {
              return (
                <div key={item.id} className="flex items-start gap-2 fade-up">
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md tone-red border px-3.5 py-2.5">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                        {t('rights.disclaimer', tokens)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (item.kind === 'menu') {
              return (
                <div key={item.id} className="flex items-start gap-2 fade-up">
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
                    <p className={`text-sm font-semibold text-primary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {t('rights.chatMenuQuestion')}
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

            return (
              <ContentBlock
                key={item.id}
                step={item.step}
                isML={isML}
                tokens={tokens}
                legalAidContact={legalAidContact}
                deaddictionContact={deaddictionContact}
              />
            );
          })}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
          <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
          <div className="flex flex-wrap gap-2">
            {currentNode.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => choose(opt.next)}
                className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors ${isML ? 'ml-text' : ''}`}
              >
                {optionLabel(opt.key, t)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentBlock({
  step, isML, tokens, legalAidContact, deaddictionContact,
}: {
  step: Step;
  isML: boolean;
  tokens: ReturnType<typeof useContactTokens>;
  legalAidContact: ReturnType<typeof findContact>;
  deaddictionContact: ReturnType<typeof findContact>;
}) {
  const { t } = useTranslation();

  if (step === 's64a') {
    const whatPoints = t('rights.s64a.whatPoints', { returnObjects: true }) as string[];

    return (
      <div className="flex items-start gap-2 fade-up">
        <AssistantAvatar />
        <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
          <div className="rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3">
            <p className={`text-sm font-bold text-primary mb-2 ${isML ? 'ml-text' : ''}`}>
              {t('rights.s64a.heading')}
            </p>
            <p className={`text-sm text-secondary leading-relaxed mb-3 ${isML ? 'ml-text' : ''}`}>
              {t('rights.s64a.whatBody')}
            </p>
            <ol className="flex flex-col gap-2">
              {Array.isArray(whatPoints) && whatPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{point}</p>
                </li>
              ))}
            </ol>
          </div>

          <Link
            to="/get-help"
            className="rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
          >
            <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
              {t('rights.ctas.getHelp')}
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
          </Link>
        </div>
      </div>
    );
  }

  if (step === 's64a_conditions') {
    const conditions = t('rights.s64a.conditions', { returnObjects: true }) as string[];

    return (
      <ListBubble
        heading={t('rights.s64a.conditionsHeading')}
        items={conditions}
        icon={<CheckCircle size={14} className="text-accent mt-0.5 shrink-0" />}
        isML={isML}
      />
    );
  }

  if (step === 's64a_limitations') {
    const limitations = t('rights.s64a.limitations', { returnObjects: true }) as string[];

    return (
      <ListBubble
        heading={t('rights.s64a.limitationsHeading')}
        items={limitations}
        icon={<XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />}
        isML={isML}
        tone="tone-red border"
      />
    );
  }

  if (step === 'confidentiality') {
    return (
      <div className="flex items-start gap-2 fade-up">
        <AssistantAvatar />
        <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
          <div className="rounded-2xl rounded-tl-md tone-indigo border px-3.5 py-3">
            <div className="flex items-center gap-2 mb-2">
              <EyeOff size={15} className="text-indigo-500" />
              <p className={`text-sm font-bold text-primary ${isML ? 'ml-text' : ''}`}>
                {t('rights.confidentiality.heading')}
              </p>
            </div>
            <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
              {t('rights.confidentiality.body', tokens)}
            </p>
          </div>
          <Link
            to="/report"
            className="rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
          >
            <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
              {t('rights.chatReportLink')}
            </span>
            <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
        <div className="rounded-2xl rounded-tl-md cta-banner px-3.5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={15} />
            <p className={`text-sm font-bold ${isML ? 'ml-text' : ''}`}>
              {t('rights.legalAid.heading')}
            </p>
          </div>
          <p className={`text-sm leading-relaxed mb-3 ${isML ? 'ml-text' : ''}`}>
            {t('rights.legalAid.body', tokens)}
          </p>
          {legalAidContact && (
            <PhoneLink
              phone={legalAidContact.value}
              label={isML ? legalAidContact.label_ml : legalAidContact.label_en}
              className="btn-action bg-surface text-teal-700 hover:bg-teal-50"
            >
              <PhoneCall size={12} />
              {t('rights.ctas.legalAid', tokens)}
            </PhoneLink>
          )}
        </div>

        {deaddictionContact && (
          <div className="rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3">
            <PhoneLink
              phone={deaddictionContact.value}
              label={isML ? deaddictionContact.label_ml : deaddictionContact.label_en}
              className="btn-action bg-accent text-accent-text hover:opacity-90 w-full justify-center"
            >
              <PhoneCall size={12} />
              {t('rights.ctas.deaddiction', tokens)}
            </PhoneLink>
          </div>
        )}
      </div>
    </div>
  );
}

function ListBubble({
  heading, items, icon, isML, tone = 'bg-surface-2 border-border',
}: {
  heading: string;
  items: string[];
  icon: ReactNode;
  isML: boolean;
  tone?: string;
}) {
  return (
    <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className={`min-w-0 max-w-[92%] rounded-2xl rounded-tl-md border px-3.5 py-3 ${tone}`}>
        <p className={`text-sm font-bold text-primary mb-2.5 ${isML ? 'ml-text' : ''}`}>{heading}</p>
        <ul className="flex flex-col gap-2.5">
          {Array.isArray(items) && items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              {icon}
              <span className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
