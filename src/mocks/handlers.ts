import { http, HttpResponse } from "msw";
import type { NftListResponse } from "@/features/catalog/types/nft";
import { nfts } from "./data/nfts";

export const handlers = [
  http.get("/api/nfts", ({ request }) => {
    const url = new URL(request.url);

    const search = url.searchParams.get("search")?.toLowerCase();
    const sort = url.searchParams.get("sort");
    const pageParam = Number(url.searchParams.get("page") ?? 1);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

    const pageSize = 10;

    let filteredNfts = [...nfts];

    if (search) {
      filteredNfts = filteredNfts.filter((nft) =>
        nft.name.toLowerCase().includes(search),
      );
    }

    if (sort === "price_asc") {
      filteredNfts.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sort === "price_desc") {
      filteredNfts.sort((a, b) => Number(b.price) - Number(a.price));
    }

    const total = filteredNfts.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;

    const response: NftListResponse = {
      items: filteredNfts.slice(start, start + pageSize),
      page,
      total,
      totalPages,
    };

    return HttpResponse.json(response);
  }),
];
