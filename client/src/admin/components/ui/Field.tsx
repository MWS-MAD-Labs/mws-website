type FieldProps = {
  children: React.ReactNode;
  label: string;
};

export default function Field({ children, label }: FieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
