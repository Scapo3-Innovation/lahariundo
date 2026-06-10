import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Compass, ChevronRight, ChevronLeft, RotateCcw, ListChecks, PhoneCall, ArrowRight, Info,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ContactAction } from '../components/ContactAction';
import { useAppData } from '../context/DataContext';
import { findContacts } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

// ── Decision tree ──────────────────────────────────────────────────────────
// Structure + contact ids live here; all copy/digits come from i18n + data.json.

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

  // Results
  found_public: { kind: 'result', contactIds: ['manas-call', 'kerala-wa-antinarcotics'] },
  found_home: { kind: 'result', contactIds: ['vimukthi-14405'], link: { route: '/worried', key: 'worried' } },
  using_minor: { kind: 'result', contactIds: ['childline-1098', 'vimukthi-14405'], link: { route: '/parents', key: 'parents' } },
  using_adult: { kind: 'result', contactIds: ['vimukthi-14405'], link: { route: '/worried', key: 'worried' } },
  quit_talk: { kind: 'result', contactIds: ['vimukthi-14405'] },
  quit_centre: { kind: 'result', contactIds: ['deaddiction-14446'], link: { route: '/get-help', key: 'getHelp' } },
  quit_legal: { kind: 'result', contactIds: ['legal-aid-15100'], link: { route: '/rights', key: 'rights' } },
  report_call: { kind: 'result', contactIds: ['manas-call', 'antinarcotics-cell-1', 'antinarcotics-cell-2'] },
  report_online: { kind: 'result', contactIds: ['kerala-wa-antinarcotics', 'manas-web', 'manas-email'] },
  overdose: { kind: 'result', contactIds: ['emergency-112', 'ambulance-108'], link: { route: '/emergency', key: 'emergency' } },
};

export function Guide() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const { data } = useAppData();

  // Path of visited node ids — React state only, resets on refresh.
  const [path, setPath] = useState<string[]>(['start']);
  const currentId = path[path.length - 1];
  const node = NODES[currentId];

  const choose = (next: string) => setPath((p) => [...p, next]);
  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const startOver = () => setPath(['start']);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        icon={<Compass size={18} className="text-teal-700" />}
        title={t('guide.heading')}
        subtitle={t('guide.intro')}
        isML={isML}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={back}
          disabled={path.length === 1}
          className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-40"
        >
          <ChevronLeft size={14} />
          {t('guide.back')}
        </button>
        {path.length > 1 && (
          <button
            type="button"
            onClick={startOver}
            className="btn-ghost py-1.5 px-3 text-xs"
          >
            <RotateCcw size={13} />
            {t('guide.startOver')}
          </button>
        )}
      </div>

      {node.kind === 'question' ? (
        <section className="flex flex-col gap-3 fade-up" key={currentId}>
          <h2 className={`heading-text font-bold text-primary text-lg leading-snug ${isML ? 'ml-text' : ''}`}>
            {t(`guide.q.${currentId}.question`)}
          </h2>
          <div className="flex flex-col gap-2">
            {node.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => choose(opt.next)}
                className="card-hover flex items-center justify-between gap-3 p-4 text-left group"
              >
                <span className={`text-sm font-semibold text-primary ${isML ? 'ml-text' : ''}`}>
                  {t(`guide.q.${currentId}.options.${opt.key}`)}
                </span>
                <ChevronRight size={18} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
              </button>
            ))}
          </div>
        </section>
      ) : (
        <ResultView
          key={currentId}
          nodeId={currentId}
          node={node}
          isML={isML}
          contacts={findContacts(data, node.contactIds)}
        />
      )}

      <p className={`text-[11px] text-muted flex items-start gap-1.5 ${isML ? 'ml-text' : ''}`}>
        <Info size={12} className="mt-0.5 shrink-0" />
        {t('guide.disclaimer')}
      </p>
    </div>
  );
}

function ResultView({
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

  return (
    <section className="flex flex-col gap-4 fade-up">
      <div className="tone-teal border rounded-card p-4">
        <h2 className={`heading-text font-bold text-primary text-base mb-1 ${isML ? 'ml-text' : ''}`}>
          {t(`guide.r.${nodeId}.title`)}
        </h2>
      </div>

      <div>
        <h3 className={`flex items-center gap-1.5 ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
          <ListChecks size={13} className="text-accent" />
          {t('guide.stepsHeading')}
        </h3>
        <ol className="flex flex-col gap-2">
          {Array.isArray(steps) && steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 compact-card">
              <span className="shrink-0 w-5 h-5 rounded-full bg-accent text-accent-text text-[10px] font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {contacts.length > 0 && (
        <div>
          <h3 className={`flex items-center gap-1.5 ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
            <PhoneCall size={13} className="text-accent" />
            {t('guide.contactsHeading')}
          </h3>
          <div className="flex flex-col gap-2">
            {contacts.map((c) => (
              <div key={c.id} className="compact-card flex items-center justify-between gap-3 flex-wrap">
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
          className="card-hover flex items-center justify-between p-4 group"
        >
          <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
            {t(`guide.links.${node.link.key}`)}
          </span>
          <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
        </Link>
      )}
    </section>
  );
}
