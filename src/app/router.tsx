import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { CatalogPage } from "@/features/catalog/pages/catalog-page";
import { NftDetailsPage } from "@/features/catalog/pages/nft-details-page";
import type { NftListParams } from "@/features/catalog/types/nft";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",

  validateSearch: (search: Record<string, unknown>): NftListParams => ({
    search: typeof search.search === "string" ? search.search : "",

    page:
      typeof search.page === "number" &&
      Number.isInteger(search.page) &&
      search.page > 0
        ? search.page
        : 1,

    sort:
      search.sort === "price_asc" || search.sort === "price_desc"
        ? search.sort
        : "price_asc",
  }),

  component: CatalogPage,
});

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nfts/$id",
  component: NftDetailsPage,
});

const routeTree = rootRoute.addChildren([catalogRoute, nftDetailsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
