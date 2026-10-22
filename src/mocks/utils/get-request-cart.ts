import { HttpResponse } from "msw";
import type { Cart } from "@/features/cart/types/cart";
import { getAuthSession } from "../data/auth-store";
import { getSessionCart } from "../data/cart-store";

type RequestCartResult =
  | { ok: true; sessionId: string; cart: Cart }
  | { ok: false; response: Response };

export function getRequestCart(request: Request): RequestCartResult {
  const anonymousId = request.headers.get("X-Session-Id");

  if (!anonymousId) {
    return {
      ok: false,
      response: HttpResponse.json(
        { message: "Sessão não identificada" },
        { status: 401 },
      ),
    };
  }

  const authorization = request.headers.get("Authorization");

  let storageKey = anonymousId;

  if (authorization) {
    const match = /^Bearer (.+)$/.exec(authorization);

    const session = match ? getAuthSession(match[1]) : null;

    if (!session) {
      return {
        ok: false,
        response: HttpResponse.json(
          { message: "Sessão inválida ou expirada" },
          { status: 401 },
        ),
      };
    }

    storageKey = `user:${session.user.id}`;
  }

  return {
    ok: true,
    sessionId: storageKey,
    cart: getSessionCart(storageKey),
  };
}
