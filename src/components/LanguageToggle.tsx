import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  return (
    <button
      onClick={() => i18n.changeLanguage(isMl ? 'en' : 'ml')}
      className="icon-btn text-xs font-bold"
      aria-label="Switch language"
    >
      {isMl ? 'EN' : <span className="ml-text">മല</span>}
    </button>
  );
}
