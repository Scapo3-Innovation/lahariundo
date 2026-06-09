import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ml from './ml.json';

const STORAGE_KEY = 'lahariundo-lang';

function savedLanguage(): string {
  if (typeof window === 'undefined') return 'en';
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'ml' || saved === 'en' ? saved : 'en';
}

function syncDocumentLanguage(lng: string) {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng === 'ml' ? 'ml' : 'en';
  }
}

const initialLng = savedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ml: { translation: ml },
    },
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

syncDocumentLanguage(initialLng);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  syncDocumentLanguage(lng);
});

export default i18n;
