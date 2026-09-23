import { strict as assert } from 'node:assert';
import { extractToc, renderToc, slugify } from './src/toc';

const sample = `# Title

## Quick Start

\`\`\`
### Ignored
\`\`\`

### Install & Run!
#### Too Deep
## Quick Start
`;

assert.equal(slugify('Install & Run!'), 'install-run');
assert.deepEqual(extractToc(sample, 3), [
  { depth: 1, text: 'Title', slug: 'title' },
  { depth: 2, text: 'Quick Start', slug: 'quick-start' },
  { depth: 3, text: 'Install & Run!', slug: 'install-run' },
  { depth: 2, text: 'Quick Start', slug: 'quick-start-1' },
]);
assert.equal(
  renderToc(extractToc(sample, 2)),
  '- [Title](#title)\n  - [Quick Start](#quick-start)\n  - [Quick Start](#quick-start-1)',
);

console.log('ok');
