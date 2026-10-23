import { delay, http, HttpResponse } from "msw";

import {
  clearFaults,
  consumeFault,
  listFaults,
  parseFaults,
  setFaults,
} from "./data/network-faults";

const DEFAULT_LATENCY_MS = 800;
const DEFAULT_TIMEOUT_MS = 12_000;

export const faultInterceptor = http.all("/api/*", async ({ request }) => {
  const { pathname } = new URL(request.url);
  const fault = consumeFault(pathname, request.method);

  if (!fault) {
    return undefined;
  }

  switch (fault.mode) {
    case "latency":
      await delay(fault.delayMs ?? DEFAULT_LATENCY_MS);
      return undefined;

    case "timeout":
      await delay(fault.delayMs ?? DEFAULT_TIMEOUT_MS);
      return undefined;

    case "offline":
      return HttpResponse.error();

    case "error500":
      return HttpResponse.json(
        { message: "Erro interno do servidor" },
        { status: 500 },
      );

    case "error503":
      return HttpResponse.json(
        { message: "Serviço temporariamente indisponível" },
        { status: 503 },
      );

    case "error504":
      return HttpResponse.json(
        { message: "Tempo limite do servidor excedido" },
        { status: 504 },
      );

    case "unauthorized":
      return HttpResponse.json({ message: "Sessão expirada" }, { status: 401 });
  }
});

export const networkTestHandlers = [
  http.get("/api/test/network", () => {
    return HttpResponse.json({ faults: listFaults() });
  }),

  http.post("/api/test/network", async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      faults?: unknown;
    } | null;

    const faults = parseFaults(body?.faults);

    if (!faults) {
      return HttpResponse.json(
        { message: "Lista de falhas inválida" },
        { status: 400 },
      );
    }

    setFaults(faults);

    return HttpResponse.json({ ok: true, faults });
  }),

  http.delete("/api/test/network", () => {
    clearFaults();

    return HttpResponse.json({ ok: true, faults: [] });
  }),
];
