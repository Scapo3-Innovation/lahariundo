import type { ReactNode } from 'react';

interface Props {
 icon: ReactNode;
 title: string;
 subtitle?: string;
 isML?: boolean;
}

export function PageHeader({ icon, title, subtitle, isML }: Props) {
 return (
  <div className="flex items-start gap-3 mb-6">
   <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0 text-secondary">
    {icon}
   </div>
   <div>
    <h1 className={`text-xl sm:text-2xl font-bold text-primary leading-tight ${isML ? 'ml-text' : ''}`}>
     {title}
    </h1>
    {subtitle && (
     <p className={`text-secondary text-sm mt-1 leading-relaxed ${isML ? 'ml-text' : ''}`}>
      {subtitle}
     </p>
    )}
   </div>
  </div>
 );
}
