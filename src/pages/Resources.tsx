import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
 BookMarked, Phone, MessageCircle, Globe, Mail,
 Search, CheckCircle, AlertTriangle, ShieldAlert, Building2,
} from 'lucide-react';
import { PhoneLink } from '../components/PhoneLink';
import { DataErrorBanner } from '../components/DataErrorBanner';
import { PageHeader } from '../components/PageHeader';
import { useAppData } from '../context/DataContext';
import { useContactTokens } from '../hooks/useContactTokens';
import { isPlaceholderValue } from '../utils/verify';
import type { Resource, DistrictEntry } from '../types';

type Category = Resource['category'] | 'all';

const CATEGORY_ORDER: Category[] = [
 'all', 'report', 'emergency', 'deaddiction', 'mentalhealth', 'youth_women', 'legal', 'local_office',
];

const ACTION = 'btn-action';

function categoryAccent(cat: Resource['category']) {
 switch (cat) {
  case 'report':   return 'border-l-amber-500';
  case 'emergency':  return 'border-l-red-500';
  case 'deaddiction': return 'border-l-teal-600';
  case 'mentalhealth':return 'border-l-violet-500';
  case 'youth_women': return 'border-l-pink-500';
  case 'legal':    return 'border-l-indigo-500';
  default:      return 'border-l-slate-400';
 }
}

function ResourceCard({ item, isML }: { item: Resource; isML: boolean }) {
 const { t } = useTranslation();
 const label = isML ? item.label_ml : item.label_en;
 const desc = isML ? item.desc_ml : item.desc_en;

 const actionEl = (() => {
  if (!item.verified) {
   return (
    <span
     className="inline-flex items-center gap-1 bg-surface-2 text-muted px-2 py-1 rounded-lg text-[10px] font-bold cursor-not-allowed select-none"
     aria-disabled="true"
     title={t('resources.unverifiedNote')}
    >
     <AlertTriangle size={10} />
     {t('resources.unverifiedNote')}
    </span>
   );
  }

  switch (item.channel) {
   case 'call':
    return (
     <PhoneLink
      phone={item.value}
      label={label}
      className={`${ACTION} bg-teal-700 text-white hover:bg-teal-800`}
     >
      <Phone size={11} />
      {t('resources.channels.call')} {item.value}
     </PhoneLink>
    );
   case 'whatsapp':
    return (
     <a
      href={`https://wa.me/${item.value}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${ACTION} bg-green-600 text-white hover:bg-green-700`}
     >
      <MessageCircle size={11} />
      {t('resources.channels.whatsapp')}
     </a>
    );
   case 'web':
    return (
     <a
      href={item.value}
      target="_blank"
      rel="noopener noreferrer"
      className={`${ACTION} bg-indigo-600 text-white hover:bg-indigo-700`}
     >
      <Globe size={11} />
      {t('resources.channels.web')}
     </a>
    );
   case 'email':
    return (
     <a
      href={`mailto:${item.value}`}
      className={`${ACTION} bg-slate-700 text-white hover:bg-slate-800`}
     >
      <Mail size={11} />
      {t('resources.channels.email')}
     </a>
    );
  }
 })();

 return (
  <div className={`compact-card border-l-4 ${categoryAccent(item.category)} flex flex-col gap-1.5`}>
   <div className="flex items-start justify-between gap-2">
    <h3 className={`font-bold text-primary text-sm leading-snug ${isML ? 'ml-text' : ''}`}>{label}</h3>
    {item.verified ? (
     <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md">
      <CheckCircle size={9} />
      {t('resources.verifiedBadge')}
     </span>
    ) : (
     <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
      <AlertTriangle size={9} />
      {t('resources.unverifiedBadge')}
     </span>
    )}
   </div>
   <p className={`text-xs text-secondary leading-relaxed line-clamp-2 ${isML ? 'ml-text' : ''}`}>{desc}</p>
   <div className="flex items-center gap-2 flex-wrap mt-auto">
    {actionEl}
    {item.hours && (
     <span className="text-[10px] text-muted">{item.hours}</span>
    )}
   </div>
  </div>
 );
}

