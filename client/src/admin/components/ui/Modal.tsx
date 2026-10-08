import { useEffect } from 'react';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export default function Modal({ children, onClose, open, title }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-lg bg-white shadow-xl"
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="rounded px-2 py-1 text-xl leading-none text-[#64748B] hover:bg-[#1C2434]/5"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
