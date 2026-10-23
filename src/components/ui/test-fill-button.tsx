import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

export function TestFillButton({
  onFill,
  className,
}: {
  onFill: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onFill}
      className={cn(
        "inline-flex items-center gap-2 rounded-[4px] border border-dashed border-primary/60 px-3 py-1.5 text-xs text-primary transition-colors hover:border-primary hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden />
      Preencher com dados de teste
    </button>
  );
}
