import type { ReactNode } from 'react';

type FormSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function FormSection({ title, action, children }: FormSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[#1C2434]">{title}</h3>
        {action}
      </div>

      {children}
    </section>
  );
}
