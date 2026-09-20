export type QueryValue = string | number | boolean | null | undefined;

/** Encode deterministic, URL-safe UI state. */
export function toQuery(params: Record<string, QueryValue>): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => [key, String(value)] as const);
  return new URLSearchParams(entries).toString();
}

export function fromQuery(search: string): Record<string, string> {
  const query = search.startsWith("?") ? search.slice(1) : search;
  return Object.fromEntries(new URLSearchParams(query));
}

export function updateQuery(search: string, changes: Record<string, QueryValue>): string {
  return toQuery({ ...fromQuery(search), ...changes });
}
