import { readFileSync } from 'node:fs';

export type TocItem = {
  depth: number;
  text: string;
  slug: string;
};

const headingPattern = /^(#{1,6})\s+(.+?)\s*#*\s*$/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractToc(markdown: string, maxDepth = 3): TocItem[] {
  const seen = new Map<string, number>();
  let inFence = false;

  return markdown.split(/\r?\n/).flatMap((line) => {
    if (line.trim().startsWith('```')) inFence = !inFence;
    if (inFence) return [];

    const match = line.match(headingPattern);
    if (!match) return [];

    const depth = match[1].length;
    if (depth > maxDepth) return [];

    const text = match[2].trim();
    const baseSlug = slugify(text);
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);

    return [{ depth, text, slug: count ? `${baseSlug}-${count}` : baseSlug }];
  });
}

export function renderToc(items: TocItem[]): string {
  return items
    .map((item) => `${'  '.repeat(item.depth - 1)}- [${item.text}](#${item.slug})`)
    .join('\n');
}

if (require.main === module) {
  const [file, depth] = process.argv.slice(2);
  if (!file) {
    console.error('Usage: npm run toc -- <README.md> [maxDepth]');
    process.exit(1);
  }

  const maxDepth = depth ? Number(depth) : 3;
  if (!Number.isInteger(maxDepth) || maxDepth < 1 || maxDepth > 6) {
    console.error('maxDepth must be an integer from 1 to 6');
    process.exit(1);
  }

  const markdown = readFileSync(file, 'utf8');
  console.log(renderToc(extractToc(markdown, maxDepth)));
}
