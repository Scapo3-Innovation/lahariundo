import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Compass, ChevronLeft, RotateCcw, ListChecks, PhoneCall, ArrowRight,
} from 'lucide-react';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

// ── Decision tree ──────────────────────────────────────────────────────────

interface Option { key: string; next: string }
interface QuestionNode { kind: 'question'; options: Option[] }
interface ResultNode {
  kind: 'result';
  contactIds: string[];
  link?: { route: string; key: string };
}
type Node = QuestionNode | ResultNode;

const NODES: Record<string, Node> = {
  start: {
    kind: 'question',
    options: [
      { key: 'found', next: 'found' },
      { key: 'using', next: 'using_danger' },
      { key: 'quit', next: 'quit' },
      { key: 'report', next: 'report' },
      { key: 'overdose', next: 'overdose' },
    ],
  },
  found: {
    kind: 'question',
    options: [
      { key: 'public', next: 'found_public' },
      { key: 'home', next: 'found_home' },
    ],
  },
  using_danger: {
    kind: 'question',
    options: [
      { key: 'yes', next: 'overdose' },
      { key: 'no', next: 'using_who' },
    ],
  },
  using_who: {
    kind: 'question',
    options: [
      { key: 'minor', next: 'using_minor' },
      { key: 'adult', next: 'using_adult' },
    ],
  },
  quit: {
    kind: 'question',
    options: [
      { key: 'talk', next: 'quit_talk' },
      { key: 'centre', next: 'quit_centre' },
      { key: 'legal', next: 'quit_legal' },
    ],
  },
  report: {
    kind: 'question',
    options: [
      { key: 'call', next: 'report_call' },
      { key: 'online', next: 'report_online' },
      { key: 'danger', next: 'overdose' },
    ],
  },

  found_public: { kind: 'result', contactIds: ['manas-call', 'kerala-wa-antinarcotics'] },
  found_home: { kind: 'result', contactIds: ['vimukthi-14405'], link: { route: '/worried', key: 'worried' } },
  using_minor: { kind: 'result', contactIds: ['childline-1098', 'vimukthi-14405'], link: { route: '/worried', key: 'worried' } },
  using_adult: { kind: 'result', contactIds: ['vimukthi-14405'], link: { route: '/worried', key: 'worried' } },
  quit_talk: { kind: 'result', contactIds: ['vimukthi-14405'] },
  quit_centre: { kind: 'result', contactIds: ['deaddiction-14446'], link: { route: '/get-help', key: 'getHelp' } },
  quit_legal: { kind: 'result', contactIds: ['legal-aid-15100'], link: { route: '/rights', key: 'rights' } },
  report_call: { kind: 'result', contactIds: ['manas-call', 'antinarcotics-cell-1', 'antinarcotics-cell-2'] },
  report_online: { kind: 'result', contactIds: ['kerala-wa-antinarcotics', 'manas-web', 'manas-email'] },
  overdose: { kind: 'result', contactIds: ['emergency-112', 'ambulance-108'] },
};

type ChatItem =
  | { kind: 'intro'; id: string }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'question'; id: string; nodeId: string; text: string }
  | { kind: 'result'; id: string; nodeId: string };

function findOption(fromId: string, toId: string): Option | undefined {
  const node = NODES[fromId];
  if (node.kind !== 'question') return undefined;
  return node.options.find((o) => o.next === toId);
}

function buildChatItems(path: string[], t: (key: string) => string): ChatItem[] {
  const items: ChatItem[] = [{ kind: 'intro', id: 'intro' }];

  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i];
    const node = NODES[nodeId];

    if (i > 0) {
      const prevId = path[i - 1];
      const opt = findOption(prevId, nodeId);
      if (opt) {
        items.push({
          kind: 'user',
          id: `u-${prevId}-${opt.key}`,
          text: t(`guide.q.${prevId}.options.${opt.key}`),
        });
      }
    }

    if (node.kind === 'question') {
      items.push({
        kind: 'question',
        id: `q-${nodeId}`,
        nodeId,
        text: t(`guide.q.${nodeId}.question`),
      });
    } else if (i === path.length - 1) {
      items.push({ kind: 'result', id: `r-${nodeId}`, nodeId });
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
      <Compass size={14} className="text-accent" />
    </div>
  );
}

