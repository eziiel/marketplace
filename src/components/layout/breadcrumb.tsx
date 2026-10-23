import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbProps {
  items: ReactNode[];
  current: string;
  className?: string;
}

export function Breadcrumb({ items, current, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha" className={cn("text-sm text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item}
            <span aria-hidden>/</span>
          </li>
        ))}
        <li aria-current="page" className="truncate">
          {current}
        </li>
      </ol>
    </nav>
  );
}
