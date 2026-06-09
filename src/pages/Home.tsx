import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
 Heart, HelpCircle, Megaphone, BookOpen, Users,
 ArrowRight, ClipboardList,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface CardDef {
 to: string;
 icon: ReactNode;
 titleKey: string;
 descKey: string;
}

const CARDS: CardDef[] = [
 { to: '/worried', icon: <Heart size={18} />,   titleKey: 'home.cards.worried.title', descKey: 'home.cards.worried.desc' },
 { to: '/get-help', icon: <HelpCircle size={18} />, titleKey: 'home.cards.getHelp.title', descKey: 'home.cards.getHelp.desc' },
 { to: '/report',  icon: <Megaphone size={18} />, titleKey: 'home.cards.report.title',  descKey: 'home.cards.report.desc' },
 { to: '/learn',  icon: <BookOpen size={18} />,  titleKey: 'home.cards.learn.title',  descKey: 'home.cards.learn.desc' },
 { to: '/parents', icon: <Users size={18} />,   titleKey: 'home.cards.parents.title', descKey: 'home.cards.parents.desc' },
];

function ActionCard({ card, delay, isML }: { card: CardDef; delay: number; isML: boolean }) {
 const { t } = useTranslation();
 return (
  <Link
   to={card.to}
   style={{ animationDelay: `${delay}ms` }}
   className="fade-up card-hover flex items-center gap-4 p-4 group"
  >
   <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 text-secondary group-hover:text-accent transition-colors">
    {card.icon}
   </div>
   <div className="flex-1 min-w-0">
    <h2 className={`font-bold text-sm text-primary leading-snug mb-0.5 group-hover:text-accent transition-colors ${isML ? 'ml-text' : ''}`}>
     {t(card.titleKey)}
    </h2>
    <p className={`text-xs text-secondary leading-relaxed line-clamp-2 ${isML ? 'ml-text' : ''}`}>
     {t(card.descKey)}
    </p>
   </div>
   <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
  </Link>
 );
}

export function Home() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';

 return (
  <div>
   <div className="fade-up mb-8 pt-1" style={{ animationDelay: '0ms' }}>
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

   <div className="flex flex-col gap-2 mb-4">
    {CARDS.map((card, i) => (
     <ActionCard key={card.to} card={card} delay={(i + 1) * 60} isML={isML} />
    ))}
   </div>

   <Link
    to="/screening"
    style={{ animationDelay: '360ms' }}
    className="fade-up card-hover flex items-center gap-3 p-4 tone-violet border group"
   >
    <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">
     <ClipboardList size={17} className="text-secondary" />
    </div>
    <div className="flex-1 min-w-0">
     <p className={`text-sm font-bold text-primary ${isML ? 'ml-text' : ''}`}>
      {t('nav.screening')}
     </p>
     <p className={`text-xs text-secondary mt-0.5 ${isML ? 'ml-text' : ''}`}>
      {t('screening.intro').slice(0, 72)}…
     </p>
    </div>
    <ArrowRight size={16} className="shrink-0 text-muted group-hover:text-accent transition-colors" />
   </Link>

   <p className={`text-center text-[11px] text-muted mt-8 ${isML ? 'ml-text' : ''}`}>
    {t('tagline')}
   </p>
  </div>
 );
}
