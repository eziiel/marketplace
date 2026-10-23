import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Download,
  Heart,
  LogOut,
  MapPin,
  ShoppingBag,
  User,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type ProfileSection = "profile" | "wallets";

interface AvailableItem {
  label: string;
  icon: LucideIcon;
  section: ProfileSection;
  to: "/profile" | "/profile/wallets";
}

interface UnavailableItem {
  label: string;
  icon: LucideIcon;
}

const AVAILABLE: AvailableItem[] = [
  { label: "Dados do perfil", icon: User, section: "profile", to: "/profile" },
  {
    label: "Carteiras",
    icon: MapPin,
    section: "wallets",
    to: "/profile/wallets",
  },
];

const UNAVAILABLE: UnavailableItem[] = [
  { label: "Atividade", icon: ShoppingBag },
  { label: "Lista de interesse", icon: Heart },
  { label: "Ofertas", icon: BadgeCheck },
  { label: "Arquivos baixados", icon: Download },
  { label: "Suporte", icon: AlertTriangle },
];

const rowClass =
  "relative flex h-[45px] items-center gap-3 px-4 text-[15px] whitespace-nowrap lg:pr-4 lg:pl-7";

const activeMarkerClass =
  "absolute right-2 bottom-0 left-2 h-[3px] rounded-t bg-primary lg:top-1 lg:right-auto lg:bottom-1 lg:left-0 lg:h-auto lg:w-[3px] lg:rounded-r";

export function ProfileSidebar({
  active,
  onLogout,
}: {
  active: ProfileSection;
  onLogout: () => void;
}) {
  return (
    <nav
      aria-label="Navegação do perfil"
      className="h-fit w-full rounded-[4px] bg-card lg:w-[310px] lg:shrink-0 lg:py-5"
    >
      <h2 className="m-0 hidden px-7 pb-4 text-base font-bold text-foreground lg:block">
        Meu perfil
      </h2>

      <ul className="scrollbar-none m-0 flex list-none overflow-x-auto p-0 lg:block lg:overflow-visible">
        {AVAILABLE.map((item) => {
          const selected = item.section === active;
          const Icon = item.icon;

          return (
            <li key={item.label}>
              <Link
                to={item.to}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  rowClass,
                  "transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
                  selected
                    ? "text-highlight"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected && <span aria-hidden className={activeMarkerClass} />}
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}

        {UNAVAILABLE.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.label} className="hidden lg:block">
              <span
                aria-disabled="true"
                className={cn(rowClass, "text-muted-foreground/60")}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {item.label}
                <span className="sr-only"> (indisponível nesta entrega)</span>
              </span>
            </li>
          );
        })}

        <li className="ml-auto border-l border-border lg:mt-2 lg:ml-0 lg:border-t lg:border-l-0 lg:pt-2">
          <button
            type="button"
            onClick={onLogout}
            className={cn(
              rowClass,
              "w-full text-highlight transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary",
            )}
          >
            <LogOut className="size-[18px] shrink-0" aria-hidden />
            Sair
          </button>
        </li>
      </ul>
    </nav>
  );
}
