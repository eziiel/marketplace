import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  name: string;
  value: string;
  options: SelectFieldOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  onValueChange: (value: string) => void;
}

export function SelectField({
  id,
  name,
  value,
  options,
  placeholder,
  label,
  error,
  className,
  onValueChange,
}: SelectFieldProps) {
  return (
    <Select
      id={id}
      name={name}
      value={value}
      items={options}
      onValueChange={(next) => onValueChange(next ?? "")}
    >
      <SelectTrigger
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={className}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
