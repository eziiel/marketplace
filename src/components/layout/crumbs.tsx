import { Link } from "@tanstack/react-router";

const crumbLink =
  "transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-highlight";

export const crumbs = {
  home: (
    <Link to="/" search={{ page: 1 }} className={crumbLink}>
      Início
    </Link>
  ),
  market: (
    <Link to="/" search={{ page: 1 }} hash="catalogo" className={crumbLink}>
      Mercado
    </Link>
  ),
  cart: (
    <Link to="/cart" className={crumbLink}>
      Carrinho
    </Link>
  ),
};
