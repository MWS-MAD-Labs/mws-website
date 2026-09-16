type StatusMessageProps = {
  children: React.ReactNode;
};

export default function StatusMessage({ children }: StatusMessageProps) {
  return <p className="text-sm text-[#7b3f2a]">{children}</p>;
}
