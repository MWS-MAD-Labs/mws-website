type FieldProps = {
  children: React.ReactNode;
  label: string;
  hint?: string;
  /**
   * Use "div" for controls that are not a single input, such as the rich-text
   * editor. A <label> forwards clicks inside it to its first button, which
   * would fire a toolbar button whenever the editor text is clicked.
   */
  as?: 'label' | 'div';
};

export default function Field({ children, label, hint, as = 'label' }: FieldProps) {
  const Wrapper = as;

  return (
    <Wrapper className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-[#64748B]">{hint}</span> : null}
    </Wrapper>
  );
}
