import type { ReactNode } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
}

export function FormField({
  id,
  label,
  required = false,
  error,
  children,
  className,
  labelClassName,
  controlClassName,
}: FormFieldProps) {
  return (
    <Field
      data-invalid={error ? true : undefined}
      className={cn("min-w-0 gap-0", className)}
    >
      {label ? (
        <FieldLabel
          htmlFor={id}
          className={cn("block text-[15px] text-foreground", labelClassName)}
        >
          {label}
          {required && (
            <>
              <span aria-hidden className="text-[#f0805f]">
                *
              </span>
              <span className="sr-only"> (obrigatório)</span>
            </>
          )}
        </FieldLabel>
      ) : (
        <span aria-hidden className="block h-[22px]" />
      )}

      <div className={cn("mt-3", controlClassName)}>{children}</div>

      <div className="mt-1.5 min-h-4">
        <FieldError id={`${id}-error`} className="text-xs">
          {error}
        </FieldError>
      </div>
    </Field>
  );
}
