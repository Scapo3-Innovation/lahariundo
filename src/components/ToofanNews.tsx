import { useTranslation } from 'react-i18next';
import { Newspaper, ExternalLink } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { relativeTime } from '../utils/relativeTime';

/**
 * "Latest from Operation Toofan" — Toofan-filtered headlines from /api/news.
 * Sits beside the (manually-updated, dated) numeric snapshot. Hides cleanly
 * when offline, empty, or the upstream is unavailable.
 */
export function ToofanNews({ className = '' }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const online = useOnlineStatus();
  const { items, loading, error } = useNews('toofan');

  if (!online) return null;

  if (loading && items.length === 0) {
    return (
      <section className={`card p-4 flex flex-col gap-2 ${className}`} aria-hidden="true">
        <div className="skeleton h-4 w-1/2 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </section>
    );
  }

  if (error || items.length === 0) return null;

  const list = items.slice(0, 4);

  return (
    <section className={`card p-4 flex flex-col gap-2.5 ${className}`} aria-labelledby="toofan-news-heading">
      <div className="flex items-center gap-2">
        <Newspaper size={15} className="text-accent shrink-0" />
        <h2 id="toofan-news-heading" className={`heading-text font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>
          {t('news.toofanHeading')}
        </h2>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {list.map((item, i) => (
          <li key={i} className="py-2 first:pt-0 last:pb-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              aria-label={`${item.title} — ${item.source}. ${t('news.openArticle')}`}
            >
              <p className={`text-sm text-primary leading-snug group-hover:text-accent transition-colors ${isML ? 'ml-text' : ''}`}>
                {item.title}
                <ExternalLink size={11} className="inline-block ml-1 align-[-1px] text-muted" aria-hidden="true" />
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                {item.source}
                {item.publishedAt && <> · {relativeTime(item.publishedAt, isML)}</>}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
