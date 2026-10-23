import { api } from "@/lib/api";
import type { CheckoutNetwork } from "../types/quote";

export async function getNetworks(): Promise<CheckoutNetwork[]> {
  const response = await api.get<CheckoutNetwork[]>("/networks");

  return response.data;
}
