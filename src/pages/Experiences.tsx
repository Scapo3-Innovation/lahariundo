import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquareQuote, User, Trash2, Send, ChevronLeft, ChevronRight, Quote, Shield } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/ToastProvider';
import {
 loadUserExperiences, saveUserExperience, deleteUserExperience, type SavedExperience,
} from '../utils/experiences';

interface CuratedStory {
 name?: string;
 anonymous?: boolean;
 text: string;
}

interface DisplayStory {
 key: string;
 name?: string;
 anonymous?: boolean;
 text: string;
 isUser?: boolean;
 userId?: string;
}

const MAX_STORY_LEN = 600;
const ROTATE_MS = 2000;

function displayName(
 name: string | undefined,
 anonymous: boolean | undefined,
 anonymousLabel: string,
): string {
 if (anonymous || !name?.trim()) return anonymousLabel;
 return name.trim();
}

export function Experiences() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { showStatus } = useToast();

 const curated = t('experiences.stories', { returnObjects: true }) as CuratedStory[];
 const [userStories, setUserStories] = useState<SavedExperience[]>(() => loadUserExperiences());
 const [name, setName] = useState('');
 const [anonymous, setAnonymous] = useState(false);
 const [text, setText] = useState('');
 const [activeIndex, setActiveIndex] = useState(0);
 const [slideKey, setSlideKey] = useState(0);
 const [direction, setDirection] = useState<'next' | 'prev'>('next');
 const [paused, setPaused] = useState(false);

 const allStories = useMemo<DisplayStory[]>(() => {
  const local = userStories.map((s) => ({
   key: s.id,
   name: s.name,
   anonymous: s.anonymous,
   text: s.text,
   isUser: true,
   userId: s.id,
  }));
  const shared = Array.isArray(curated)
   ? curated.map((s, i) => ({ key: `curated-${i}`, ...s }))
   : [];
  return [...local, ...shared];
 }, [curated, userStories]);

 useEffect(() => {
  if (activeIndex >= allStories.length) {
   setActiveIndex(Math.max(0, allStories.length - 1));
  }
 }, [activeIndex, allStories.length]);

 const goTo = useCallback((index: number, dir?: 'next' | 'prev') => {
  if (allStories.length === 0) return;
  const next = ((index % allStories.length) + allStories.length) % allStories.length;
  if (next === activeIndex) return;
  const forward = dir ?? (next > activeIndex || (next === 0 && activeIndex === allStories.length - 1) ? 'next' : 'prev');
  setDirection(forward);
  setActiveIndex(next);
  setSlideKey((k) => k + 1);
 }, [activeIndex, allStories.length]);

 useEffect(() => {
  if (allStories.length <= 1 || paused) return;
  const timer = window.setInterval(() => {
   setDirection('next');
   setActiveIndex((i) => (i + 1) % allStories.length);
   setSlideKey((k) => k + 1);
  }, ROTATE_MS);
  return () => window.clearInterval(timer);
 }, [allStories.length, paused]);

 const current = allStories[activeIndex];
 const anonymousLabel = t('experiences.anonymousLabel');

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const trimmed = text.trim();
  if (trimmed.length < 20) {
   showStatus('warning', t('experiences.tooShort'));
   return;
  }
  const entry = saveUserExperience({
   name: anonymous ? '' : name.trim(),
   anonymous,
   text: trimmed.slice(0, MAX_STORY_LEN),
  });
  setUserStories((prev) => [entry, ...prev]);
  setDirection('next');
  setActiveIndex(0);
  setSlideKey((k) => k + 1);
  setText('');
  if (!anonymous) setName('');
  showStatus('success', t('experiences.saved'));
 };

 const handleDelete = (id: string) => {
  deleteUserExperience(id);
  const updated = loadUserExperiences();
  setUserStories(updated);
  setDirection('next');
  setActiveIndex(0);
  setSlideKey((k) => k + 1);
 };

 return (
  <div className="flex flex-col gap-5">
   <PageHeader
    icon={<MessageSquareQuote size={18} className="text-violet-600" />}
    title={t('experiences.heading')}
    subtitle={t('experiences.intro')}
    isML={isML}
   />

   <p className={`text-xs text-muted -mt-3 ${isML ? 'ml-text' : ''}`}>
    {t('experiences.privacyNote')}
   </p>

   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-stretch">
    {/* Share form — left on desktop */}
    <section className="card tone-violet p-4 sm:p-5 flex flex-col order-2 lg:order-1">
     <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0">
       <MessageSquareQuote size={18} className="text-violet-600" />
      </div>
      <div className="min-w-0">
       <h2 className={`font-bold text-primary text-base leading-snug ${isML ? 'ml-text' : ''}`}>
        {t('experiences.shareHeading')}
       </h2>
       <p className={`text-sm text-secondary mt-1 leading-relaxed ${isML ? 'ml-text' : ''}`}>
        {t('experiences.shareIntro')}
       </p>
      </div>
     </div>

     <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
      <div>
       <p className={`form-label ${isML ? 'ml-text' : ''}`}>{t('experiences.identityLabel')}</p>
       <div className="identity-pick" role="group" aria-label={t('experiences.identityLabel')}>
        <button
         type="button"
         onClick={() => setAnonymous(false)}
         className={`identity-pick-btn ${!anonymous ? 'identity-pick-btn-active' : ''}`}
         aria-pressed={!anonymous}
        >
         <User size={18} strokeWidth={1.75} />
         <span className={isML ? 'ml-text' : ''}>{t('experiences.namedOption')}</span>
        </button>
        <button
         type="button"
         onClick={() => setAnonymous(true)}
         className={`identity-pick-btn ${anonymous ? 'identity-pick-btn-active' : ''}`}
         aria-pressed={anonymous}
        >
         <Shield size={18} strokeWidth={1.75} />
         <span className={isML ? 'ml-text' : ''}>{t('experiences.anonymousOption')}</span>
        </button>
       </div>
      </div>

      {!anonymous && (
       <div>
        <label htmlFor="exp-name" className={`form-label ${isML ? 'ml-text' : ''}`}>
         {t('experiences.nameLabel')}
        </label>
        <input
         id="exp-name"
         type="text"
         value={name}
         onChange={(e) => setName(e.target.value)}
         placeholder={t('experiences.namePlaceholder')}
         maxLength={40}
         className={`input-field ${isML ? 'ml-text' : ''}`}
        />
       </div>
      )}

      <div className="flex-1 flex flex-col">
       <label htmlFor="exp-text" className={`form-label ${isML ? 'ml-text' : ''}`}>
        {t('experiences.storyLabel')}
       </label>
       <textarea
        id="exp-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('experiences.storyPlaceholder')}
        maxLength={MAX_STORY_LEN}
        rows={7}
        className={`input-field resize-y min-h-[9rem] flex-1 leading-relaxed ${isML ? 'ml-text' : ''}`}
       />
       <p className={`text-xs text-muted mt-1.5 text-right tabular-nums ${isML ? 'ml-text' : ''}`}>
        {text.length}/{MAX_STORY_LEN}
       </p>
      </div>

      <button type="submit" className="btn-primary w-full">
       <Send size={14} />
       {t('experiences.submit')}
      </button>
     </form>
    </section>

    {/* Rotating stories — right on desktop */}
    <section
     className="card p-4 sm:p-5 flex flex-col order-1 lg:order-2 min-h-[20rem] lg:min-h-0"
     onMouseEnter={() => setPaused(true)}
     onMouseLeave={() => setPaused(false)}
     onTouchStart={() => setPaused(true)}
     onTouchEnd={() => setPaused(false)}
     onFocusCapture={() => setPaused(true)}
     onBlurCapture={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
     }}
    >
     <div className="flex items-center justify-between gap-2 mb-4">
      <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
       {t('experiences.curatedHeading')}
      </h2>
      {allStories.length > 1 && (
       <span className={`text-[10px] text-muted tabular-nums shrink-0 ${isML ? 'ml-text' : ''}`}>
        {activeIndex + 1}/{allStories.length}
       </span>
      )}
     </div>

     {allStories.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-center px-4">
       <p className={`text-sm text-muted ${isML ? 'ml-text' : ''}`}>
        {t('experiences.shareIntro')}
       </p>
      </div>
     ) : (
      <>
       <div className="flex-1 relative flex flex-col overflow-hidden">
        <Quote size={28} className="text-violet-600/25 absolute top-0 left-0 pointer-events-none" aria-hidden />

        <article
         key={slideKey}
         className={`${direction === 'next' ? 'story-enter-next' : 'story-enter-prev'} flex flex-col gap-4 pt-6 flex-1`}
        >
         <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
           <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
            <User size={15} className="text-muted" />
           </div>
           <p className={`text-sm font-bold text-primary truncate ${isML ? 'ml-text' : ''}`}>
            {displayName(current.name, current.anonymous, anonymousLabel)}
           </p>
          </div>
          {current.isUser && (
           <span className={`shrink-0 text-[10px] font-bold text-muted border border-border px-1.5 py-0.5 rounded-md ${isML ? 'ml-text' : ''}`}>
            {t('experiences.yoursBadge')}
           </span>
          )}
         </div>

         <p className={`text-sm sm:text-base text-secondary leading-relaxed flex-1 ${isML ? 'ml-text' : ''}`}>
          {current.text}
         </p>

         {current.isUser && current.userId && (
          <button
           type="button"
           onClick={() => handleDelete(current.userId!)}
           className="self-start flex items-center gap-1.5 text-xs text-muted hover:text-red-600 transition-colors"
          >
           <Trash2 size={12} />
           {t('experiences.delete')}
          </button>
         )}
        </article>
       </div>

       {allStories.length > 1 && (
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border">
         <button
          type="button"
          onClick={() => goTo(activeIndex - 1, 'prev')}
          className="p-2 rounded-lg border border-border text-muted hover:text-primary hover:border-accent/40 transition-colors"
          aria-label="Previous story"
         >
          <ChevronLeft size={16} />
         </button>

         <div className="flex items-center gap-1.5 flex-1 justify-center">
          {allStories.map((story, i) => (
           <button
            key={story.key}
            type="button"
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
             i === activeIndex
              ? 'w-5 bg-accent'
              : 'w-1.5 bg-border hover:bg-muted'
            }`}
            aria-label={`Story ${i + 1}`}
            aria-current={i === activeIndex ? 'true' : undefined}
           />
          ))}
         </div>

         <button
          type="button"
          onClick={() => goTo(activeIndex + 1, 'next')}
          className="p-2 rounded-lg border border-border text-muted hover:text-primary hover:border-accent/40 transition-colors"
          aria-label="Next story"
         >
          <ChevronRight size={16} />
         </button>
        </div>
       )}
      </>
     )}
    </section>
   </div>
  </div>
 );
}
