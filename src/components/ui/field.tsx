import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FieldProps {
  id: string;
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  required = false,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      {label ? (
        <label htmlFor={id} className="block text-[15px] text-foreground">
          {label}
          {required && (
            <>
              <span aria-hidden className="text-[#f0805f]">
                *
              </span>
              <span className="sr-only"> (obrigatório)</span>
            </>
          )}
        </label>
      ) : (
        <span aria-hidden className="block h-[22px]" />
      )}

      <div className="mt-3">{children}</div>

      <p
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        className="mt-1.5 min-h-4 text-xs text-destructive"
      >
        {error}
      </p>
    </div>
  );
}
