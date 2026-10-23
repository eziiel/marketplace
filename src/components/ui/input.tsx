import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  type = "text",
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full rounded-[4px] border border-border bg-transparent px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:outline-none aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