export function Guide() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [path, setPath] = useState<string[]>(['start']);
  const currentId = path[path.length - 1];
  const currentNode = NODES[currentId];
  const chatItems = useMemo(() => buildChatItems(path, t), [path, t, i18n.language]);

  const choose = (next: string) => setPath((p) => [...p, next]);
  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const startOver = () => setPath(['start']);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [path]);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
        {/* Chat header */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <AssistantAvatar />
            <div className="min-w-0">
              <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
                {t('guide.heading')}
              </p>
              <p className={`text-[11px] text-muted truncate ${isML ? 'ml-text' : ''}`}>
                {t('appName')} · {t('guide.chatPrivate')}
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

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 flex flex-col gap-3"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {chatItems.map((item, index) => {
            const isLatest = index === chatItems.length - 1;

            if (item.kind === 'intro') {
              return (
                <div key={item.id} className={`flex items-start gap-2 fade-up ${isLatest ? '' : ''}`}>
                  <AssistantAvatar />
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
                    <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
                      {t('guide.intro')}
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
                nodeId={item.nodeId}
                node={NODES[item.nodeId] as ResultNode}
                isML={isML}
                contacts={findContacts(data, (NODES[item.nodeId] as ResultNode).contactIds)}
              />
            );
          })}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Quick replies */}
        {currentNode.kind === 'question' && (
          <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
            <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
            <div className="flex flex-wrap gap-2">
              {currentNode.options.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => choose(opt.next)}
                  className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors text-left ${isML ? 'ml-text' : ''}`}
                >
                  {t(`guide.q.${currentId}.options.${opt.key}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatResult({
  nodeId, node, isML, contacts,
}: {
  nodeId: string;
  node: ResultNode;
  isML: boolean;
  contacts: ReturnType<typeof findContacts>;
}) {
  const { t } = useTranslation();
  const tokens = useContactTokens();
  const steps = t(`guide.r.${nodeId}.steps`, { returnObjects: true, ...tokens }) as string[];
  const isEmergency = nodeId === 'overdose';

  return (
    <div className="flex items-start gap-2 fade-up">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
        <div className={`rounded-2xl rounded-tl-md border px-3.5 py-2.5 ${isEmergency ? 'tone-teal' : 'bg-accent-soft border-border'}`}>
          <p className={`text-sm font-bold text-primary leading-snug ${isML ? 'ml-text' : ''}`}>
            {t(`guide.r.${nodeId}.title`)}
          </p>
        </div>

        <div className="rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3">
          <p className={`flex items-center gap-1.5 ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
            <ListChecks size={13} className="text-accent" />
            {t('guide.stepsHeading')}
          </p>
          <ol className="flex flex-col gap-2">
            {Array.isArray(steps) && steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {contacts.length > 0 && (
          <div className="rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-3">
            <p className={`flex items-center gap-1.5 ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
              <PhoneCall size={13} className="text-accent" />
              {t('guide.contactsHeading')}
            </p>
            <div className="flex flex-col gap-2">
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 flex-wrap rounded-lg bg-surface border border-border px-3 py-2">
                  <span className={`text-sm font-semibold text-primary ${isML ? 'ml-text' : ''}`}>
                    {isML ? c.label_ml : c.label_en}
                  </span>
                  <ContactAction contact={c} />
                </div>
              ))}
            </div>
          </div>
        )}

        {node.link && (
          <Link
            to={node.link.route}
            className="rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
          >
            <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
              {t(`guide.links.${node.link.key}`)}
            </span>
            <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
          </Link>
        )}
      </div>
    </div>
  );
}
