import { brandPaths, type BrandName } from "./brand-paths";

export type { BrandName };

export function BrandIcon({
  name,
  className,
}: {
  name: BrandName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={brandPaths[name]} />
    </svg>
  );
}
