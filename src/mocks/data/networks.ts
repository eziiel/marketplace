export interface MockNetwork {
  id: string;
  label: string;
  fee: string;
}

export const networks: MockNetwork[] = [
  { id: "ethereum", label: "Ethereum", fee: "0.0021" },
  { id: "polygon", label: "Polygon", fee: "0.0007" },
  { id: "sepolia", label: "Sepolia (testnet)", fee: "0.0001" },
];
