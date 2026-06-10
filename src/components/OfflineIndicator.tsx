import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Calm connectivity pill. Shows persistently while offline; flashes a brief
 * "back online" confirmation when the connection returns. Reads only
 * navigator connection state — no requests, no storage.
 */
export function OfflineIndicator() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';
  const online = useOnlineStatus();

  const [showBackOnline, setShowBackOnline] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setShowBackOnline(false);
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setShowBackOnline(true);
      const tmr = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(tmr);
    }
  }, [online]);

  if (online && !showBackOnline) return null;

  return (
    <div
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-2 px-3.5 py-2 rounded-full shadow-toast border text-xs font-bold fade-up ${
          online
            ? 'bg-surface border-border text-emerald-700 dark:text-emerald-400'
            : 'tone-amber border text-amber-800 dark:text-amber-300'
        }`}
      >
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        <span className={isML ? 'ml-text' : ''}>
          {online ? t('offline.online') : t('offline.offline')}
        </span>
      </div>
    </div>
  );
}
