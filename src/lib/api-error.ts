import axios from "axios";

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string>;
}

export function apiErrorBody(error: unknown): ApiErrorBody | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as unknown;

  if (typeof data !== "object" || data === null || !("message" in data)) {
    return null;
  }

  const body = data as { message?: unknown; errors?: unknown };

  return {
    message: typeof body.message === "string" ? body.message : "",
    errors:
      typeof body.errors === "object" && body.errors !== null
        ? (body.errors as Record<string, string>)
        : undefined,
  };
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const body = apiErrorBody(error);

  if (body?.message) return body.message;

  if (hasNoResponse(error)) {
    return axios.isAxiosError(error) && error.code === "ECONNABORTED"
      ? "O servidor demorou demais para responder. Tente novamente."
      : "Não foi possível falar com o servidor. Verifique sua conexão.";
  }

  return error instanceof Error ? error.message : fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function hasNoResponse(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response === undefined;
}

export function persistedOrderId(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as { orderId?: unknown } | undefined;

  return typeof data?.orderId === "string" ? data.orderId : null;
}
