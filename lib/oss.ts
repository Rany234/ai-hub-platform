export function buildObjectKey(parts: Array<string | number | undefined | null>) {
  return parts
    .filter((p): p is string | number => p !== undefined && p !== null)
    .map((p) => String(p).replace(/^\/+/, "").replace(/\/+$/, ""))
    .filter((p) => p.length > 0)
    .join("/");
}
