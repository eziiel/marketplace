import { HttpResponse } from "msw";
import type { User } from "@/features/auth/types/auth";
import { getAuthSession } from "../data/auth-store";

type RequestUserResult =
  | { ok: true; user: User }
  | { ok: false; response: Response };

export function getRequestUser(request: Request): RequestUserResult {
  const authorization = request.headers.get("Authorization");
  const match = authorization ? /^Bearer (.+)$/.exec(authorization) : null;
  const session = match ? getAuthSession(match[1]) : null;

  if (!session) {
    return {
      ok: false,
      response: HttpResponse.json(
        { message: "Autenticação obrigatória" },
        { status: 401 },
      ),
    };
  }

  return { ok: true, user: session.user };
}
