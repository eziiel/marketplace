const ARTWORKS = [
  "/img/nfts/NFT Artwork 03.png",
  "/img/nfts/NFT Artwork 06.png",
  "/img/nfts/NFT Artwork 05.png",
  "/img/nfts/NFT Artwork 04.png",
  "/img/nfts/NFT Artwork 07.png",
  "/img/nfts/NFT Artwork 08.png",
  "/img/nfts/NFT Artwork 09.png",
  "/img/nfts/NFT Artwork 11.png",
];

const EXPLICIT: Record<string, string> = {
  "1": "/img/nfts/NFT Artwork 03.png",
  "2": "/img/nfts/NFT Artwork 06.png",
  "3": "/img/nfts/NFT Artwork 03.png",
  "4": "/img/nfts/NFT Artwork 04.png",
  "5": "/img/nfts/NFT Artwork 05.png",
  "6": "/img/nfts/NFT Artwork 07.png",
  "7": "/img/nfts/NFT Artwork 06.png",
  "8": "/img/nfts/NFT Artwork 08.png",
  "9": "/img/nfts/NFT Artwork 09.png",
};

function hashIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

export function nftImage(id: string): string {
  const path = EXPLICIT[id] ?? ARTWORKS[hashIndex(id, ARTWORKS.length)];
  return encodeURI(path);
}

export const heroImage = "/img/nfts/hero-emerald-ape.png";
export const authImage = encodeURI("/img/nfts/NFT Auth Artwork 9.png");
export const promoImages = {
  genesis: encodeURI("/img/nfts/NFT Artwork 03.png"),
  curated: encodeURI("/img/nfts/NFT Artwork 05.png"),
};
export const blogImages = [
  encodeURI("/img/nfts/NFT Artwork 08.png"),
  encodeURI("/img/nfts/NFT Artwork 03.png"),
  encodeURI("/img/nfts/NFT Artwork 04.png"),
  encodeURI("/img/nfts/NFT Artwork 11.png"),
];
