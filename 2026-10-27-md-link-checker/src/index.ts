import fs from "node:fs";

export interface MarkdownLink {
  text: string;
  url: string;
  line: number;
}

export interface CheckResult extends MarkdownLink {
  ok: boolean;
  status: number | string;
  error?: string;
}

// ponytail: regex matches inline [text](url) and autolinks <url>; upgrade to AST (remark/micromark) if reference links or nested markdown links are required.
export function extractLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  const lines = markdown.split(/\r?\n/);
  const inlineRegex = /!?\[([^\]]*)\]\((https?:\/\/[^\s\)]+)\)/g;
  const autoRegex = /<(https?:\/\/[^\s>]+)>/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    let match: RegExpExecArray | null;

    while ((match = inlineRegex.exec(line)) !== null) {
      links.push({ text: match[1], url: match[2], line: lineNum });
    }
    while ((match = autoRegex.exec(line)) !== null) {
      links.push({ text: match[1], url: match[1], line: lineNum });
    }
  }
  return links;
}

// ponytail: simple HEAD with GET fallback; upgrade to concurrency queue (p-limit) when scanning huge files with thousands of links.
export async function checkUrl(
  url: string,
  timeoutMs: number = 5000
): Promise<{ ok: boolean; status: number | string; error?: string }> {
  const headers = { "User-Agent": "md-link-checker/0.1" };
  try {
    let res = await fetch(url, { method: "HEAD", headers, signal: AbortSignal.timeout(timeoutMs) });
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: "GET", headers, signal: AbortSignal.timeout(timeoutMs) });
    }
    return { ok: res.ok, status: res.status };
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError";
    return { ok: false, status: "ERR", error: isTimeout ? "timeout" : (err?.message || "network error") };
  }
}

export async function checkFile(filePath: string): Promise<CheckResult[]> {
  const content = await fs.promises.readFile(filePath, "utf-8");
  const links = extractLinks(content);
  return Promise.all(
    links.map(async (link) => {
      const res = await checkUrl(link.url);
      return { ...link, ...res };
    })
  );
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0 || argv.includes("-h") || argv.includes("--help")) {
    console.log("Usage: md-link-checker <file.md> [file2.md ...]");
    return argv.length === 0 ? 1 : 0;
  }

  let hasErrors = false;
  for (const file of argv) {
    console.log(`Checking ${file}...`);
    try {
      const results = await checkFile(file);
      if (results.length === 0) {
        console.log("  No HTTP/HTTPS links found.");
        continue;
      }
      for (const r of results) {
        const tag = r.ok ? "OK" : "FAIL";
        const detail = r.error ? ` (${r.error})` : "";
        console.log(`  [${r.status} ${tag}] line ${r.line}: ${r.url}${detail}`);
        if (!r.ok) hasErrors = true;
      }
    } catch (err: any) {
      console.error(`  Error reading ${file}: ${err.message}`);
      hasErrors = true;
    }
  }

  return hasErrors ? 1 : 0;
}

if (process.argv[1] && (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js"))) {
  main().then((code) => {
    if (code !== 0) process.exit(code);
  });
}
