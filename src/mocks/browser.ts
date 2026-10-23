import { setupWorker } from "msw/browser";
import { handlers } from "./handlers.ts";
import { realtimeHandlers } from "./socket/realtime.ts";

export const worker = setupWorker(...handlers, ...realtimeHandlers);