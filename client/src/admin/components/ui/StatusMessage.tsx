import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { inferStatusTone, type StatusTone } from './statusTone';

type StatusMessageProps = {
  children: React.ReactNode;
  tone?: StatusTone;
};

export default function StatusMessage({ children, tone }: StatusMessageProps) {
  const nextTone = tone ?? inferStatusTone(children);
  const Icon =
    nextTone === 'success'
      ? CheckCircle2
      : nextTone === 'error'
        ? XCircle
        : nextTone === 'warning'
          ? AlertTriangle
          : Info;
  const className =
    nextTone === 'success'
      ? 'text-[#047857]'
      : nextTone === 'error'
        ? 'text-[#B91C1C]'
        : nextTone === 'warning'
          ? 'text-[#D97706]'
          : 'text-[#64748B]';

  return (
    <p
      role={nextTone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 text-sm ${className}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
