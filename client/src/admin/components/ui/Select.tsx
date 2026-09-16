type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={[
        "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#7e1518]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
