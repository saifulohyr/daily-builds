export type QueryEntry = { key: string; value: string; count: number };

export function inspectQuery(input: string): QueryEntry[] {
  const query = input.includes('?') ? input.slice(input.indexOf('?') + 1).split('#', 1)[0] : input.replace(/^\\?/, '').split('#', 1)[0];
  const values = new Map<string, string[]>();
  for (const [key, value] of new URLSearchParams(query)) values.set(key, [...(values.get(key) ?? []), value]);
  return [...values].sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => ({ key, value: items.join(', '), count: items.length }));
}

if (process.argv[1]?.endsWith('query-inspector.ts')) {
  const input = process.argv[2];
  if (!input) { console.error('Usage: node query-inspector.ts <URL-or-query>'); process.exitCode = 1; }
  else console.table(inspectQuery(input));
}
