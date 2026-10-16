import { X } from 'lucide-react';
import { useEffect, useEffectEvent, useId, useRef } from 'react';

type ModalProps = {
  children: React.ReactNode;
  closeDisabled?: boolean;
  onClose: () => void;
  open: boolean;
  size?: 'md' | 'lg' | 'xl';
  title: string;
};

export default function Modal({
  children,
  closeDisabled = false,
  onClose,
  open,
  size = 'md',
  title,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeFromEffect = useEffectEvent(() => {
    if (!closeDisabled) onClose();
  });

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? dialogRef.current)?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeFromEffect();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4"
      onMouseDown={(event) => {
        if (!closeDisabled && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-white shadow-xl ${
          size === 'xl' ? 'max-w-6xl' : size === 'lg' ? 'max-w-3xl' : 'max-w-[560px]'
        }`}
        role="dialog"
        ref={dialogRef}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-lg font-semibold" id={titleId}>{title}</h2>
          <button
            className="grid h-11 w-11 place-items-center rounded text-[#475569] hover:bg-[#1C2434]/5 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={closeDisabled}
          >
            <X size={18} />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
