import { cn } from "@/globals/libs/styleUtils";

export type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
};

const Select = ({ value, onChange, options, className }: Props) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none",
        "focus:border-white/20 transition",
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-slate-950">
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default Select;