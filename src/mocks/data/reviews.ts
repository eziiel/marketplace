import type { NftReview, NftReviews } from "@/features/catalog/types/nft";

const AUTHORS = [
  "Mariana P.",
  "Diego R.",
  "Camila S.",
  "Rafael T.",
  "Bianca L.",
  "Felipe M.",
  "Júlia A.",
  "Thiago N.",
];

const COMMENTS = [
  "Os detalhes da arte em alta resolução superaram o que eu esperava.",
  "Chegou na carteira em segundos e a procedência está impecável.",
  "Cores e acabamento impressionantes, virou destaque da minha coleção.",
  "Gostei da edição limitada, mas esperava mais conteúdo desbloqueável.",
  "O criador responde a comunidade e lança novidades com frequência.",
  "Ótima peça para quem está começando a colecionar na rede.",
  "A arte é linda, só achei a taxa de rede um pouco alta no dia.",
  "Comprei duas edições e a transferência foi tranquila nas duas.",
];

const RATINGS = [5, 4, 5, 3, 4, 5, 4, 5, 4, 3, 5, 4];

function seedFor(nftId: string): number {
  let total = 0;

  for (let index = 0; index < nftId.length; index += 1) {
    total += nftId.charCodeAt(index);
  }

  return total * 31;
}

export function reviewsFor(nftId: string): NftReviews {
  const seed = seedFor(nftId);
  const count = 12 + (seed % 12);
  const base = Date.UTC(2026, 9, 20, 12);

  const items: NftReview[] = Array.from({ length: count }, (_, index) => ({
    id: `${nftId}-${index + 1}`,
    author: AUTHORS[(seed + index) % AUTHORS.length],
    rating: RATINGS[(seed + index) % RATINGS.length],
    comment: COMMENTS[(seed * 3 + index) % COMMENTS.length],
    createdAt: new Date(base - index * 3 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const total = items.reduce((sum, item) => sum + item.rating, 0);

  return {
    average: Math.round((total / count) * 10) / 10,
    count,
    items,
  };
}
