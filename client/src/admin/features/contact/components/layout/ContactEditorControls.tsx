type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
};

export function TextField({
  label,
  value,
  onChange,
  disabled = false,
  required = true,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1C2434]">
        {label}
      </label>

      <input
        value={value}
        disabled={disabled}
        required={required}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-2 h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm font-normal outline-none focus:border-[#3C50E0]"
      />

      <div className="mt-1 flex justify-end">
        <span className="text-[11px] font-normal text-[#817678]">
          {value.length}
        </span>
      </div>
    </div>
  );
}

type TextAreaFieldProps = TextFieldProps & {
  rows?: number;
};

export function TextAreaField({
  label,
  value,
  onChange,
  disabled = false,
  required = true,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1C2434]">
        {label}
      </label>

      <textarea
        value={value}
        disabled={disabled}
        required={required}
        rows={rows}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="mt-2 w-full rounded-md border border-[#E2E8F0] px-3 py-3 text-sm font-normal outline-none focus:border-[#3C50E0]"
      />

      <div className="mt-1 flex justify-end">
        <span className="text-[11px] font-normal text-[#817678]">
          {value.length}
        </span>
      </div>
    </div>
  );
}
