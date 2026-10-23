import type { ReactNode } from "react";
import { useRealtime } from "./use-realtime";

export function RealtimeProvider({ children }: { children: ReactNode }) {
  useRealtime();

  return <>{children}</>;
}
