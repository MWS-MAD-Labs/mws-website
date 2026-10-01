type StatusMessageProps = {
  children: React.ReactNode;
};

export default function StatusMessage({ children }: StatusMessageProps) {
  return <p className="text-sm text-[#D97706]">{children}</p>;
}
