interface Post {
  date: string;
  reading: string;
  title: string;
  description: string;
  image: string;
}

const posts: Post[] = [
  {
    date: "12 de setembro",
    reading: "Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    description: "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: "/img/nfts/NFT%20Artwork%2005.png",
  },
  {
    date: "13 de setembro",
    reading: "Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    description: "Conheça criadores que moldam a cultura digital.",
    image: "/img/nfts/NFT%20Artwork%2003.png",
  },
  {
    date: "15 de setembro",
    reading: "Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: "/img/nfts/NFT%20Artwork%2004.png",
  },
  {
    date: "15 de setembro",
    reading: "Leitura de 2 min",
    title: "Como proteger sua carteira",
    description: "Proteja sua carteira, seus ativos e sua identidade.",
    image: "/img/nfts/NFT%20Artwork%2009.png",
  },
];

export function MintDiary() {
  return (
    <section
      id="aprenda"
      aria-labelledby="mint-diary-title"
      className="mt-20 scroll-mt-24 md:mt-24"
    >
      <h2
        id="mint-diary-title"
        className="m-0 text-center text-2xl font-bold text-foreground"
      >
        Diário da Cunhagem
      </h2>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Histórias, guias e insights para colecionadores sobre o universo da
        propriedade digital.
      </p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <li key={post.title}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl bg-card">
              <img
                src={post.image}
                alt=""
                width={268}
                height={195}
                className="aspect-[268/195] w-full object-cover"
              />
              <div className="flex flex-1 flex-col gap-2.5 p-4">
                <p className="text-[11px] text-muted-foreground">
                  {post.date} <span aria-hidden>|</span> {post.reading}
                </p>
                <h3 className="m-0 text-base leading-snug font-bold text-foreground">
                  {post.title}
                </h3>
                <p className="text-xs leading-5 text-muted-foreground">
                  {post.description}
                </p>
                <p className="mt-auto text-xs font-bold text-highlight">
                  Ler mais <span aria-hidden>→</span>
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
