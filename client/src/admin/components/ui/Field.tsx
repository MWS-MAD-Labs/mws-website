type FieldProps = {
  children: React.ReactNode;
  label: string;
  hint?: string;
  optional?: boolean;
  required?: boolean;
  /**
   * Use "div" for controls that are not a single input, such as the rich-text
   * editor. A <label> forwards clicks inside it to its first button, which
   * would fire a toolbar button whenever the editor text is clicked.
   */
  as?: 'label' | 'div';
};

export default function Field({
  children,
  label,
  hint,
  optional = true,
  required = false,
  as = 'label',
}: FieldProps) {
  const Wrapper = as;

  return (
    <Wrapper className="grid gap-1 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
        {!required && optional ? (
          <span className="ml-1 text-xs font-normal text-[#94A3B8]">(opsional)</span>
        ) : null}
      </span>
      {children}
      {hint ? <span className="text-xs font-normal text-[#64748B]">{hint}</span> : null}
    </Wrapper>
  );
}
