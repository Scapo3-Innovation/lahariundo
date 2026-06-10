import { useEffect, useState } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: boolean;
}

const REFRESH_MS = 25 * 60 * 1000; // 25 min — gentle, not aggressive

/**
 * Fetches headlines from our own /api/news proxy. Online-gated, periodically
 * refreshed, and stores nothing. Returns empty/error states so the UI can hide
 * the ticker gracefully (offline, upstream down, or dev with no function).
 */
export function useNews(topic: 'all' | 'toofan'): NewsState {
  const online = useOnlineStatus();
  const [state, setState] = useState<NewsState>({ items: [], loading: true, error: false });

  useEffect(() => {
    if (!online) {
      setState((s) => ({ items: s.items, loading: false, error: false }));
      return;
    }

    let cancelled = false;
    const ctrl = new AbortController();
    const url = topic === 'toofan' ? '/api/news?topic=toofan' : '/api/news';

    const load = async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const items: NewsItem[] = Array.isArray(data?.items) ? data.items : [];
        if (!cancelled) setState({ items, loading: false, error: false });
      } catch {
        if (!cancelled) setState((s) => ({ items: s.items, loading: false, error: true }));
      }
    };

    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
    };
  }, [topic, online]);

  return state;
}
