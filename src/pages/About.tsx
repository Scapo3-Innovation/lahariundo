import { useTranslation } from 'react-i18next';
import { ShieldCheck, Info, ExternalLink, AlertTriangle, Sparkles, Check, Globe } from 'lucide-react';
import { ToofanStats } from '../components/ToofanStats';

interface Feature { title: string; desc: string }

export function About() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 const noDataItems = t('about.noData.items', { returnObjects: true }) as string[];
 const thirdPartyItems = t('about.thirdParty.items', { returnObjects: true }) as string[];
 const features = t('about.features.items', { returnObjects: true }) as Feature[];
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

   {/* Feature overview */}
   <section className="card p-5">
    <div className="flex items-center gap-2 mb-1">
     <Sparkles size={16} className="text-accent shrink-0" />
     <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
      {t('about.features.heading')}
     </h2>
    </div>
    <p className={`text-secondary text-sm mb-4 leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('about.features.intro')}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
     {Array.isArray(features) && features.map((f, i) => (
      <div key={i} className="compact-card flex items-start gap-2.5">
       <span className="mt-0.5 w-5 h-5 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0">
        <Check size={12} strokeWidth={3} />
       </span>
       <div>
        <p className={`text-sm font-bold text-primary leading-snug ${isML ? 'ml-text' : ''}`}>{f.title}</p>
        <p className={`text-xs text-secondary leading-relaxed mt-0.5 ${isML ? 'ml-text' : ''}`}>{f.desc}</p>
       </div>
      </div>
     ))}
    </div>
   </section>

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

   {/* Third-party requests — honest disclosure */}
   <section className="card p-5">
    <div className="flex items-center gap-2 mb-1">
     <Globe size={16} className="text-secondary shrink-0" />
     <h2 className={`heading-text font-bold text-primary text-base ${isML ? 'ml-text' : ''}`}>
      {t('about.thirdParty.heading')}
     </h2>
    </div>
    <p className={`text-secondary text-sm mb-3 leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('about.thirdParty.intro')}
    </p>
    <ul className="space-y-2">
     {thirdPartyItems.map((item, i) => (
      <li key={i} className="flex items-start gap-2.5">
       <Info size={13} className="text-muted mt-0.5 shrink-0" />
       <span className={`text-sm text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>{item}</span>
      </li>
     ))}
    </ul>
   </section>

   {/* Operation Toofan progress snapshot */}
   <ToofanStats />

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
