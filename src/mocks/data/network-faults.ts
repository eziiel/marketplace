export type FaultMode =
  | "latency"
  | "timeout"
  | "offline"
  | "error500"
  | "error503"
  | "error504"
  | "unauthorized";

export interface NetworkFault {
  path: string;
  method?: string;
  mode: FaultMode;
  delayMs?: number;
  times?: number;
}

const STORAGE_KEY = "marketplace-network-faults";

const MODES: readonly FaultMode[] = [
  "latency",
  "timeout",
  "offline",
  "error500",
  "error503",
  "error504",
  "unauthorized",
];

function isFault(value: unknown): value is NetworkFault {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const fault = value as Record<string, unknown>;

  return (
    typeof fault.path === "string" &&
    fault.path.startsWith("/api/") &&
    !fault.path.startsWith("/api/test") &&
    typeof fault.mode === "string" &&
    (MODES as readonly string[]).includes(fault.mode) &&
    (fault.method === undefined || typeof fault.method === "string") &&
    (fault.delayMs === undefined ||
      (typeof fault.delayMs === "number" && fault.delayMs >= 0)) &&
    (fault.times === undefined ||
      (typeof fault.times === "number" && fault.times > 0))
  );
}

export function parseFaults(value: unknown): NetworkFault[] | null {
  if (!Array.isArray(value) || !value.every(isFault)) {
    return null;
  }

  return value as NetworkFault[];
}

export function listFaults(): NetworkFault[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    return parseFaults(JSON.parse(stored)) ?? [];
  } catch {
    return [];
  }
}

export function setFaults(faults: NetworkFault[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(faults));
}

export function clearFaults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function matchesPath(pathname: string, pattern: string): boolean {
  if (pattern.endsWith("*")) {
    return pathname.startsWith(pattern.slice(0, -1));
  }

  return pathname === pattern;
}

export function consumeFault(
  pathname: string,
  method: string,
): NetworkFault | null {
  if (pathname.startsWith("/api/test/")) {
    return null;
  }

  const faults = listFaults();

  const index = faults.findIndex(
    (fault) =>
      matchesPath(pathname, fault.path) &&
      (fault.method === undefined ||
        fault.method.toUpperCase() === method.toUpperCase()),
  );

  if (index === -1) {
    return null;
  }

  const fault = faults[index];

  if (fault.times !== undefined) {
    const remaining = fault.times - 1;

    if (remaining <= 0) {
      faults.splice(index, 1);
    } else {
      faults[index] = { ...fault, times: remaining };
    }

    setFaults(faults);
  }

  return fault;
}
