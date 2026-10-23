export const ENS_DOMAINS = [".eth", ".xyz", ".nft"] as const;

export type EnsDomain = (typeof ENS_DOMAINS)[number];
