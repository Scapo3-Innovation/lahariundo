import { useTranslation } from 'react-i18next';
import { ShieldCheck, Info, ExternalLink, AlertTriangle } from 'lucide-react';

export function About() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 const noDataItems = t('about.noData.items', { returnObjects: true }) as string[];
 const sourceLinks = t('about.sources.links', { returnObjects: true }) as Array<{ label: string; url: string }>;

 return (
  <div className="flex flex-col gap-6">
   {/* Logo + Heading */}
   <div className="flex flex-col items-center gap-4 py-4">
    <img
     src="/logo.png"
     alt="lahariundo logo"
     width={120}
     height={120}
     className="w-28 h-28 object-contain"
     loading="lazy"
    />
    <div className="text-center">
     <h1 className={`heading-text text-2xl font-extrabold text-primary ${isML ? 'ml-text' : ''}`}>
      {t('about.heading')}
     </h1>
     <p className={`text-secondary text-sm mt-1.5 leading-relaxed max-w-prose ${isML ? 'ml-text' : ''}`}>
      {t('about.mission')}
     </p>
    </div>
   </div>

   {/* Data promise */}
   <div className="bg-teal-700 rounded-card p-5">
    <div className="flex items-center gap-2 mb-3">
     <ShieldCheck size={18} className="text-teal-200" />
     <h2 className={`heading-text font-bold text-white text-base ${isML ? 'ml-text' : ''}`}>
      {t('about.noData.heading')}
     </h2>
    </div>
    <ul className="space-y-2">
     {noDataItems.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
       <span className="mt-1.5 w-2 h-2 bg-teal-300 rounded-full shrink-0" />
       <span className={`text-sm text-teal-100 ${isML ? 'ml-text' : ''}`}>{item}</span>
      </li>
     ))}
    </ul>
   </div>

   {/* Sources */}
   <div className="bg-surface rounded-card border border-border p-5">
    <div className="flex items-center gap-2 mb-2">
     <Info size={15} className="text-muted" />
     <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
      {t('about.sources.heading')}
     </h2>
    </div>
    <p className={`text-sm text-secondary mb-4 leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('about.sources.text')}
    </p>
    <div className="flex flex-col gap-2.5">
     {sourceLinks.map((link) => (
      <a
       key={link.url}
       href={link.url}
       target="_blank"
       rel="noopener noreferrer"
       className="flex items-center gap-2 text-sm text-teal-700 hover:text-teal-900 font-semibold transition-colors"
      >
       <ExternalLink size={13} />
       {link.label}
      </a>
     ))}
    </div>
   </div>

   {/* Verify warning */}
   <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-card p-4">
    <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
    <p className={`text-sm text-amber-900 leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('about.verifyNote')}
    </p>
   </div>

   {/* Built by */}
   <div className="space-y-1">
    <p className={`text-xs text-muted ${isML ? 'ml-text' : ''}`}>{t('about.builtBy')}</p>
    <p className={`text-xs text-muted ${isML ? 'ml-text' : ''}`}>{t('about.contribute')}</p>
   </div>
  </div>
 );
}
