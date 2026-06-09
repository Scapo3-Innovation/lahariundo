import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  onRetry: () => void;
}

export function DataErrorBanner({ onRetry }: Props) {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';

  return (
    <div
      role="alert"
      className="tone-amber border rounded-card p-4 flex flex-col sm:flex-row sm:items-center gap-3"
    >
      <div className="flex items-start gap-2 flex-1">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className={`text-sm text-primary leading-relaxed ${isML ? 'ml-text' : ''}`}>
          {t('dataError.message')}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="btn-ghost py-2 px-3 text-xs shrink-0 self-start sm:self-auto"
      >
        <RefreshCw size={12} />
        {t('dataError.retry')}
      </button>
    </div>
  );
}
