import type { NFT, NftNetwork } from "@/features/catalog/types/nft";

const art = {
  emerald: "/img/nfts/NFT%20Artwork%2003.png",
  emeraldScout: "/img/nfts/NFT%20Auth%20Artwork%209.png",
  emeraldHero: "/img/nfts/hero-emerald-ape.png",
  sage: "/img/nfts/NFT%20Artwork%2004.png",
  cosmic: "/img/nfts/NFT%20Artwork%2006.png",
  violet: "/img/nfts/NFT%20Artwork%2007.png",
  lilac: "/img/nfts/NFT%20Auth%20Artwork%206.png",
  neon: "/img/nfts/NFT%20Artwork%2005.png",
  ivory: "/img/nfts/NFT%20Artwork%2008.png",
  golden: "/img/nfts/NFT%20Artwork%2009.png",
  goldenFrequency: "/img/nfts/NFT%20Artwork%2011.png",
  goldenSignal: "/img/nfts/NFT%20Auth%20Artwork%203.png",
};

interface Series {
  images: string[];
  traits: string[];
  creator: string;
}

const series: Series[] = [
  {
    images: [art.emerald, art.emeraldHero, art.emeraldScout],
    traits: ["Óculos", "Esmeralda", "Jaqueta verde"],
    creator: "Nova Sato",
  },
  {
    images: [art.sage, art.cosmic, art.violet, art.lilac],
    traits: ["Chapéu bucket", "Moletom lilás"],
    creator: "Lia Monteiro",
  },
  {
    images: [art.neon, art.ivory],
    traits: ["Terno marfim", "Gola alta"],
    creator: "Teo Almeida",
  },
  {
    images: [art.golden, art.goldenFrequency, art.goldenSignal],
    traits: ["Fones de ouvido", "Pelagem dourada"],
    creator: "Mara Lins",
  },
];

function seriesOf(image: string): Series {
  return (
    series.find((item) => item.images.includes(image)) ?? {
      images: [image],
      traits: [],
      creator: "Kurio Studio",
    }
  );
}

function tokenIdOf(name: string): string {
  const number = /#(\d+)/.exec(name)?.[1] ?? "0";

  return `#${number.padStart(4, "0")}`;
}

type Extra = Partial<Pick<NFT, "oldPrice" | "tags" | "rarity" | "featured">>;

function define(
  id: string,
  name: string,
  price: string,
  collection: string,
  network: NftNetwork,
  available: number,
  edition: string,
  image: string,
  listedAt: string,
  extra: Extra = {},
): NFT {
  const origin = seriesOf(image);

  return {
    id,
    name,
    price,
    currency: "ETH",
    available,
    edition,
    collection,
    network,
    image,
    gallery: [image, ...origin.images.filter((item) => item !== image)],
    tokenId: tokenIdOf(name),
    attributes: extra.rarity
      ? [...origin.traits, extra.rarity]
      : origin.traits,
    creator: origin.creator,
    listedAt: `${listedAt}T12:00:00.000Z`,
    ...extra,
  };
}

