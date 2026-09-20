# Query State Codec

Tiny dependency-free TypeScript helpers for URL query state in React, TanStack Router, or plain web apps.

- Deterministic key ordering for stable links and tests
- Omits `null`, `undefined`, and empty-string values
- Parses existing searches and applies updates without mutation

## Run validation

```sh
node --experimental-strip-types --test test/query-state.test.mjs
```

## Use

```ts
import { updateQuery } from "./src/query-state.ts";

const search = updateQuery("page=1&tag=ui", { page: 2, tag: null });
// page=2
```
