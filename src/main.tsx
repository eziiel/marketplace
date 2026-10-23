import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { queryClient } from "@/lib/query-client";
import { router } from "@/app/router";
import { RealtimeProvider } from "@/features/realtime/realtime-provider";

import "./index.css";

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "true") {
    return;
  }

  const { worker } = await import("./mocks/browser");

  await worker.start({
    onUnhandledFrame: "bypass",
  });
}

async function bootstrap() {
  await enableMocking();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RealtimeProvider>
          <RouterProvider router={router} />
        </RealtimeProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
