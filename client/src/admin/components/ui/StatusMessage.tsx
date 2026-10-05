import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

type StatusMessageProps = {
  children: React.ReactNode;
  tone?: 'error' | 'info' | 'success' | 'warning';
};

function inferStatusMessageTone(message: React.ReactNode): StatusMessageProps['tone'] {
  const text =
    typeof message === 'string' || typeof message === 'number' ? String(message).toLowerCase() : '';

  if (
    /\b(failed|failure|could not|cannot|can't|error|invalid|required|not found|unauthorized|forbidden)\b/.test(
      text,
    )
  ) {
    return 'error';
  }

  if (
    /\b(saved|updated|created|deleted|attached|detached|reordered|uploaded|sent|resent|revoked|reactivated|deactivated|published|reset)\b/.test(
      text,
    )
  ) {
    return 'success';
  }

  if (/\b(before|already|only active|no active|no .* available)\b/.test(text)) {
    return 'warning';
  }

  return 'info';
}

export default function StatusMessage({ children, tone }: StatusMessageProps) {
  const nextTone = tone ?? inferStatusMessageTone(children);
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
