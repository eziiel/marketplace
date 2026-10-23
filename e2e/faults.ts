import type { Page } from "@playwright/test";

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

interface TestApiCall {
  url: string;
  method: string;
  body?: string;
}

interface TestApiResult {
  status: number;
  body: unknown;
}

async function callTestApi(
  page: Page,
  call: TestApiCall,
): Promise<TestApiResult> {
  return page.evaluate(async (payload) => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const response = await fetch(payload.url, {
        method: payload.method,
        headers: payload.body ? { "Content-Type": "application/json" } : {},
        body: payload.body,
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        return { status: response.status, body: await response.json() };
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    throw new Error(
      "A API simulada (MSW) não respondeu em JSON — worker não iniciou",
    );
  }, call);
}

export async function setFaults(
  page: Page,
  faults: NetworkFault[],
): Promise<void> {
  const result = await callTestApi(page, {
    url: "/api/test/network",
    method: "POST",
    body: JSON.stringify({ faults }),
  });

  if (result.status !== 200) {
    throw new Error(
      `Falha ao configurar cenário de rede: HTTP ${result.status}`,
    );
  }
}

export async function clearFaults(page: Page): Promise<void> {
  await callTestApi(page, { url: "/api/test/network", method: "DELETE" });
}

export async function listFaults(page: Page): Promise<NetworkFault[]> {
  const result = await callTestApi(page, {
    url: "/api/test/network",
    method: "GET",
  });

  return (result.body as { faults: NetworkFault[] }).faults;
}

export async function resetApi(page: Page): Promise<void> {
  await callTestApi(page, { url: "/api/test/reset", method: "POST" });
}
