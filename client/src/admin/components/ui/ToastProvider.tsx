import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import type { StatusTone } from './statusTone';
import { ToastContext } from './toastContext';

type ToastItem = {
  id: number;
  message: string;
  tone: StatusTone;
};

const MAX_VISIBLE = 3;
const DURATION: Record<StatusTone, number> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 9000,
};

const TONE_STYLES: Record<StatusTone, { Icon: typeof Info; className: string }> = {
  success: { Icon: CheckCircle2, className: 'border-[#10B981]/30 text-[#047857]' },
  error: { Icon: XCircle, className: 'border-[#DC2626]/30 text-[#B91C1C]' },
  warning: { Icon: AlertTriangle, className: 'border-[#F59E0B]/40 text-[#B45309]' },
  info: { Icon: Info, className: 'border-[#E2E8F0] text-[#334155]' },
};

function Toast({ item, onClose }: { item: ToastItem; onClose: (id: number) => void }) {
  const { Icon, className } = TONE_STYLES[item.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => onClose(item.id), DURATION[item.tone]);
    return () => window.clearTimeout(timer);
  }, [item.id, item.tone, onClose]);

  return (
    <div
      role={item.tone === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white px-4 py-3 text-sm shadow-lg ${className}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 break-words leading-5">{item.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        className="-mr-1 shrink-0 rounded p-1 text-[#64748B] hover:bg-[#F1F5F9]"
        onClick={() => onClose(item.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const close = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((message: string, tone: StatusTone = 'info') => {
    const id = nextId.current++;
    setItems((current) => {
      // The same message twice in a row only refreshes the existing toast.
      const withoutDuplicate = current.filter(
        (item) => item.message !== message || item.tone !== tone,
      );
      return [...withoutDuplicate, { id, message, tone }].slice(-MAX_VISIBLE);
    });
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:w-[380px]"
      >
        {items.map((item) => (
          <Toast key={item.id} item={item} onClose={close} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
