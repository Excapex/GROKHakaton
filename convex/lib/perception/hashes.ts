/** Browser stores raw hex; engine/CLI uses sha256:<hex>. */
export function normalizeHash(value: string): string {
  const text = value.trim();
  if (text.startsWith("sha256:")) return text;
  const hex = text.toLowerCase();
  if (hex.length === 64 && /^[0-9a-f]+$/.test(hex)) return `sha256:${hex}`;
  return text;
}

export function hashesDiffer(left: string, right: string): boolean {
  return normalizeHash(left) !== normalizeHash(right);
}
