import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

const inputClass =
  'mt-2 w-full rounded-md border border-[#E2E8F0] px-3 text-sm font-normal text-[#1C2434] outline-none placeholder:text-[#94A3B8] focus:border-[#3C50E0] disabled:bg-[#F8FAFC] disabled:text-[#64748B]';

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel';
};

export function TextField({
  label,
  value,
  onChange,
  disabled = false,
  required = true,
  hint,
  placeholder,
  type = 'text',
}: TextFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="block text-sm font-semibold text-[#1C2434]">{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`${inputClass} h-10`}
      />
      {hint ? <span className="mt-1 block text-xs text-[#64748B]">{hint}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = TextFieldProps & {
  rows?: number;
};

export function TextAreaField({
  label,
  value,
  onChange,
  disabled = false,
  required = true,
  hint,
  placeholder,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <label className="block min-w-0">
      <span className="block text-sm font-semibold text-[#1C2434]">{label}</span>
      <textarea
        value={value}
        disabled={disabled}
        required={required}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`${inputClass} resize-y py-2.5 leading-6`}
      />
      {hint ? <span className="mt-1 block text-xs text-[#64748B]">{hint}</span> : null}
    </label>
  );
}

type SectionCardProps = {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SectionCard({ number, title, description, children }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-[#E2E8F0] px-5 py-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f3f0ef] text-xs font-bold text-[#64748B]">
          {number}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#1C2434]">{title}</h2>
          <p className="mt-0.5 text-xs text-[#817678]">{description}</p>
        </div>
      </div>
      <div className="space-y-5 p-5">{children}</div>
    </section>
  );
}

type RowActionsProps = {
  index: number;
  count: number;
  label: string;
  disabled?: boolean;
  /** At least this many rows must stay; the remove button hides below it. */
  minRows?: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

const iconButtonClass =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#E2E8F0] text-[#64748B] transition-colors hover:border-[#3C50E0]/30 hover:text-[#3C50E0] disabled:cursor-not-allowed disabled:opacity-40';

export function RowActions({
  index,
  count,
  label,
  disabled = false,
  minRows = 1,
  onMove,
  onRemove,
}: RowActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-label={`Move ${label} up`}
        disabled={disabled || index === 0}
        className={iconButtonClass}
        onClick={() => onMove(-1)}
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        aria-label={`Move ${label} down`}
        disabled={disabled || index === count - 1}
        className={iconButtonClass}
        onClick={() => onMove(1)}
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        aria-label={`Remove ${label}`}
        disabled={disabled || count <= minRows}
        className={`${iconButtonClass} hover:border-[#DC2626]/30 hover:text-[#DC2626]`}
        onClick={onRemove}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function AddRowButton({
  label,
  disabled = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-[#CBD5E1] px-3 text-sm font-medium text-[#3C50E0] transition-colors hover:border-[#3C50E0] disabled:cursor-not-allowed disabled:opacity-50"
    >
      + {label}
    </button>
  );
}
