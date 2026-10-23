export type Scenario =
  | "success"
  | "payment_refused"
  | "timeout"
  | "stock_changed"
  | "price_changed";

const STORAGE_KEY = "marketplace-scenario";
const DEFAULT_SCENARIO: Scenario = "success";

const SCENARIOS: readonly Scenario[] = [
  "success",
  "payment_refused",
  "timeout",
  "stock_changed",
  "price_changed",
];

export function isScenario(value: unknown): value is Scenario {
  return (
    typeof value === "string" &&
    (SCENARIOS as readonly string[]).includes(value)
  );
}

export function getScenario(): Scenario {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return isScenario(stored) ? stored : DEFAULT_SCENARIO;
  } catch {
    return DEFAULT_SCENARIO;
  }
}

export function setScenario(scenario: Scenario): void {
  localStorage.setItem(STORAGE_KEY, scenario);
}

export function resetScenario(): void {
  localStorage.setItem(STORAGE_KEY, DEFAULT_SCENARIO);
}
