import axios from "axios";
import { getSessionId } from "./session";
import { handleUnauthorized } from "./session-expiry";
import { getAuthToken } from "@/features/auth/lib/auth-token";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers.set("X-Session-Id", getSessionId());

  const token = getAuthToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      handleUnauthorized(error.config?.url);
    }

    return Promise.reject(error);
  },
);
