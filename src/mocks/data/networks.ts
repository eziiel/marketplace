export interface MockNetwork {
  id: string;
  label: string;
  fee: string;
  refuses: boolean;
}

export const networks: MockNetwork[] = [
  { id: "ethereum", label: "Ethereum", fee: "0.0021", refuses: false },
  { id: "polygon", label: "Polygon", fee: "0.0007", refuses: false },
  {
    id: "testnet-refuse",
    label: "Testnet (simula recusa de pagamento)",
    fee: "0.0001",
    refuses: true,
  },
];
