import type { ReactNode } from 'react';

export interface ChipTab<T extends string> {
 id: T;
 label: string;
 icon?: ReactNode;
}

interface ChipTabsProps<T extends string> {
 tabs: ChipTab<T>[];
 active: T;
 onChange: (id: T) => void;
 isML?: boolean;
}

export function ChipTabs<T extends string>({ tabs, active, onChange, isML }: ChipTabsProps<T>) {
 return (
  <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
   {tabs.map((tab) => {
    const selected = tab.id === active;
    return (
     <button
      key={tab.id}
      type="button"
      onClick={() => onChange(tab.id)}
      className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-all min-h-[44px] ${
       selected
        ? 'bg-accent text-accent-text border-accent'
        : 'bg-surface text-secondary border-border hover:border-border-strong hover:text-primary'
      } ${isML ? 'ml-text' : ''}`}
      aria-pressed={selected}
     >
      {tab.icon}
      {tab.label}
     </button>
    );
   })}
  </div>
 );
}
