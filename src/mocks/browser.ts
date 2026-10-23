import { setupWorker } from "msw/browser";
import { handlers } from "./handlers.ts";
import { faultInterceptor, networkTestHandlers } from "./network-handlers.ts";
import { realtimeHandlers } from "./socket/realtime.ts";

export const worker = setupWorker(
  faultInterceptor,
  ...networkTestHandlers,
  ...handlers,
  ...realtimeHandlers,
);