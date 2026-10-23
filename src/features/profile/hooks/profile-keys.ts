export function profileKey(token: string | null) {
  return ["profile", token] as const;
}
