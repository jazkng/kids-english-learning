import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { loadContent, validateContent } from '../scripts/validate-content.mjs';
const fresh = () => structuredClone(loadContent());
const sha = (value) => createHash('sha256').update(value).digest('hex');

test('draft integration fixtures validate without audio or network services', () => {
  assert.deepEqual(validateContent(fresh()), []);
});
test('missing and duplicate audio IDs cannot silently break playback', () => {
  const data = fresh();
  data.manifest.entries.push(data.manifest.entries[0]);
  data.lessons[0].steps[0].promptAudioId = 'unknown.audio';
  const result = validateContent(data).join('\n');
  assert.match(result, /Duplicate audio ID/);
  assert.match(result, /Unknown audio reference/);
});
test('choice answers and visual values must match their teaching target', () => {
  const data = fresh();
  data.lessons[0].steps[2].correctChoiceId = 'other';
  data.lessons[0].steps[0].visual.value = 'Z';
  const result = validateContent(data).join('\n');
  assert.match(result, /Invalid answer/);
  assert.match(result, /Visual value mismatch/);
});
test('path traversal and remote audio are rejected', () => {
  for (const file of ['audio/../../escape.mp3', 'https://example.com/audio.mp3']) {
    const data = fresh(); data.manifest.entries[0].file = file;
    assert.ok(validateContent(data).length);
  }
});
test('approved local media must match both its bytes and script', () => {
  const publicDir = mkdtempSync(join(tmpdir(), 'kids-audio-'));
  try {
    mkdirSync(join(publicDir, 'audio'));
    const bytes = Buffer.from('synthetic test fixture, not playable audio');
    writeFileSync(join(publicDir, 'audio/test.mp3'), bytes);
    const data = fresh();
    const entry = data.manifest.entries[0];
    Object.assign(entry, { status: 'approved', provider: 'human', file: 'audio/test.mp3', durationMs: 1000,
      bytes: bytes.length, sha256: sha(bytes), textSha256: sha(entry.text),
      licenseRef: 'test-license', approvalRef: 'test-review', voiceRef: 'test-adult', modelRef: 'human-recording' });
    assert.deepEqual(validateContent(data, { publicDir }), []);
    entry.text = 'A changed script.';
    entry.sha256 = '0'.repeat(64);
    const result = validateContent(data, { publicDir }).join('\n');
    assert.match(result, /Stale audio script/);
    assert.match(result, /Audio integrity mismatch/);
  } finally { rmSync(publicDir, { recursive: true, force: true }); }
});
test('ElevenLabs stays blocked even for offline audio', () => {
  const data = fresh(); data.manifest.entries[0].provider = 'elevenlabs';
  assert.match(validateContent(data).join('\n'), /ElevenLabs approval blocked/);
});
test('release rejects drafts, missing audio and incomplete 0–100 coverage', () => {
  const data = fresh();
  // 👑 Remove the targets explicitly so this negative test keeps working as real coverage grows.
  data.lessons = data.lessons.filter((l) => !l.conceptIds.some((c) => c === 'letter.z' || c === 'number.100'));
  const result = validateContent(data, { release: true }).join('\n');
  assert.match(result, /Unapproved lesson/);
  assert.match(result, /Unapproved audio/);
  assert.match(result, /Missing coverage: number.100/);
  assert.match(result, /Missing coverage: letter.z/);
});
test('claimed concepts without every learning phase do not count as taught', () => {
  const data = fresh(); data.lessons[0].conceptIds.push('letter.b');
  assert.match(validateContent(data).join('\n'), /Missing teach for letter.b/);
});
test('structural errors fail clearly instead of crashing validation', () => {
  const data = fresh(); delete data.lessons[0].steps;
  assert.match(validateContent(data).join('\n'), /lesson schema/);
});

test('curriculum phases must follow teach → demo → choice → review for each target', () => {
  const data = fresh();
  const steps = data.lessons[0].steps;
  [steps[0], steps[2]] = [steps[2], steps[0]];
  assert.match(validateContent(data).join('\n'), /Out-of-order learning phases/);
});

test('malformed lesson collections return an error rather than throwing', () => {
  const data = fresh(); data.lessons = {};
  assert.match(validateContent(data).join('\n'), /At least one lesson/);
});
