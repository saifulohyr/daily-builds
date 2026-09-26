# Query Inspector

Tiny TypeScript CLI. Parses URL query strings, groups duplicate keys, decodes values, and prints sorted rows.

## Run

Requires Node.js 24+.

```sh
node query-inspector.ts 'https://app.test/search?q=hello+world&page=2&q=again'
```

## Validate

```sh
node test.mjs
```
