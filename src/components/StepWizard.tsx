import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepWizardProps {
 steps: string[];
 isML?: boolean;
 stepLabel?: (current: number, total: number) => string;
 prevLabel?: string;
 nextLabel?: string;
 restartLabel?: string;
}

export function StepWizard({
 steps,
 isML,
 stepLabel,
 prevLabel = 'Back',
 nextLabel = 'Next',
 restartLabel = 'Start over',
}: StepWizardProps) {
 const [idx, setIdx] = useState(0);
 const total = steps.length;
 const atStart = idx === 0;
 const atEnd = idx === total - 1;

 return (
  <div className="bg-surface rounded-card border border-border p-4">
   <div className="flex items-center justify-between mb-4">
    <p className={`ui-label ${isML ? 'ml-text' : ''}`}>
     {stepLabel ? stepLabel(idx + 1, total) : `${idx + 1} / ${total}`}
    </p>
    <div className="flex gap-1">
     {steps.map((_, i) => (
      <button
       key={i}
       type="button"
       onClick={() => setIdx(i)}
       aria-label={`Step ${i + 1}`}
       className={`h-1.5 rounded-full transition-all ${
        i === idx ? 'w-5 bg-accent' : i < idx ? 'w-1.5 bg-accent/50' : 'w-1.5 bg-border-strong'
       }`}
      />
     ))}
    </div>
   </div>

   <p
    key={idx}
    className={`text-sm text-secondary leading-relaxed min-h-[4.5rem] fade-up ${isML ? 'ml-text' : ''}`}
   >
    {steps[idx]}
   </p>

   <div className="flex gap-2 mt-4">
    <button
     type="button"
     onClick={() => setIdx((i) => i - 1)}
     disabled={atStart}
     className="btn-ghost flex-1 disabled:opacity-40"
    >
     <ChevronLeft size={15} />
     {prevLabel}
    </button>
    <button
     type="button"
     onClick={() => setIdx((i) => (atEnd ? 0 : i + 1))}
     className="btn-primary flex-1"
    >
     {atEnd ? restartLabel : nextLabel}
     {!atEnd && <ChevronRight size={15} />}
    </button>
   </div>
  </div>
 );
}
