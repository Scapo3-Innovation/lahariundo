import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
 Heart, Activity, Eye, Users, ChevronLeft, RotateCcw, Phone, Check, ChevronRight,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { useAppData } from '../context/DataContext';
import { findContact } from '../utils/contacts';
import { useContactTokens } from '../hooks/useContactTokens';

type SignCategory = 'physical' | 'behavioural' | 'social';
type View = 'menu' | 'signs_category' | 'signs_pick' | 'signs_summary' | 'talk' | 'help';

interface ChatMessage {
 id: string;
 role: 'assistant' | 'user';
 text: string;
}

const SIGN_CATEGORIES: SignCategory[] = ['physical', 'behavioural', 'social'];

const CATEGORY_ICONS: Record<SignCategory, React.ReactNode> = {
 physical: <Activity size={13} />,
 behavioural: <Eye size={13} />,
 social: <Users size={13} />,
};

function AssistantAvatar() {
 return (
  <div
   className="shrink-0 w-7 h-7 rounded-full tone-rose border flex items-center justify-center"
   aria-hidden="true"
  >
   <Heart size={13} className="text-rose-600 dark:text-rose-400" />
  </div>
 );
}

export function Worried() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { data } = useAppData();
 const tokens = useContactTokens();
 const vimukthi = findContact(data, 'vimukthi-14405');
 const talkSteps = t('worried.talkSteps', { returnObjects: true }) as string[];
 const bottomRef = useRef<HTMLDivElement>(null);

 const [messages, setMessages] = useState<ChatMessage[]>([]);
 const [view, setView] = useState<View>('menu');
 const [activeCat, setActiveCat] = useState<SignCategory>('physical');
 const [checked, setChecked] = useState<Set<string>>(new Set());
 const [talkIdx, setTalkIdx] = useState(0);
 const msgId = useRef(0);

 const nextId = () => {
  msgId.current += 1;
  return `m-${msgId.current}`;
 };

 const pushAssistant = (text: string) => {
  setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text }]);
 };

 const pushUser = (text: string) => {
  setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
 };

 const resetChat = () => {
  msgId.current = 0;
  setMessages([
   { id: 'intro', role: 'assistant', text: t('worried.intro') },
   { id: 'menu-q', role: 'assistant', text: t('worried.chatMenuQuestion') },
  ]);
  setView('menu');
  setChecked(new Set());
  setTalkIdx(0);
  setActiveCat('physical');
 };

 useEffect(() => {
  resetChat();
 }, [t, i18n.language]);

 useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
 }, [messages, view, checked]);

 const pickMenu = (key: 'signs' | 'talk' | 'help') => {
  pushUser(t(`worried.chatMenu.${key}`));
  if (key === 'signs') {
   pushAssistant(t('worried.chatCategoryQuestion'));
   setView('signs_category');
  } else if (key === 'talk') {
   pushAssistant(talkSteps[0]);
   setTalkIdx(0);
   setView('talk');
  } else {
   pushAssistant(t('worried.helpText', tokens));
   setView('help');
  }
 };

 const pickCategory = (cat: SignCategory) => {
  pushUser(t(`worried.signs.${cat}.title`));
  pushAssistant(t('worried.chatSignsPrompt'));
  setActiveCat(cat);
  setView('signs_pick');
 };

 const toggleSign = (key: string) => {
  setChecked((prev) => {
   const next = new Set(prev);
   if (next.has(key)) next.delete(key);
   else next.add(key);
   return next;
  });
 };

 const continueSigns = () => {
  const count = checked.size;
  pushUser(
   count > 0
    ? t('worried.chatSignsContinueUser', { count })
    : t('worried.chatSignsContinueUserNone'),
  );
  pushAssistant(t('worried.chatSignsSummary', { count }));
  setView('signs_summary');
 };

 const nextTalkStep = () => {
  if (talkIdx < talkSteps.length - 1) {
   const next = talkIdx + 1;
   setTalkIdx(next);
   pushAssistant(talkSteps[next]);
  } else {
   pushAssistant(t('worried.helpText', tokens));
   setView('help');
  }
 };

 const signItems = t(`worried.signs.${activeCat}.items`, { returnObjects: true }) as string[];
 const checkedCount = checked.size;
 const atLastTalkStep = talkIdx >= talkSteps.length - 1;
 const canGoBack = view !== 'menu';

 const goBack = () => {
  if (view === 'signs_category') {
   setMessages((prev) => prev.slice(0, -2));
   setView('menu');
  } else if (view === 'signs_pick') {
   setMessages((prev) => prev.slice(0, -2));
   setView('signs_category');
  } else if (view === 'signs_summary') {
   setMessages((prev) => prev.slice(0, -2));
   setView('signs_pick');
  } else if (view === 'talk' && talkIdx > 0) {
   setMessages((prev) => prev.slice(0, -1));
   setTalkIdx((i) => i - 1);
  } else if (view === 'talk' && talkIdx === 0) {
   setMessages((prev) => prev.slice(0, -2));
   setView('menu');
  } else if (view === 'help') {
   setMessages((prev) => prev.slice(0, -1));
   setView('menu');
  }
 };

 return (
  <div className="flex flex-col gap-3">
   <div className="rounded-card border border-border bg-surface overflow-hidden flex flex-col min-h-[min(72dvh,640px)] max-h-[min(78dvh,720px)]">
    {/* Chat header */}
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-2">
     <div className="flex items-center gap-2.5 min-w-0">
      <AssistantAvatar />
      <div className="min-w-0">
       <p className={`heading-text text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
        {t('worried.heading')}
       </p>
       <p className={`text-[11px] text-muted truncate ${isML ? 'ml-text' : ''}`}>
        {t('appName')} · {t('guide.chatPrivate')}
       </p>
      </div>
     </div>
     <div className="flex items-center gap-1 shrink-0">
      <button
       type="button"
       onClick={goBack}
       disabled={!canGoBack}
       className="btn-ghost py-1.5 px-2.5 text-xs disabled:opacity-40"
       aria-label={t('guide.back')}
      >
       <ChevronLeft size={14} />
       <span className={isML ? 'ml-text' : ''}>{t('guide.back')}</span>
      </button>
      {view !== 'menu' && (
       <button type="button" onClick={resetChat} className="btn-ghost py-1.5 px-2.5 text-xs">
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
     {messages.map((msg) =>
      msg.role === 'user' ? (
       <div key={msg.id} className="flex justify-end fade-up">
        <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-accent text-accent-text px-3.5 py-2.5 shadow-sm">
         <p className={`text-sm font-semibold leading-relaxed ${isML ? 'ml-text' : ''}`}>{msg.text}</p>
        </div>
       </div>
      ) : (
       <div key={msg.id} className="flex items-start gap-2 fade-up">
        <AssistantAvatar />
        <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-surface-2 border border-border px-3.5 py-2.5">
         <p className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{msg.text}</p>
        </div>
       </div>
      ),
     )}

     {view === 'help' && (
      <div className="flex items-start gap-2 fade-up">
       <AssistantAvatar />
       <div className="min-w-0 max-w-[92%] flex flex-col gap-2.5">
        {vimukthi && (
         <div className="rounded-2xl rounded-tl-md tone-teal border px-3.5 py-3">
          <PhoneLink
           phone={vimukthi.value}
           label={isML ? vimukthi.label_ml : vimukthi.label_en}
           className="inline-flex items-center gap-2 bg-accent text-accent-text px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
           <Phone size={14} />
           Vimukthi — {vimukthi.value}
          </PhoneLink>
         </div>
        )}
        <Link
         to="/get-help"
         className="rounded-2xl rounded-tl-md border border-border bg-surface px-3.5 py-3 flex items-center justify-between gap-3 hover:border-accent hover:bg-accent-soft transition-colors group"
        >
         <span className={`text-sm font-semibold text-accent ${isML ? 'ml-text' : ''}`}>
          {t('worried.nextSteps')}
         </span>
         <ChevronRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
        </Link>
       </div>
      </div>
     )}

     <div ref={bottomRef} aria-hidden="true" />
    </div>

    {/* Quick replies */}
    {view === 'menu' && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
      <div className="flex flex-wrap gap-2">
       {(['signs', 'talk', 'help'] as const).map((key) => (
        <button
         key={key}
         type="button"
         onClick={() => pickMenu(key)}
         className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors text-left ${isML ? 'ml-text' : ''}`}
        >
         {t(`worried.chatMenu.${key}`)}
        </button>
       ))}
      </div>
     </div>
    )}

    {view === 'signs_category' && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
      <div className="flex flex-wrap gap-2">
       {SIGN_CATEGORIES.map((cat) => (
        <button
         key={cat}
         type="button"
         onClick={() => pickCategory(cat)}
         className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors inline-flex items-center gap-1.5 ${isML ? 'ml-text' : ''}`}
        >
         {CATEGORY_ICONS[cat]}
         {t(`worried.signs.${cat}.title`)}
        </button>
       ))}
      </div>
     </div>
    )}

    {view === 'signs_pick' && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('worried.signsTapHint')}</p>
      <div className="flex flex-wrap gap-2 mb-3 max-h-[9rem] overflow-y-auto">
       {signItems.map((item, i) => {
        const key = `${activeCat}-${i}`;
        const isChecked = checked.has(key);
        return (
         <button
          key={key}
          type="button"
          onClick={() => toggleSign(key)}
          aria-pressed={isChecked}
          className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors text-left inline-flex items-center gap-1.5 ${
           isChecked
            ? 'bg-accent border-accent text-accent-text'
            : 'border-border-strong bg-surface-2 text-primary hover:border-accent hover:bg-accent-soft'
          } ${isML ? 'ml-text' : ''}`}
         >
          {isChecked && <Check size={11} strokeWidth={3} />}
          {item}
         </button>
        );
       })}
      </div>
      <button type="button" onClick={continueSigns} className="btn-primary w-full">
       {checkedCount > 0
        ? t('worried.chatSignsContinue', { count: checkedCount })
        : t('worried.chatSignsContinueNone')}
      </button>
     </div>
    )}

    {view === 'signs_summary' && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>{t('guide.chatHint')}</p>
      <div className="flex flex-wrap gap-2">
       <button
        type="button"
        onClick={() => {
         pushUser(t('worried.chatMenu.talk'));
         pushAssistant(talkSteps[0]);
         setTalkIdx(0);
         setView('talk');
        }}
        className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors ${isML ? 'ml-text' : ''}`}
       >
        {t('worried.chatMenu.talk')}
       </button>
       <button
        type="button"
        onClick={() => {
         pushUser(t('worried.chatMenu.help'));
         pushAssistant(t('worried.helpText', tokens));
         setView('help');
        }}
        className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors ${isML ? 'ml-text' : ''}`}
       >
        {t('worried.chatMenu.help')}
       </button>
       <button
        type="button"
        onClick={() => {
         pushUser(t('worried.chatMoreSigns'));
         pushAssistant(t('worried.chatCategoryQuestion'));
         setView('signs_category');
        }}
        className={`rounded-full border border-border-strong bg-surface-2 px-3.5 py-2 text-sm font-semibold text-primary hover:border-accent hover:bg-accent-soft transition-colors ${isML ? 'ml-text' : ''}`}
       >
        {t('worried.chatMoreSigns')}
       </button>
      </div>
     </div>
    )}

    {view === 'talk' && (
     <div className="shrink-0 border-t border-border bg-surface px-3 sm:px-4 py-3">
      <p className={`ui-label mb-2 ${isML ? 'ml-text' : ''}`}>
       {t('worried.talkStepOf', { current: talkIdx + 1, total: talkSteps.length })}
      </p>
      <button type="button" onClick={nextTalkStep} className="btn-primary w-full">
       {atLastTalkStep ? t('worried.chatTalkDone') : t('worried.chatTalkNext')}
       <ChevronRight size={15} />
      </button>
     </div>
    )}
   </div>
  </div>
 );
}
