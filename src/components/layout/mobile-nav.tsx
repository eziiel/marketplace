import { Link } from "@tanstack/react-router";
import { Home, Heart, Compass, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  cartCount?: number;
  className?: string;
}

const itemClass =
  "flex flex-1 flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none";

export function MobileNav({ cartCount = 0, className }: MobileNavProps) {
  return (
    <nav
      aria-label="Navegação"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden",
        className,
      )}
    >
      <ul className="flex h-16 items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
        <li className="flex flex-1">
          <Link
            to="/"
            search={{ page: 1 }}
            aria-label="Início"
            className={itemClass}
          >
            <Home className="size-5" aria-hidden />
          </Link>
        </li>

        <li className="flex flex-1">
          <a href="/#favoritos" aria-label="Favoritos" className={itemClass}>
            <Heart className="size-5" aria-hidden />
          </a>
        </li>

        <li className="flex flex-1 items-start justify-center">
          <Link
            to="/"
            search={{ page: 1 }}
            aria-label="Explorar coleções"
            className="-mt-5 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/40 ring-4 ring-background transition-transform hover:scale-105 focus-visible:scale-105 focus-visible:outline-none"
          >
            <Compass className="size-6" aria-hidden />
          </Link>
        </li>

        <li className="flex flex-1">
          <Link
            to="/cart"
            aria-label={
              cartCount > 0 ? `Carrinho, ${cartCount} itens` : "Carrinho"
            }
            className={cn(itemClass, "relative")}
          >
            <span className="relative">
              <ShoppingCart className="size-5" aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
          </Link>
        </li>

        <li className="flex flex-1">
          <Link to="/login" aria-label="Perfil" className={itemClass}>
            <User className="size-5" aria-hidden />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
