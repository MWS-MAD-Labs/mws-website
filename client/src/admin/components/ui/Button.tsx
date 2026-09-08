type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline";
  size?: "md" | "sm";
  fullWidth?: boolean;
};

export default function Button({
  className = "",
  fullWidth = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "outline"
      ? "border border-[rgba(36,23,24,0.14)] bg-transparent text-[#241718] hover:bg-[#7e1518]/5"
      : "border border-transparent bg-[#7e1518] text-white hover:bg-[#5e1013]";
  const sizeClass =
    size === "sm"
      ? "px-4 py-2 text-[13px]"
      : "px-4 py-3 text-[14px]";

  return (
    <button
      type={type}
      className={[
        "cursor-pointer rounded-lg font-[var(--f-head)] font-bold transition-colors disabled:cursor-wait disabled:opacity-70",
        variantClass,
        sizeClass,
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
