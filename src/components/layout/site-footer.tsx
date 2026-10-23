import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Send } from "lucide-react";

import { Container } from "./container";
import { BrandIcon, type BrandName } from "@/components/icons/brand-icon";
import { cn } from "@/lib/utils";

interface Feature {
  letter: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    letter: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
];

type FooterRoute = "/profile" | "/profile/wallets";

interface FooterLink {
  label: string;
  to?: FooterRoute;
  collection?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const columns: FooterColumn[] = [
  {
    title: "Meu perfil",
    links: [
      { label: "Meu perfil", to: "/profile" },
      { label: "Minha coleção" },
      { label: "Atividade" },
      { label: "Estúdio do criador" },
      { label: "Lista de interesse" },
    ],
  },
  {
    title: "Central de ajuda",
    links: [
      { label: "Central de ajuda" },
      { label: "Como comprar NFTs" },
      { label: "Carteira e segurança", to: "/profile/wallets" },
      { label: "Política do mercado" },
      { label: "Denunciar item" },
    ],
  },
  {
    title: "Coleções",
    links: [
      { label: "Arte digital", collection: "Arte digital" },
      { label: "Fotografia", collection: "Fotografia" },
      { label: "Música", collection: "Música" },
      { label: "Arte 3D", collection: "Arte 3D" },
      { label: "Utilidade", collection: "Utilidade" },
    ],
  },
];

const socials: { label: string; href: string; name: BrandName }[] = [
  { label: "Facebook", href: "https://facebook.com", name: "facebook" },
  { label: "Instagram", href: "https://instagram.com", name: "instagram" },
  { label: "Twitter", href: "https://twitter.com", name: "twitter" },
  { label: "LinkedIn", href: "https://linkedin.com", name: "linkedin" },
  { label: "YouTube", href: "https://youtube.com", name: "youtube" },
];

const wallets = ["MetaMask", "WalletConnect", "Coinbase"];

const footerLinkClass =
  "text-sm text-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight";

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
    <div>
      <h3 className="m-0 text-base leading-tight font-bold text-foreground">
        Antecipe-se ao próximo lançamento
      </h3>
      <form onSubmit={handleSubmit} className="mt-4 flex">
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
          placeholder="digite seu e-mail..."
          className="h-10 w-full min-w-0 rounded-l-[4px] bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-highlight"
        />
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-r-[4px] bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-highlight"
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
      <p className="mt-4 text-xs leading-6 text-muted-foreground">
        Receba lançamentos selecionados, histórias de criadores e novidades do
        mercado.
      </p>
      <p aria-live="polite" className="mt-1 min-h-4 text-xs text-highlight">
        {sent && "Pronto! Você receberá os próximos lançamentos."}
      </p>
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("mt-20 text-sm md:mt-24", className)}>
      <Container>
        <div className="overflow-hidden rounded-t-[4px] bg-card">
          <div className="grid gap-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.15fr] lg:gap-0 lg:px-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={cn(
                  "lg:pr-8",
                  index > 0 && "lg:border-l lg:border-[#915e36] lg:pl-8",
                )}
              >
                <span
                  aria-hidden
                  className="grid size-[74px] place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground"
                >
                  {feature.letter}
                </span>
                <h3 className="m-0 mt-6 text-base font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 max-w-[230px] text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
            <div className="lg:border-l lg:border-[#915e36] lg:pl-8">
              <NewsletterForm />
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-[#38220f] px-6 py-7 text-sm text-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:px-8">
            <Link
              to="/"
              search={{ page: 1 }}
              className="font-bold tracking-[0.2em] transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight"
            >
              KURIO
            </Link>
            <span className="max-w-[230px] leading-6">
              Feito para colecionadores, criadores e cultura
            </span>
            <a
              href="mailto:contato@email.com"
              className="transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight"
            >
              contato@email.com
            </a>
            <a
              href="tel:+551140028922"
              className="transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-highlight"
            >
              +55 11 4002 8922
            </a>
          </div>

          <div className="grid gap-10 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="m-0 text-lg font-bold text-foreground">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.collection ? (
                        <Link
                          to="/"
                          search={{ page: 1, collection: link.collection }}
                          hash="catalogo"
                          className={footerLinkClass}
                        >
                          {link.label}
                        </Link>
                      ) : link.to ? (
                        <Link to={link.to} className={footerLinkClass}>
                          {link.label}
                        </Link>
                      ) : (
                        <span
                          aria-disabled="true"
                          className="text-sm text-muted-foreground/70"
                        >
                          {link.label}
                          <span className="sr-only">
                            {" "}
                            (indisponível nesta entrega)
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <h3 className="m-0 text-lg font-bold text-foreground">
                Redes sociais
              </h3>
              <ul className="mt-4 flex gap-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="grid size-8 place-items-center rounded-[4px] border border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-highlight"
                    >
                      <BrandIcon name={social.name} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>

              <h3 className="m-0 mt-8 text-lg font-bold text-foreground">
                Carteiras compatíveis
              </h3>
              <ul className="mt-3 inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-[3px] bg-[#38220f] px-2.5 py-1.5 text-[9px] font-bold tracking-wide text-primary uppercase">
                {wallets.map((wallet, index) => (
                  <li key={wallet} className="flex items-center gap-1.5">
                    {wallet}
                    {index < wallets.length - 1 && <span aria-hidden>·</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="py-6 pb-24 text-center text-sm text-foreground md:pb-6">
          © 2026 Kurio. Propriedade digital para todos.
        </p>
      </Container>
    </footer>
  );
}
