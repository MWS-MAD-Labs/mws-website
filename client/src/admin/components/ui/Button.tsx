type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'danger' | 'ghost' | 'outline' | 'primary';
  size?: 'md' | 'sm';
  fullWidth?: boolean;
};

export default function Button({
  className = '',
  fullWidth = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variantClass = {
    danger: 'border border-[#EF4444] bg-transparent text-[#EF4444] hover:bg-[#EF4444]/5',
    ghost: 'border border-transparent bg-transparent text-[#1C2434] hover:bg-[#1C2434]/5',
    outline:
      'border border-[#E2E8F0] bg-white text-[#1C2434] hover:bg-[#F1F5F9]',
    primary: 'border border-transparent bg-[#3C50E0] text-white hover:bg-[#2F3EC8]',
  }[variant];

  const sizeClass = size === 'sm' ? 'px-4 py-2 text-[13px]' : 'px-4 py-3 text-[14px]';

  return (
    <button
      type={type}
      className={[
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-[var(--f-head)] font-bold transition-colors',
        'disabled:cursor-wait disabled:opacity-70',
        variantClass,
        sizeClass,
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}
