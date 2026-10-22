import type { Cart } from "@/features/cart/types/cart";
import { getSessionCart } from "../data/cart-store";
import { HttpResponse } from "msw";

type RequestCartResult =
  | { ok: true; sessionId: string; cart: Cart }
  | { ok: false; response: Response };

export function getRequestCart(request: Request): RequestCartResult {
  const sessionId = request.headers.get("X-Session-Id");

  if (!sessionId) {
    return {
      ok: false,
      response: HttpResponse.json(
        { message: "Sessão não identificada" },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    sessionId,
    cart: getSessionCart(sessionId),
  };
}
