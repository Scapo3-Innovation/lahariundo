import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
 Heart, HelpCircle, Megaphone, MessageSquareQuote,
 ArrowRight, ClipboardList, Compass, HeartPulse, HandHeart,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ToofanStats } from '../components/ToofanStats';

interface CardDef {
 to: string;
 icon: ReactNode;
 titleKey: string;
 descKey: string;
}

const CARDS: CardDef[] = [
 { to: '/guide',   icon: <Compass size={18} />,  titleKey: 'home.cards.guide.title',   descKey: 'home.cards.guide.desc' },
 { to: '/worried', icon: <Heart size={18} />,   titleKey: 'home.cards.worried.title', descKey: 'home.cards.worried.desc' },
 { to: '/get-help', icon: <HelpCircle size={18} />, titleKey: 'home.cards.getHelp.title', descKey: 'home.cards.getHelp.desc' },
 { to: '/resources?category=report', icon: <Megaphone size={18} />, titleKey: 'home.cards.report.title', descKey: 'home.cards.report.desc' },
 { to: '/experiences', icon: <MessageSquareQuote size={18} />, titleKey: 'home.cards.experiences.title', descKey: 'home.cards.experiences.desc' },
];

const MORE: CardDef[] = [
 { to: '/effects',  icon: <HeartPulse size={18} />, titleKey: 'home.more.effects.title',  descKey: 'home.more.effects.desc' },
 { to: '/faq',      icon: <HelpCircle size={18} />, titleKey: 'home.more.faq.title',      descKey: 'home.more.faq.desc' },
 { to: '/pledge',   icon: <HandHeart size={18} />,  titleKey: 'home.more.pledge.title',   descKey: 'home.more.pledge.desc' },
];

/** Compact vertical tile used in the responsive card grid. */
function Tile({ card, delay, isML }: { card: CardDef; delay: number; isML: boolean }) {
 const { t } = useTranslation();
 return (
  <Link
   to={card.to}
   style={{ animationDelay: `${delay}ms` }}
   className="fade-up card-hover flex flex-col gap-2.5 p-3.5 group h-full"
  >
   <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 text-secondary group-hover:text-accent group-hover:border-accent/40 transition-colors">
    {card.icon}
   </div>
   <div className="flex-1">
    <h2 className={`font-bold text-[13px] text-primary leading-snug group-hover:text-accent transition-colors ${isML ? 'ml-text' : ''}`}>
     {t(card.titleKey)}
    </h2>
    <p className={`text-[11px] text-secondary leading-relaxed line-clamp-2 mt-1 ${isML ? 'ml-text' : ''}`}>
     {t(card.descKey)}
    </p>
   </div>
  </Link>
 );
}

export function Home() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 return (
  <div>
   {/* Hero */}
   <div className="fade-up mb-5 pt-1" style={{ animationDelay: '0ms' }}>
    <p className="ui-label mb-3 flex items-center gap-2">
     <span className="status-dot status-dot-green" />
     {t('noDataPromise')}
    </p>
    <h1 className={`text-2xl sm:text-3xl font-bold text-primary mb-2 leading-tight ${isML ? 'ml-text' : ''}`}>
     {t('home.heading')}
    </h1>
    <p className={`text-secondary text-sm leading-relaxed ${isML ? 'ml-text' : ''}`}>
     {t('home.subheading')}
    </p>
   </div>

   {/* Primary actions — card grid (2 cols on phones, 3 on larger) */}
   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
    {CARDS.map((card, i) => (
     <Tile key={card.to} card={card} delay={(i + 1) * 50} isML={isML} />
    ))}
   </div>

   {/* Self-check — highlighted full-width */}
   <Link
    to="/screening"
    style={{ animationDelay: '360ms' }}
    className="fade-up card-hover flex items-center gap-3 p-3.5 tone-violet border group mb-6"
   >
    <div className="w-9 h-9 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
     <ClipboardList size={17} className="text-secondary" />
    </div>
    <div className="flex-1 min-w-0">
     <p className={`text-sm font-bold text-primary ${isML ? 'ml-text' : ''}`}>
      {t('nav.screening')}
     </p>
     <p className={`text-xs text-secondary mt-0.5 line-clamp-1 ${isML ? 'ml-text' : ''}`}>
      {t('screening.intro').slice(0, 72)}…
     </p>
    </div>
    <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
   </Link>

   {/* Operation Toofan snapshot — kept high so it's visible without scrolling the whole page */}
   <ToofanStats className="mb-6" />

   {/* More tools — card grid */}
   <h2 className={`ui-label mb-2.5 ${isML ? 'ml-text' : ''}`}>{t('home.moreHeading')}</h2>
   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
    {MORE.map((card, i) => (
     <Tile key={card.to} card={card} delay={(i + 1) * 50} isML={isML} />
    ))}
   </div>

   <p className={`text-center text-[11px] text-muted mt-8 ${isML ? 'ml-text' : ''}`}>
    {t('tagline')}
   </p>
  </div>
 );
}
