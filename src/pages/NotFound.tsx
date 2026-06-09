import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home } from 'lucide-react';

export function NotFound() {
  const { t, i18n } = useTranslation();
  const isML = i18n.language === 'ml';

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-4">
      <p className="heading-text text-6xl font-extrabold text-muted">404</p>
      <h1 className={`heading-text text-xl font-bold text-primary ${isML ? 'ml-text' : ''}`}>
        {t('notFound.heading')}
      </h1>
      <p className={`text-secondary text-sm max-w-md ${isML ? 'ml-text' : ''}`}>
        {t('notFound.body')}
      </p>
      <Link to="/" className="btn-primary py-2.5 px-4 text-sm mt-2">
        <Home size={14} />
        {t('notFound.home')}
      </Link>
    </div>
  );
}