function DistrictCard({ entry, isML }: { entry: DistrictEntry; isML: boolean }) {
 const { t } = useTranslation();
 const tokens = useContactTokens();
 const name = isML ? entry.district_ml : entry.district;
 const police = isPlaceholderValue(entry.police_control_room)
  ? null
  : entry.police_control_room;
 const excise = isPlaceholderValue(entry.excise_office)
  ? null
  : entry.excise_office;
 const hasContacts = police || excise;

 return (
  <div className="compact-card">
   <div className="flex items-center gap-2 mb-2">
    <Building2 size={14} className="text-secondary shrink-0" />
    <h3 className={`font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>{name}</h3>
    {!entry.verified && (
     <span className="ml-auto text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
      <AlertTriangle size={9} />
      {t('resources.unverifiedBadge')}
     </span>
    )}
   </div>
   {hasContacts ? (
    <div className="flex flex-col gap-1.5">
     {police && (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
       <span className={`text-xs font-semibold text-muted ${isML ? 'ml-text' : ''}`}>
        {t('resources.districtPolice')}
       </span>
       <PhoneLink
        phone={police}
        label={`${name} — ${t('resources.districtPolice')}`}
        className="text-xs text-accent font-mono hover:opacity-80"
       >
        {police}
       </PhoneLink>
      </div>
     )}
     {excise && (
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
       <span className={`text-xs font-semibold text-muted ${isML ? 'ml-text' : ''}`}>
        {t('resources.districtExcise')}
       </span>
       <PhoneLink
        phone={excise}
        label={`${name} — ${t('resources.districtExcise')}`}
        className="text-xs text-accent font-mono hover:opacity-80"
       >
        {excise}
       </PhoneLink>
      </div>
     )}
    </div>
   ) : (
    <p className={`text-xs text-muted ${isML ? 'ml-text' : ''}`}>
     {t('resources.districtPending', tokens)}
    </p>
   )}
  </div>
 );
}

export function Resources() {
 const { t, i18n } = useTranslation();
 const isML = i18n.language === 'ml';
 const { data, loading, error, retry } = useAppData();
 const tokens = useContactTokens();

 const resources = data?.resources ?? [];
 const districts = data?.districtDirectory ?? [];
 const [query, setQuery]      = useState('');
 const [activeCategory, setActiveCategory] = useState<Category>('all');

 const filtered = useMemo(() => {
  const q = query.toLowerCase();
  return resources.filter((r) => {
   const matchCat = activeCategory === 'all' || r.category === activeCategory;
   const matchQ  = !q
    || r.label_en.toLowerCase().includes(q)
    || r.label_ml.toLowerCase().includes(q)
    || r.desc_en.toLowerCase().includes(q)
    || r.value.toLowerCase().includes(q);
   return matchCat && matchQ;
  });
 }, [resources, activeCategory, query]);

 const showDistricts = (activeCategory === 'all' || activeCategory === 'local_office') && !query;

 return (
  <div className="flex flex-col gap-5">
   <PageHeader
    icon={<BookMarked size={18} className="text-indigo-600" />}
    title={t('resources.heading')}
    subtitle={t('resources.intro')}
    isML={isML}
   />

   {error && <DataErrorBanner onRetry={retry} />}

   {loading && resources.length === 0 && !error && (
    <p className={`text-muted text-sm text-center py-3 ${isML ? 'ml-text' : ''}`}>
     {t('dataError.loading')}
    </p>
   )}

   <div className="relative">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
    <input
     type="search"
     value={query}
     onChange={(e) => setQuery(e.target.value)}
     placeholder={t('resources.searchPlaceholder')}
     className={`input-field pl-9 ${isML ? 'ml-text' : ''}`}
    />
   </div>

   <div className="overflow-x-auto -mx-1 px-1 scrollbar-none">
    <div className="flex gap-1.5 min-w-max">
     {CATEGORY_ORDER.map((cat) => (
      <button
       key={cat}
       onClick={() => setActiveCategory(cat)}
       className={[
        'px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[44px] inline-flex items-center',
        activeCategory === cat
         ? 'bg-teal-700 text-white'
         : 'bg-surface border border-border text-secondary hover:border-teal-400 hover:text-teal-700',
       ].join(' ')}
      >
       {t(`resources.categories.${cat}`)}
      </button>
     ))}
    </div>
   </div>

   {filtered.length === 0 && !showDistricts ? (
    <p className={`text-muted text-sm text-center py-6 ${isML ? 'ml-text' : ''}`}>
     {t('resources.noResults')}
    </p>
   ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
     {filtered.map((r) => (
      <ResourceCard key={r.id} item={r} isML={isML} />
     ))}
    </div>
   )}

   {showDistricts && districts.length > 0 && (
    <section>
     <div className="flex items-center gap-2 mb-2.5">
      <ShieldAlert size={15} className="text-muted" />
      <h2 className={`heading-text font-bold text-primary text-sm ${isML ? 'ml-text' : ''}`}>
       {t('resources.districtHeading')}
      </h2>
     </div>
     <div className="tone-amber border rounded-card p-2.5 mb-2.5 flex items-start gap-2">
      <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
      <p className={`text-xs text-secondary leading-relaxed ${isML ? 'ml-text' : ''}`}>
       {t('resources.districtNote', tokens)}
      </p>
     </div>
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
      {districts.map((d) => (
       <DistrictCard key={d.district} entry={d} isML={isML} />
      ))}
     </div>
    </section>
   )}
  </div>
 );
}
