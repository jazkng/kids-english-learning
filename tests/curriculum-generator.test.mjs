import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const withCopy = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'kids-curriculum-'));
  try { cpSync(new URL('content', root), join(dir, 'content'), { recursive: true }); fn(dir); }
  finally { rmSync(dir, { recursive: true, force: true }); }
};
const generate = (dir) => spawnSync(process.execPath, [join(dir, 'content/scripts/curriculum-v1.mjs')], { encoding: 'utf8' });
const snapshot = (dir) => Object.fromEntries(readdirSync(join(dir, 'content'), { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile()).map((entry) => {
    const path = join(entry.parentPath, entry.name);
    return [path, readFileSync(path).toString('base64')];
  }));
const changeJson = (path, fn) => { const data = JSON.parse(readFileSync(path)); fn(data); writeFileSync(path, JSON.stringify(data)); };

test('the complete draft curriculum generator is idempotent', () => withCopy((dir) => {
  assert.equal(generate(dir).status, 0);
  const before = snapshot(dir);
  assert.equal(generate(dir).status, 0);
  assert.deepEqual(snapshot(dir), before);
}));

test('protected lesson conflicts abort before writing any other planned lesson or line', () => withCopy((dir) => {
  changeJson(join(dir, 'content/lessons/abc.letter-a.json'), (lesson) => {
    lesson.status = 'approved'; lesson.title = 'Reviewed title';
  });
  const before = snapshot(dir);
  const result = generate(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lesson abc.letter-a/);
  assert.deepEqual(snapshot(dir), before);
}));

test('reviewed lines and recorded metadata without a file cannot be silently overwritten', () => {
  for (const patch of [{ status: 'reviewed' }, { durationMs: 1000 }]) withCopy((dir) => {
    changeJson(join(dir, 'content/audio/manifest.json'), (manifest) => {
      Object.assign(manifest.entries.find((line) => line.id === 'abc.letter-a.teach'), patch, { text: 'Reviewed spoken text.' });
    });
    const before = snapshot(dir);
    const result = generate(dir);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /audio abc.letter-a.teach/);
    assert.deepEqual(snapshot(dir), before);
  });
});

test('unchanged approved curriculum is preserved without downgrading its status', () => withCopy((dir) => {
  changeJson(join(dir, 'content/lessons/abc.letter-a.json'), (lesson) => { lesson.status = 'approved'; });
  const protectedBytes = readFileSync(join(dir, 'content/lessons/abc.letter-a.json'));
  assert.equal(generate(dir).status, 0);
  assert.deepEqual(readFileSync(join(dir, 'content/lessons/abc.letter-a.json')), protectedBytes);
}));

test('approved lessons also protect their referenced draft scripts from silent changes', () => withCopy((dir) => {
  changeJson(join(dir, 'content/lessons/abc.letter-a.json'), (lesson) => { lesson.status = 'approved'; });
  changeJson(join(dir, 'content/audio/manifest.json'), (manifest) => {
    manifest.entries.find((line) => line.id === 'abc.letter-a.teach').text = 'A reviewed lesson script.';
  });
  const before = snapshot(dir);
  const result = generate(dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /audio abc.letter-a.teach/);
  assert.deepEqual(snapshot(dir), before);
}));
