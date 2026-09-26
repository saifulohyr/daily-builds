import assert from 'node:assert/strict';
import { inspectQuery } from './query-inspector.ts';

assert.deepEqual(inspectQuery('https://app.test/search?q=hello+world&page=2&q=again#top'), [
  { key: 'page', value: '2', count: 1 },
  { key: 'q', value: 'hello world, again', count: 2 },
]);
assert.deepEqual(inspectQuery('?empty=&flag'), [
  { key: 'empty', value: '', count: 1 },
  { key: 'flag', value: '', count: 1 },
]);
console.log('query-inspector: 2 tests passed');
