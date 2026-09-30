import { AlertTriangle, CheckCircle2, Info, X, XCircle, type LucideIcon } from 'lucide-react';

export type NoticeTone = 'success' | 'error' | 'warning' | 'info';

export type NoticeMessage = {
  tone: NoticeTone;
  text: string;
} | null;

const TONES: Record<NoticeTone, { icon: LucideIcon; className: string; role: 'status' | 'alert' }> = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    role: 'status',
  },
  error: { icon: XCircle, className: 'border-red-200 bg-red-50 text-red-800', role: 'alert' },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    role: 'status',
  },
  info: { icon: Info, className: 'border-gray-200 bg-gray-50 text-gray-700', role: 'status' },
};

/**
 * The one message style used across the CMS: green for success, red for
 * errors, amber for warnings, grey for information. Errors are announced to
 * screen readers immediately.
 */
export default function Notice({
  tone,
  children,
  action,
  onDismiss,
  className = '',
}: {
  tone: NoticeTone;
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  className?: string;
}) {
  const style = TONES[tone];
  const Icon = style.icon;

  return (
    <div
      role={style.role}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${style.className} ${className}`}
    >
      <Icon size={18} className="mt-px shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 break-words">{children}</div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
        >
          {action.label}
        </button>
      ) : null}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss message"
          onClick={onDismiss}
          className="-m-1 shrink-0 rounded p-1 opacity-70 hover:bg-black/5 hover:opacity-100"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
