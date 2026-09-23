# Markdown TOC Generator

Tiny TypeScript CLI that reads Markdown and prints a GitHub-style table of contents.

## Features

- Parses ATX headings (`#` through `######`).
- Skips fenced code blocks.
- Adds suffixes for repeated headings.
- Limits depth with optional `maxDepth`.

## Run

```bash
npm install
npm run toc -- README.md 3
```

## Validate

```bash
npm test
```
