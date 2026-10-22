import axios from "axios";
import { getSessionId } from "./session";

export const api = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers.set("X-Session-Id", getSessionId());

  return config;
});
