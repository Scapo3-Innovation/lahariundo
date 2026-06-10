import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Pause, Play, ExternalLink } from 'lucide-react';
import { useNews, type NewsItem } from '../hooks/useNews';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { relativeTime } from '../utils/relativeTime';

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function TickerLink({ item, isML, hidden }: { item: NewsItem; isML: boolean; hidden?: boolean }) {
  const { t } = useTranslation();
  return (
    <li className="news-ticker-item" aria-hidden={hidden || undefined}>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={hidden ? -1 : 0}
        className="news-ticker-link"
        aria-label={`${item.title} — ${item.source}. ${t('news.openArticle')}`}
      >
        <span className={`news-ticker-title ${isML ? 'ml-text' : ''}`}>{item.title}</span>
        <span className="news-ticker-meta">
          {item.source}
          {item.publishedAt && <> · {relativeTime(item.publishedAt, isML)}</>}
          <ExternalLink size={10} className="inline-block ml-0.5 align-[-1px]" aria-hidden="true" />
        </span>
      </a>
    </li>
  );
}

export function NewsTicker() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const online = useOnlineStatus();
  const reducedMotion = usePrefersReducedMotion();
  const { items, loading, error } = useNews('all');

  const [userPaused, setUserPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);

  // Offline: hide cleanly (the rest of the app still works via the PWA).
  if (!online) return null;

  if (loading && items.length === 0) {
    return (
      <div className="news-ticker" aria-hidden="true">
        <div className="news-ticker-label"><Newspaper size={13} /> {t('news.latest')}</div>
        <div className="news-ticker-viewport"><div className="skeleton h-4 w-full rounded" /></div>
      </div>
    );
  }

  // Error or empty: hide gracefully.
  if (error || items.length === 0) return null;

  const running = !reducedMotion && !userPaused && !interacting;
  const durationS = Math.max(30, items.length * 6);

  return (
    <section className="news-ticker" aria-label={t('news.latest')}>
      <div className="news-ticker-label">
        <Newspaper size={13} className="shrink-0" />
        <span className={isML ? 'ml-text' : ''}>{t('news.latest')}</span>
      </div>

      {!reducedMotion && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          className="news-ticker-btn"
          aria-pressed={userPaused}
          aria-label={userPaused ? t('news.play') : t('news.pause')}
        >
          {userPaused ? <Play size={13} /> : <Pause size={13} />}
        </button>
      )}

      <div
        className={`news-ticker-viewport ${reducedMotion ? 'news-ticker-static' : ''}`}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={() => setInteracting(false)}
      >
        <ul
          className={`news-ticker-track ${reducedMotion ? 'news-ticker-track-static' : ''}`}
          style={reducedMotion ? undefined : { animationDuration: `${durationS}s`, animationPlayState: running ? 'running' : 'paused' }}
        >
          {items.map((item, i) => <TickerLink key={`a-${i}`} item={item} isML={isML} />)}
          {/* Duplicate set for a seamless loop — hidden from AT and tab order. */}
          {!reducedMotion && items.map((item, i) => <TickerLink key={`b-${i}`} item={item} isML={isML} hidden />)}
        </ul>
      </div>
    </section>
  );
}
