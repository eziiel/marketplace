import type { AuthMode } from "@/features/auth/components/auth-modal";

export function parseAuthMode(value: unknown): AuthMode | undefined {
  return value === "login" || value === "signup" ? value : undefined;
}
