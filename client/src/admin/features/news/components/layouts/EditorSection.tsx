import type { ReactNode } from 'react';

export default function EditorSection({
  action,
  children,
  description,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
