import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/nfts", () => {
    return HttpResponse.json([
      {
        id: "1",
        name: "Genesis NFT",
        price: 0.5,
        currency: "ETH",
      },
      {
        id: "2",
        name: "Cyber Ape",
        price: 1.2,
        currency: "ETH",
      },
    ]);
  }),
];