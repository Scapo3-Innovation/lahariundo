import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
 title: ReactNode;
 children: ReactNode;
 defaultOpen?: boolean;
 icon?: ReactNode;
 badge?: ReactNode;
 tone?: string;
 isML?: boolean;
}

export function Accordion({
 title,
 children,
 defaultOpen = false,
 icon,
 badge,
 tone = 'bg-surface border-border',
 isML,
}: AccordionProps) {
 const [open, setOpen] = useState(defaultOpen);

 return (
  <div className={`rounded-card border overflow-hidden ${tone}`}>
   <button
    type="button"
    onClick={() => setOpen((v) => !v)}
    className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/60 transition-colors"
    aria-expanded={open}
   >
    {icon && <span className="shrink-0">{icon}</span>}
    <span className={`flex-1 font-semibold text-sm text-primary leading-snug ${isML ? 'ml-text' : ''}`}>
     {title}
    </span>
    {badge}
    <ChevronDown
     size={16}
     className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    />
   </button>
   {open && (
    <div className="accordion-body border-t border-border px-4 pb-4 pt-3">
     {children}
    </div>
   )}
  </div>
 );
}
