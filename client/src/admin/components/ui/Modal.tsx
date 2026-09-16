type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
};

export default function Modal({ children, onClose, open, title }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 px-4">
      <section className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-lg bg-white shadow-xl">
        <header className="flex items-center justify-between border-b border-[rgba(36,23,24,0.12)] px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="rounded px-2 py-1 text-xl leading-none text-[#625759] hover:bg-[#241718]/5"
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
