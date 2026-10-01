import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

type PopupInfoProps = {
  title: string;
  description: string;
  buttonText?: string;
  buttonTo?: string;
  onClose: () => void;
};

export default function PopupInfo({
  title,
  description,
  buttonText = 'Close',
  buttonTo,
  onClose,
}: PopupInfoProps) {
  return (
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-[rgba(36,23,24,0.58)] px-5 py-8 backdrop-blur-[4px]"
      role="presentation"
    >
      <section
        className="relative w-full max-w-[560px] overflow-hidden bg-[#f8f5ef] px-8 py-11 text-center shadow-[0_30px_80px_rgba(36,23,24,0.28)] sm:px-14 sm:py-14"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-info-title"
        aria-describedby="popup-info-description"
      >
        {/* Decorative background */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-[rgba(126,21,24,0.12)]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border border-[rgba(214,161,58,0.22)]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-[rgba(126,21,24,0.035)]"
          aria-hidden="true"
        />

        <button
          className="absolute right-5 top-5 z-10 grid h-8 w-8 place-items-center text-[var(--charcoal-muted)] transition-colors duration-200 hover:text-[var(--burgundy)] motion-reduce:transition-none"
          type="button"
          aria-label="Close popup"
          onClick={onClose}
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
        </button>

        <div className="relative">
          <div className="mx-auto mb-7 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[var(--gold)]" />

            <img
              src="/Millennia-World-School-Logo-Only.svg"
              alt="Millennia World School"
              className="h-7 w-auto"
            />

            <span className="h-px w-8 bg-[var(--gold)]" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--burgundy)]">
            Millennia World School
          </p>

          <h2
            id="popup-info-title"
            className="mx-auto mt-4 max-w-[430px] text-[clamp(30px,4vw,42px)] font-[var(--f-head)] font-semibold leading-[1.08] tracking-[-0.025em] text-[var(--charcoal)]"
          >
            {title}
          </h2>

          <p
            id="popup-info-description"
            className="mx-auto mt-5 max-w-[420px] text-[15px] leading-[1.75] text-[var(--charcoal-muted)] sm:text-base"
          >
            {description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {buttonTo ? (
              <Link
                className="inline-flex min-h-[46px] min-w-[130px] items-center justify-center bg-[var(--burgundy)] px-7 py-3 text-xs font-[var(--f-head)] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-[var(--burgundy-dark)] motion-reduce:transition-none"
                to={buttonTo}
                onClick={onClose}
              >
                {buttonText}
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[46px] min-w-[130px] items-center justify-center bg-[var(--burgundy)] px-7 py-3 text-xs font-[var(--f-head)] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 hover:bg-[var(--burgundy-dark)] motion-reduce:transition-none"
              >
                {buttonText}
              </button>
            )}
          </div>

          <div className="mx-auto mt-8 h-px w-16 bg-[rgba(126,21,24,0.16)]" />
        </div>
      </section>
    </div>
  );
}
