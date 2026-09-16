type PanelProps = {
  action?: React.ReactNode;
  children: React.ReactNode;
  description?: React.ReactNode;
  title?: string;
};

export default function Panel({ action, children, description, title }: PanelProps) {
  return (
    <section className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
      {title || action || description ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(36,23,24,0.1)] px-5 py-4">
          <div>
            {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
            {description ? (
              <div className="mt-1 text-sm text-[#625759]">{description}</div>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}
