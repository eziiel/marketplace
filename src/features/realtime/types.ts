export interface NftUpdatedEvent {
  id: string;
  version: number;
  price: string;
  available: number;
}

export interface OrderUpdatedEvent {
  id: string;
  version: number;
  status: string;
}
