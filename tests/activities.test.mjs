import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url)));
const manifest = read('content/audio/manifest.json');
const audio = new Set(manifest.entries.map((e) => e.id));
const words = read('content/activities/words.json');
const math = read('content/activities/math.json');
const all = [...words.lessons, ...math.lessons];

test('every activity step references existing narration and has a valid answer', () => {
  const ids = new Set();
  for (const l of all) {
    assert.ok(!ids.has(l.id), `duplicate ${l.id}`); ids.add(l.id);
    assert.equal(new Set(l.steps.map((s) => s.id)).size, l.steps.length, `step ids in ${l.id}`);
    for (const s of l.steps) {
      for (const ref of [s.promptAudioId, s.successAudioId, s.retryAudioId].filter(Boolean)) assert.ok(audio.has(ref), `missing audio ${ref}`);
      if (s.kind === 'choice') {
        const answer = s.choices.find((c) => c.id === s.correctChoiceId);
        assert.equal(answer?.conceptId, s.conceptId, `answer ${l.id}/${s.id}`);
        assert.equal(new Set(s.choices.map((c) => c.conceptId)).size, s.choices.length, `distinct choices ${l.id}/${s.id}`);
      }
    }
  }
});

test('math answers are correct and stay within 0–20 (5 for ages 2–3)', () => {
  for (const l of math.lessons) {
    for (const s of l.steps.filter((x) => x.kind === 'choice')) {
      const [, a, op, b] = /^(\d+)([+-])(\d+)$/.exec(s.visual.value);
      const r = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
      assert.equal(s.conceptId, `number.${r}`);
      assert.ok(r >= 0 && r <= (l.ageBand === '2-3' ? 5 : 20) && Number(a) <= 20, `${l.id} ${s.visual.value}`);
      for (const c of s.choices) assert.match(c.conceptId, /^number\.(1?\d|20)$/);
    }
  }
});

test('every word choice has a picture and every letter has word lessons', () => {
  for (const l of words.lessons) for (const s of l.steps) {
    for (const c of (s.choiceKind ? [] : s.choices ?? [])) assert.ok(words.emoji[c.conceptId.slice(5)], `emoji for ${c.conceptId}`);
  }
  assert.equal(words.lessons.filter((l) => l.ageBand === '2-3').length, 26);
  // First-letter game: the answer letter must be the word's real first letter.
  for (const l of words.lessons.filter((x) => x.ageBand === '4-5')) for (const s of l.steps.filter((x) => x.kind === 'choice')) {
    assert.equal(s.conceptId, `letter.${s.visual.label[0]}`);
  }
});
