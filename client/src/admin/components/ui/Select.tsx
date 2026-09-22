import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = '', ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={[
          'w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-9 text-sm outline-none transition',
          'focus:border-[#7e1518] focus:ring-2 focus:ring-[#7e1518]/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        aria-hidden="true"
      />
    </div>
  );
}
