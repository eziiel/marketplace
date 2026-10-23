import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Crown, BellRing, Send, Check } from "lucide-react";

import { Container } from "./container";
import { cn } from "@/lib/utils";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <ShieldCheck aria-hidden className="size-5" />,
    title: "Segurança de carteira",
    description:
      "Proteja sua carteira e coleções com proteção digital verificada.",
  },
  {
    icon: <Crown aria-hidden className="size-5" />,
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e colecionáveis que estão definindo a cultura digital na rede.",
  },
  {
    icon: <BellRing aria-hidden className="size-5" />,
    title: "Alertas de lançamento",
    description:
      "Receba lembretes de drops, coleções e novidades do marketplace.",
  },
];

interface FooterColumn {
  title: string;
  links: string[];
}

const columns: FooterColumn[] = [
  {
    title: "Meu perfil",
    links: [
      "Meu perfil",
      "Minha coleção",
      "Atividade",
      "Favoritos",
      "Lista de interesses",
    ],
  },
  {
    title: "Central de ajuda",
    links: [
      "Central de ajuda",
      "Fale conosco",
      "Carteira e segurança",
      "Status da rede",
      "Denunciar item",
    ],
  },
  {
    title: "Coleções",
    links: ["Arte digital", "Fotografia", "Música", "Arte 3D", "Utilidade"],
  },
];

const socials = [
  {
    label: "X",
    href: "https://x.com",
    path: "M18.9 1.5h3.7l-8 9.1 9.4 12.4h-7.3l-5.8-7.5-6.6 7.5H.5l8.5-9.7L0 1.5h7.5l5.2 6.9ZM17.6 21.2h2L6.5 3.6h-2.1Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2Zm0 10.9a4.3 4.3 0 1 1 0-8.6 4.3 4.3 0 0 1 0 8.6Zm6.8-11.1a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.4 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.5ZM9.6 15.6V8.4l6.2 3.6Z",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3-1.8 0-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.4H3.5V9h3.6v11.4ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7c0-.9-.8-1.7-1.8-1.7Z",
  },
];

const wallets = ["MetaMask", "Coinbase", "WalletConnect"];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().length === 0) return;
    setSent(true);
    setEmail("");
  }

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <h3 className="m-0 text-sm font-semibold text-foreground">
        Antecipe-se ao próximo lançamento
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Receba lançamentos exclusivos, histórias de criadores e novidades do
        mercado.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Inscrever-se para novidades
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSent(false);
          }}
          placeholder="Seu melhor e-mail"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          {sent ? (
            <>
              <Check className="size-3.5" aria-hidden /> Enviado
            </>
          ) : (
            <>
              <Send className="size-3.5" aria-hidden /> Enviar
            </>
          )}
        </button>
      </form>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs text-primary">
        {sent && "Pronto! Você receberá os próximos lançamentos."}
      </p>
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mt-12 border-t border-border bg-sidebar/60 text-sm",
        className,
      )}
    >
      <Container className="py-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1.1fr]">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-3 rounded-2xl border border-border bg-card/40 p-4"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                {feature.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {feature.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
          <NewsletterForm />
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <span className="text-lg font-bold tracking-[0.2em] text-foreground">
              KURIO
            </span>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              Marketplace de NFTs para colecionadores, criadores e curiosos da
              cultura digital.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              contato@email.com
            </p>
            <p className="text-xs text-muted-foreground">+55 11 4002 8922</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
                {column.title}
              </p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      search={{ search: "", page: 1, sort: "price_asc" }}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Redes sociais
            </p>
            <ul className="mt-3 flex gap-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="grid size-8 place-items-center rounded-lg border border-border bg-card/40 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs font-semibold tracking-wide text-foreground uppercase">
              Carteiras compatíveis
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {wallets.map((wallet) => (
                <li
                  key={wallet}
                  className="rounded-md border border-border bg-card/40 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {wallet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-border py-5 pb-20 text-center text-xs text-muted-foreground md:pb-5">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  );
}
