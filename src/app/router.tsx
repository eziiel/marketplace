import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { SignupPage } from "@/features/auth/pages/signup-page";

import { CatalogPage } from "@/features/catalog/pages/catalog-page";
import { NftDetailsPage } from "@/features/catalog/pages/nft-details-page";
import type { NftListParams } from "@/features/catalog/types/nft";
import { CartPage } from "@/features/cart/pages/cart-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { CheckoutPage } from "@/features/checkout/pages/checkout-page";
import { ConfirmationPage } from "@/features/checkout/pages/confirmation-page";
import { getAuthToken } from "@/features/auth/lib/auth-token";

function requireAuth() {
  if (!getAuthToken()) {
    throw redirect({ to: "/login" });
  }
}
const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
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

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  beforeLoad: requireAuth,
  component: CheckoutPage,
});

const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/$orderId",
  beforeLoad: requireAuth,
  component: ConfirmationPage,
});

const routeTree = rootRoute.addChildren([
  catalogRoute,
  nftDetailsRoute,
  cartRoute,
  loginRoute,
  signupRoute,
  checkoutRoute,
  confirmationRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
