import {
 createContext,
 useContext,
 useState,
 useCallback,
 useRef,
 useEffect,
 type ReactNode,
} from 'react';
import {
 Phone, Copy, Check, X, PhoneCall,
 CheckCircle2, XCircle, Info, AlertTriangle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
 id: string;
 kind: 'phone' | 'status';
 // phone
 phone?: string;
 phoneLabel?: string;
 // status
 variant?: StatusVariant;
 message?: string;
 duration: number;
 exiting: boolean;
}

interface ToastContextValue {
 showPhone: (phone: string, label: string) => void;
 showStatus: (variant: StatusVariant, message: string, duration?: number) => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({
 showPhone: () => {},
 showStatus: () => {},
});

export const useToast = () => useContext(ToastContext);

// ── Status icon map ───────────────────────────────────────────────────────────

const STATUS_ICONS: Record<StatusVariant, ReactNode> = {
 success: <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />,
 error:  <XCircle size={16} className="text-red-500 shrink-0" />,
 info:  <Info size={16} className="text-teal-600 shrink-0" />,
 warning: <AlertTriangle size={16} className="text-amber-500 shrink-0" />,
};

const STATUS_STRIP: Record<StatusVariant, string> = {
 success: 'bg-emerald-500',
 error:  'bg-red-500',
 info:  'bg-teal-600',
 warning: 'bg-amber-500',
};

// ── Status toast card ─────────────────────────────────────────────────────────

function StatusCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
 return (
  <div
   className={`bg-surface rounded-2xl overflow-hidden shadow-toast border border-border
    ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
   role="status"
   aria-live="polite"
  >
   {/* Coloured top strip */}
   <div className={`h-1 w-full ${STATUS_STRIP[toast.variant ?? 'info']}`} />
   <div className="flex items-start gap-3 px-4 py-3 pr-3">
    {STATUS_ICONS[toast.variant ?? 'info']}
    <p className="text-sm text-secondary leading-snug flex-1 pt-px">{toast.message}</p>
    <button
     onClick={() => onDismiss(toast.id)}
     className="text-muted hover:text-secondary transition-colors ml-1 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
     aria-label="Dismiss"
    >
     <X size={14} />
    </button>
   </div>
  </div>
 );
}

// ── Phone toast card ──────────────────────────────────────────────────────────

function PhoneCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
 const [copied, setCopied] = useState(false);

 const copy = async () => {
  try {
   await navigator.clipboard.writeText(toast.phone ?? '');
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
  } catch {
   // clipboard blocked — silently ignore
  }
 };

 return (
  <div
   className={`bg-surface rounded-2xl shadow-toast border border-border overflow-hidden
    ${toast.exiting ? 'toast-exit' : 'toast-enter'}`}
   role="alert"
   aria-live="assertive"
  >
   {/* Teal header */}
   <div className="flex items-center justify-between bg-teal-700 px-4 py-2.5">
    <div className="flex items-center gap-2">
     <Phone size={13} className="text-teal-200" />
     <span className="text-xs font-semibold text-teal-100 truncate max-w-[200px]">
      {toast.phoneLabel}
     </span>
    </div>
    <button
     onClick={() => onDismiss(toast.id)}
     className="text-teal-300 hover:text-white transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
     aria-label="Dismiss"
    >
     <X size={14} />
    </button>
   </div>
   {/* Number + actions */}
   <div className="px-4 py-3">
    <p className="text-[1.6rem] font-bold text-primary tracking-wider mb-3 font-mono leading-none">
     {toast.phone}
    </p>
    <div className="flex gap-2">
     <button
      onClick={copy}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
       copied
        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
        : 'border-border text-secondary hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
      }`}
     >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
     </button>
     <button
      onClick={() => { window.location.href = `tel:${toast.phone}`; }}
      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
     >
      <PhoneCall size={13} />
      Call
     </button>
    </div>
   </div>
  </div>
 );
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
 const [toasts, setToasts] = useState<Toast[]>([]);
 const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

 const dismiss = useCallback((id: string) => {
  setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
  const t = setTimeout(
   () => setToasts((prev) => prev.filter((t) => t.id !== id)),
   280,
  );
  timers.current.set(`exit-${id}`, t);
 }, []);

 const showPhone = useCallback(
  (phone: string, label: string) => {
   const id = `${Date.now()}-${Math.random()}`;
   // Newest prepended so it appears closest to trigger point
   setToasts((prev) => [
    { id, kind: 'phone', phone, phoneLabel: label, duration: 6000, exiting: false },
    ...prev.slice(0, 2),
   ]);
   const t = setTimeout(() => dismiss(id), 6000);
   timers.current.set(id, t);
  },
  [dismiss],
 );

 const showStatus = useCallback(
  (variant: StatusVariant, message: string, duration = 4500) => {
   const id = `${Date.now()}-${Math.random()}`;
   setToasts((prev) => [
    { id, kind: 'status', variant, message, duration, exiting: false },
    ...prev.slice(0, 2),
   ]);
   const t = setTimeout(() => dismiss(id), duration);
   timers.current.set(id, t);
  },
  [dismiss],
 );

 useEffect(() => () => timers.current.forEach(clearTimeout), []);

 return (
  <ToastContext.Provider value={{ showPhone, showStatus }}>
   {children}
   {/*
    Mobile: bottom-28 (above ContactBar) | left-3 right-3 | flex-col-reverse (newest visually bottom)
    Desktop: top-4 right-4 | w-80 | flex-col (newest at top)
   */}
   <div
    className={[
     'fixed z-[9999] flex gap-2 pointer-events-none',
     'flex-col-reverse bottom-[var(--stack-bottom)] left-3 right-3',
     'sm:flex-col sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:w-80',
    ].join(' ')}
    aria-label="Notifications"
    aria-live="polite"
   >
    {toasts.map((toast) => (
     <div key={toast.id} className="pointer-events-auto">
      {toast.kind === 'phone'
       ? <PhoneCard toast={toast} onDismiss={dismiss} />
       : <StatusCard toast={toast} onDismiss={dismiss} />
      }
     </div>
    ))}
   </div>
  </ToastContext.Provider>
 );
}