export const nfts: NFT[] = [
  define("1", "Emerald Ape #042", "1.19", "Arte digital", "ethereum", 5, "Genesis", art.emerald, "2026-10-20", { tags: ["new", "trending"] }),
  define("2", "Sage Nomad #009", "1.69", "Colecionáveis", "polygon", 3, "1/10", art.sage, "2026-10-19", { tags: ["new"] }),
  define("3", "Neon Vessel #552", "1.99", "Arte 3D", "ethereum", 2, "1/10", art.neon, "2026-10-18", { oldPrice: "2.29", rarity: "Raro", tags: ["trending"] }),
  define("4", "Cosmic Bloom #118", "1.29", "Generativa", "solana", 8, "1/50", art.cosmic, "2026-10-17", { tags: ["new"], featured: true }),
  define("5", "Violet Nomad #314", "1.39", "Fotografia", "ethereum", 6, "1/10", art.violet, "2026-10-16"),
  define("6", "Ivory Baron #088", "1.79", "Assinaturas", "polygon", 4, "1/10", art.ivory, "2026-10-15", { tags: ["trending"] }),
  define("7", "Golden Beat #207", "0.99", "Música", "solana", 12, "1/50", art.golden, "2026-10-14", { tags: ["new"] }),
  define("8", "Golden Frequency #071", "0.59", "Música", "ethereum", 15, "1/50", art.goldenFrequency, "2026-10-13"),
  define("9", "Golden Signal #160", "0.39", "Música", "polygon", 20, "Aberta", art.goldenSignal, "2026-10-12", { tags: ["trending"] }),
  define("10", "Jade Scholar #301", "2.49", "Arte digital", "ethereum", 12, "1/50", art.emeraldScout, "2026-10-11"),
  define("11", "Lilac Drift #027", "0.89", "Generativa", "solana", 7, "1/10", art.lilac, "2026-10-10", { tags: ["new"] }),
  define("12", "Pearl Sentinel #140", "3.10", "Arte 3D", "polygon", 1, "1/1", art.neon, "2026-10-09", { rarity: "Raro" }),
  define("13", "Moss Wanderer #512", "0.45", "Colecionáveis", "ethereum", 20, "Aberta", art.sage, "2026-10-08"),
  define("14", "Onyx Curator #001", "12.30", "Assinaturas", "ethereum", 1, "1/1", art.ivory, "2026-10-07", { rarity: "Raro", tags: ["trending"] }),
  define("15", "Citrus Pulse #219", "0.74", "Música", "solana", 15, "1/50", art.golden, "2026-10-06"),
  define("16", "Verdant Pilot #066", "1.05", "Jogos", "polygon", 9, "1/10", art.emerald, "2026-10-05", { tags: ["new"] }),
  define("17", "Amber Echo #004", "0.68", "Música", "ethereum", 11, "1/50", art.goldenFrequency, "2026-10-04"),
  define("18", "Dusk Nomad #330", "1.15", "Fotografia", "solana", 6, "1/10", art.cosmic, "2026-10-03"),
  define("19", "Golden Spark #013", "0.02", "Utilidade", "polygon", 40, "Aberta", art.goldenSignal, "2026-10-02"),
  define("20", "Ivory Oracle #777", "4.20", "Assinaturas", "ethereum", 3, "1/10", art.neon, "2026-10-01", { tags: ["trending"] }),
  define("21", "Emerald Scout #108", "0.95", "Jogos", "solana", 8, "1/50", art.emeraldHero, "2026-09-30", { oldPrice: "1.25" }),
  define("22", "Violet Monk #202", "0.52", "Colecionáveis", "ethereum", 18, "Aberta", art.violet, "2026-09-29"),
  define("23", "Neon Pilot #611", "2.05", "Arte 3D", "polygon", 4, "1/10", art.ivory, "2026-09-28", { tags: ["new"] }),
  define("24", "Golden Mirage #345", "0.33", "Música", "solana", 25, "Aberta", art.golden, "2026-09-27"),
  define("25", "Cosmic Tide #091", "1.48", "Generativa", "ethereum", 5, "1/10", art.lilac, "2026-09-26"),
  define("26", "Jade Cartographer #410", "2.75", "Fotografia", "polygon", 2, "1/10", art.emeraldScout, "2026-09-25", { rarity: "Raro" }),
  define("27", "Lilac Signal #058", "0.61", "Utilidade", "ethereum", 30, "Aberta", art.sage, "2026-09-24"),
  define("28", "Pearl Composer #233", "1.90", "Música", "solana", 6, "1/10", art.neon, "2026-09-23", { oldPrice: "2.10" }),
  define("29", "Moss Archivist #129", "0.81", "Arte digital", "polygon", 10, "1/50", art.cosmic, "2026-09-22"),
  define("30", "Amber Relay #506", "0.27", "Utilidade", "ethereum", 35, "Aberta", art.goldenFrequency, "2026-09-21"),
  define("31", "Verdant Keeper #074", "3.60", "Arte 3D", "solana", 2, "1/10", art.emerald, "2026-09-20", { tags: ["trending"] }),
  define("32", "Onyx Courier #018", "1.33", "Jogos", "ethereum", 7, "1/10", art.ivory, "2026-09-19"),
  define("33", "Citrus Nomad #289", "0.47", "Colecionáveis", "polygon", 14, "1/50", art.goldenSignal, "2026-09-18", { tags: ["new"] }),
  define("34", "Dusk Sentinel #152", "5.80", "Assinaturas", "solana", 1, "1/1", art.violet, "2026-09-17", { rarity: "Raro" }),
  define("35", "Emerald Herald #390", "0.99", "Arte digital", "ethereum", 9, "1/50", art.emeraldHero, "2026-09-16"),
  define("36", "Golden Drift #622", "0.15", "Utilidade", "polygon", 50, "Aberta", art.golden, "2026-09-15"),
];
