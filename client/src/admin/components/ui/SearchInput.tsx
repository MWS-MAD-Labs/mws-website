type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchInput({ className = "", type = "text", ...props }: SearchInputProps) {
  return (
    <input
      type={type}
      className={[
        "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#7e1518]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
