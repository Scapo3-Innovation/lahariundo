import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';

// Neutral destination — a quick exit away from this app.
const NEUTRAL_URL = 'https://www.google.com';

/**
 * Quick-exit button. Navigates away instantly using location.replace so this
 * app leaves NO entry in the browser back history (pressing Back won't return
 * here). Keyboard-accessible as a native button.
 */
export function LeaveQuickly() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';

  const leave = () => {
    window.location.replace(NEUTRAL_URL);
  };

  return (
    <button
      type="button"
      onClick={leave}
      className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors whitespace-nowrap min-h-[2.25rem]"
      aria-label={t('leaveNow')}
    >
      <LogOut size={14} aria-hidden="true" />
      <span className={isML ? 'ml-text' : ''}>{t('leaveNow')}</span>
    </button>
  );
}
