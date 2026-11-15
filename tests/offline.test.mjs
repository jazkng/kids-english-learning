import test from 'node:test';
import assert from 'node:assert/strict';
import { isOfflinePackageCached } from '../src/services/offline.ts';

const base = 'https://example.test/learning/';
const index = {
  schemaVersion: 1,
  resources: [
    { url: 'index.html', revision: 'current' },
    { url: 'assets/app-hashed.js', revision: null },
    { url: 'audio/hello.mp3', revision: 'voice-current' },
  ],
};
const exactUrls = [
  `${base}index.html?__WB_REVISION__=current`,
  `${base}assets/app-hashed.js`,
  `${base}audio/hello.mp3?__WB_REVISION__=voice-current`,
];
const cache = (urls) => async (url) => urls.includes(url) ? { ok: true } : undefined;

test('all exact package revisions, including audio, are required for offline readiness', async () => {
  assert.equal(await isOfflinePackageCached(index, base, cache(exactUrls)), true);
  assert.equal(await isOfflinePackageCached(index, base, cache(exactUrls.slice(0, 2))), false);
});

test('a stale HTML or audio revision cannot make an incomplete current package look ready', async () => {
  assert.equal(await isOfflinePackageCached(index, base, cache(exactUrls.map((s) => s.replace('=current', '=old')))), false);
  assert.equal(await isOfflinePackageCached(index, base, cache(exactUrls.map((s) => s.replace('=voice-current', '=voice-old')))), false);
});

test('a controller with evicted cache files is not an offline guarantee', async () => {
  assert.equal(await isOfflinePackageCached(index, base, cache([])), false);
});

test('damaged indexes, empty packages, failed responses and storage denial stay unconfirmed', async () => {
  for (const value of [null, {}, { schemaVersion: 1, resources: [] }, { ...index, resources: [{ url: 'index.html' }] }]) {
    assert.equal(await isOfflinePackageCached(value, base, cache(exactUrls)), false);
  }
  assert.equal(await isOfflinePackageCached(index, base, async () => ({ ok: false })), false);
  assert.equal(await isOfflinePackageCached(index, base, async () => { throw new Error('denied'); }), false);
});

test('unrelated origins and paths outside a subdirectory app are rejected', async () => {
  for (const url of ['https://other.test/index.html', '../outside.html', '/outside.html', 'index.html?old=1']) {
    assert.equal(await isOfflinePackageCached({ ...index, resources: [{ url, revision: null }] }, base, async () => ({ ok: true })), false);
  }
});
