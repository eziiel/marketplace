import type { AddressFormat } from "@/features/wallets/lib/address";

export interface MockNetwork {
  id: string;
  label: string;
  fee: string;
  addressFormat: AddressFormat;
}

export const networks: MockNetwork[] = [
  { id: "ethereum", label: "Ethereum", fee: "0.0021", addressFormat: "evm" },
  { id: "polygon", label: "Polygon", fee: "0.0007", addressFormat: "evm" },
  {
    id: "sepolia",
    label: "Sepolia (testnet)",
    fee: "0.0001",
    addressFormat: "evm",
  },
  { id: "solana", label: "Solana", fee: "0.0003", addressFormat: "solana" },
];
