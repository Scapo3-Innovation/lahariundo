import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ContactBar } from './ContactBar';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { OfflineIndicator } from './OfflineIndicator';
import type { ReactNode } from 'react';

interface Props {
 children: ReactNode;
}

export function Layout({ children }: Props) {
 const { t, i18n } = useTranslation();
 const location = useLocation();
 const isML = i18n.language === 'ml';

 const navLinks = [
  { to: '/',         label: t('nav.home') },
  { to: '/guide',    label: t('nav.guide') },
  { to: '/get-help', label: t('nav.getHelp') },
  { to: '/report',   label: t('nav.report') },
  { to: '/worried',  label: t('nav.worried') },
  { to: '/recovery', label: t('nav.recovery') },
  { to: '/resources', label: t('nav.resources') },
  { to: '/screening', label: t('nav.screening') },
  { to: '/effects',  label: t('nav.effects') },
  { to: '/faq',      label: t('nav.faq') },
  { to: '/learn',    label: t('nav.learn') },
  { to: '/rights',   label: t('nav.rights') },
  { to: '/parents',  label: t('nav.parents') },
  { to: '/pledge',   label: t('nav.pledge') },
  { to: '/about',    label: t('nav.about') },
  { to: '/emergency', label: t('nav.emergency') },
 ];

 return (
  <div className="min-h-screen flex flex-col bg-page text-primary">
   <header className="sticky top-0 z-40 bg-surface border-b border-border">
    <div className="w-full px-4 sm:px-6 py-3 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3">
     <ThemeToggle />

     <Link
      to="/"
      className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity min-w-0"
      aria-label={`${t('appName')} — Home`}
     >
      <img
       src="/logo-opt.png"
       alt=""
       width={28}
       height={28}
       className="w-7 h-7 object-contain shrink-0"
       loading="eager"
      />
      <span className="heading-text font-bold text-sm sm:text-base truncate">
       {t('appName')}
      </span>
     </Link>

     <div className="flex justify-end">
      <LanguageToggle />
     </div>
    </div>

    <nav
     className="w-full px-4 sm:px-6 pb-2.5 overflow-x-auto scrollbar-none"
     aria-label="Main navigation"
    >
     <div className="flex gap-1 min-w-max">
      {navLinks.map(({ to, label }) => {
       const active = location.pathname === to;
       return (
        <Link
         key={to}
         to={to}
         className={[
          'nav-pill',
          active ? 'nav-pill-active' : '',
          isML ? 'ml-text' : '',
         ].join(' ')}
         aria-current={active ? 'page' : undefined}
        >
         {label}
        </Link>
       );
      })}
     </div>
    </nav>
   </header>

   <main className="flex-1 w-full px-4 sm:px-6 py-5 pb-[var(--stack-bottom)] page-enter">
    {children}
   </main>

   <footer className="bg-surface border-t border-border py-3 mb-[var(--stack-bottom)]">
    <div className="w-full px-6 flex flex-col items-center gap-2">
     <div className="flex items-center gap-2">
      <img src="/logo-opt.png" alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain opacity-60" />
      <span className="heading-text text-[11px] font-bold text-muted">{t('appName')}</span>
     </div>
     <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted">
      {[t('footer.privacy'), t('footer.official'), t('footer.free')].map((item) => (
       <span key={item} className="flex items-center gap-1.5">
        <span className="status-dot status-dot-green inline-block" />
        <span className={isML ? 'ml-text' : ''}>{item}</span>
       </span>
      ))}
     </div>
    </div>
   </footer>

   <ContactBar />
   <OfflineIndicator />
  </div>
 );
}
