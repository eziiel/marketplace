import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { blogImages } from "../lib/nft-image";

interface Post {
  date: string;
  readingTime: string;
  title: string;
  excerpt: string;
  image: string;
}

const posts: Post[] = [
  {
    date: "12 de setembro",
    readingTime: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    excerpt: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: blogImages[0],
  },
  {
    date: "13 de setembro",
    readingTime: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    excerpt: "Conheça criadores que moldam a cultura digital.",
    image: blogImages[1],
  },
  {
    date: "15 de setembro",
    readingTime: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    excerpt:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: blogImages[2],
  },
  {
    date: "15 de setembro",
    readingTime: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    excerpt: "Proteja sua carteira, seus ativos e sua identidade.",
    image: blogImages[3],
  },
];

export function BlogHighlights({ className }: { className?: string }) {
  return (
    <section
      id="aprenda"
      aria-labelledby="blog-title"
      className={cn("scroll-mt-20", className)}
    >
      <div className="text-center">
        <h2
          id="blog-title"
          className="m-0 text-2xl font-bold text-foreground md:text-3xl"
        >
          Diário da Cunhagem
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </div>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-sidebar">
              <img
                src={post.image}
                alt=""
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs text-primary/80">
                  {post.date}
                  <span aria-hidden className="mx-2">
                    |
                  </span>
                  {post.readingTime}
                </p>
                <h3 className="m-0 text-base leading-snug font-bold text-foreground">
                  {post.title}
                </h3>
                <p className="text-xs leading-relaxed text-primary/80">
                  {post.excerpt}
                </p>
                <button
                  type="button"
                  aria-disabled="true"
                  title="Em breve"
                  className="mt-auto inline-flex w-fit cursor-not-allowed items-center gap-1 pt-1 text-xs font-semibold text-primary"
                >
                  Ler mais
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
