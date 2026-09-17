type EditorialTextProps = {
  title: string;
  children: React.ReactNode;
};

export default function EditorialText({ title, children }: EditorialTextProps) {
  return (
    <section className="w-full bg-white py-[96px] md:py-[120px]">
      <div className="mx-auto w-full max-w-[1060px] px-6 md:px-10">
        <h2 className="mb-8 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.1] tracking-[-0.025em] text-[var(--charcoal)]">
          {title}
        </h2>

        <div className="max-w-[900px] space-y-5 text-[15px] leading-7 text-[var(--charcoal-muted)]">
          {children}
        </div>
      </div>
    </section>
  );
}
