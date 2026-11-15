import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertCompletePrecache, packageResources } from '../scripts/precache-policy.ts';

test('complete local app/media package is accepted while non-runtime files are ignored', () => {
  const root = mkdtempSync(join(tmpdir(), 'kel-precache-'));
  try {
    mkdirSync(join(root, 'audio'));
    for (const path of ['index.html', 'app.js', 'manifest.webmanifest', 'audio/red.mp3', 'notes.txt']) writeFileSync(join(root, path), 'fixture');
    const resources = packageResources(root);
    assert.deepEqual(resources.sort(), ['app.js', 'audio/red.mp3', 'index.html', 'manifest.webmanifest']);
    assert.doesNotThrow(() => assertCompletePrecache(resources.map((url) => ({ url })), resources));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('Workbox skipping a large narration file or app script fails rather than producing a partial offline package', () => {
  const root = mkdtempSync(join(tmpdir(), 'kel-precache-'));
  try {
    mkdirSync(join(root, 'audio'));
    writeFileSync(join(root, 'index.html'), 'fixture');
    writeFileSync(join(root, 'app.js'), 'fixture');
    writeFileSync(join(root, 'audio/teacher.mp3'), Buffer.alloc(2 * 1024 * 1024 + 1));
    const resources = packageResources(root);
    assert.throws(() => assertCompletePrecache([{ url: 'index.html' }, { url: 'app.js' }], resources), /audio\/teacher.mp3/);
    assert.throws(() => assertCompletePrecache([{ url: 'index.html' }, { url: 'audio/teacher.mp3' }], resources), /app.js/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
