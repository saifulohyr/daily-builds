# md-link-checker

CLI tool that scans Markdown files for broken HTTP/HTTPS links and reports HTTP status codes.

## Features

- Extracts inline links `[text](https://...)` and autolinks `<https://...>`
- Validates URLs using HTTP `HEAD` with fallback to `GET` on 405/403
- Reports status code, line number, and error details
- Native Node.js `fetch` — zero external runtime dependencies

## Stack

- TypeScript
- Node.js (native `fetch`, `node:test`)
- `tsx` (dev runner)

## CLI Usage

```bash
# Check single file
npx tsx src/index.ts README.md

# Check multiple files
npx tsx src/index.ts doc1.md doc2.md

# Via npm script
npm run check
```

### Sample Output

```text
Checking README.md...
  [200 OK] line 4: https://example.com
  [404 FAIL] line 12: https://example.com/broken-page
  [ERR FAIL] line 18: https://invalid-domain.xyz (network error)
```

Exit code: `0` if all links are valid, `1` if any link fails or file cannot be read.

## Programmatic API

```typescript
import { extractLinks, checkUrl, checkFile } from "./src/index.js";

// Extract links with line numbers
const links = extractLinks("[Example](https://example.com)");
// => [{ text: "Example", url: "https://example.com", line: 1 }]

// Check single URL
const result = await checkUrl("https://example.com");
// => { ok: true, status: 200 }

// Check file
const results = await checkFile("README.md");
```

## Running Tests

```bash
npx tsx test/index.test.ts
```
