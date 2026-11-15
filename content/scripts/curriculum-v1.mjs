// Single editorial source for curriculum v1: generates lesson JSON and draft manifest entries.
// Run: node content/scripts/curriculum-v1.mjs   (idempotent; never touches existing entries it did not create)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifestPath = resolve(root, 'content/audio/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// --- Editorial data (first integration slice: A–C, 0–3, red/blue/yellow) ---
// Letters: we teach the letter NAME first, then the common short SOUND via a key word.
// Phoneme notes live in delivery.pronunciationNote only; spoken text never contains IPA.
const letters = {
  a: { word: 'apple', sound: '/æ/ as in apple (short a), not the letter name' },
  b: { word: 'ball', sound: '/b/ — short and crisp, no added "buh" vowel' },
  c: { word: 'cat', sound: '/k/ — hard c, unvoiced, no added vowel' },
};
const numberWords = ['zero', 'one', 'two', 'three'];
// Runtime shows red dots on a plate (0 = empty plate), so scripts count "dots", never another object.
const numberThings = { 0: 'Nothing on the plate. Zero dots.', 1: 'Count with me: one. One dot.', 2: 'Count with me: one, two. Two dots.', 3: 'Count with me: one, two, three. Three dots.' };
const colors = {
  red: 'A red apple!',
  blue: 'Blue, like the sky!',
  yellow: 'Yellow, like the sun!',
};

const entries = [];
const line = (id, text, pronunciationNote = '', pauseAfterMs = 800) => {
  if (text.length > 250) throw new Error(`Line too long: ${id}`);
  entries.push({
    id, text, status: 'draft', delivery: { pace: 'slow', pauseAfterMs, pronunciationNote }, provider: 'pending',
    file: null, durationMs: null, bytes: null, sha256: null, textSha256: null,
    licenseRef: null, approvalRef: null, voiceRef: null, modelRef: null,
  });
  return id;
};

function lesson({ id, subject, title, ageBand, concept, visualKind, value, label, lines, distractors }) {
  const visual = { kind: visualKind, value, label };
  const step = (kind, audio, extra = {}) => ({ id: kind, kind, conceptId: concept, promptAudioId: audio, visual, ...extra });
  return {
    schemaVersion: 1, id, version: '0.1.0', subject, title, locale: 'en-GB', ageBand, status: 'draft',
    conceptIds: [concept],
    steps: [
      step('teach', lines.teach),
      step('demo', lines.demo),
      step('choice', lines.choice, {
        // Two choices for 2–3 year olds (COURSE_DATA_SPEC); runtime shuffles presentation.
        choices: [{ id: 'target', label, conceptId: concept }, ...distractors.map((d, i) => ({ id: `other-${i + 1}`, label: d.label, conceptId: d.concept }))],
        correctChoiceId: 'target', successAudioId: 'shared.great', retryAudioId: 'shared.try-again',
      }),
      step('review', lines.review),
    ],
  };
}

const lessons = [];
const letterKeys = Object.keys(letters);
letterKeys.forEach((k, i) => {
  const U = k.toUpperCase();
  const { word, sound } = letters[k];
  const base = `abc.letter-${k}`;
  const other = letterKeys[(i + 1) % letterKeys.length];
  lessons.push(lesson({
    id: base, subject: 'abc', title: `Letter ${U}`, ageBand: '2-3', concept: `letter.${k}`, visualKind: 'letter', value: U, label: U,
    distractors: [{ label: other.toUpperCase(), concept: `letter.${other}` }],
    lines: {
      teach: line(`${base}.teach`, `Hello! This is ${U}. Big ${U}, little ${k}.`, `Say the letter NAME "${U}" clearly; pause before "Big".`),
      demo: line(`${base}.demo`, `${U} is for ${word}. ${word.charAt(0).toUpperCase() + word.slice(1)}!`, `Letter name ${U}, then key word. Sound target: ${sound}.`),
      choice: line(`${base}.choice`, `Can you find ${U}? Tap ${U}.`, `Letter name ${U}.`, 400),
      review: line(`${base}.review`, `Yay! ${U}, ${U}, ${word}. Well done!`, `Letter name ${U}; warm, celebratory.`),
    },
  }));
});

numberWords.forEach((w, n) => {
  const base = `numbers.number-${n}`;
  const other = n === 0 ? 1 : n - 1;
  lessons.push(lesson({
    id: base, subject: 'numbers', title: `Number ${n}`, ageBand: '2-3', concept: `number.${n}`, visualKind: 'quantity', value: String(n), label: String(n),
    distractors: [{ label: String(other), concept: `number.${other}` }],
    lines: {
      teach: line(`${base}.teach`, `This is ${w}. ${numberThings[n]}`, n === 0 ? 'Zero shows an EMPTY plate; gentle, not sad.' : 'Count slowly, one beat per apple.'),
      demo: line(`${base}.demo`, `Look! ${w.charAt(0).toUpperCase() + w.slice(1)}. ${w.charAt(0).toUpperCase() + w.slice(1)}.`, 'Repeat the number word twice.'),
      choice: line(`${base}.choice`, `Where is ${w}? Tap ${w}.`, '', 400),
      review: line(`${base}.review`, `Hooray! That is ${w}. Well done!`, ''),
    },
  }));
});

const colorKeys = Object.keys(colors);
colorKeys.forEach((c, i) => {
  const base = `colors.color-${c}`;
  const other = colorKeys[(i + 1) % colorKeys.length];
  lessons.push(lesson({
    id: base, subject: 'colors', title: c.charAt(0).toUpperCase() + c.slice(1), ageBand: '2-3', concept: `color.${c}`, visualKind: 'color', value: c, label: c,
    distractors: [{ label: other, concept: `color.${other}` }],
    lines: {
      teach: line(`${base}.teach`, `This is ${c}. ${colors[c]}`, ''),
      demo: line(`${base}.demo`, `Look! ${c.charAt(0).toUpperCase() + c.slice(1)}. This apple is ${c}.`, 'Picture is always an apple shape; the word names the colour.'),
      choice: line(`${base}.choice`, `Which one is ${c}? Tap ${c}.`, '', 400),
      review: line(`${base}.review`, `Yes! ${c.charAt(0).toUpperCase() + c.slice(1)}! Well done!`, ''),
    },
  }));
});

for (const l of lessons) writeFileSync(resolve(root, `content/lessons/${l.id}.json`), `${JSON.stringify(l, null, 2)}\n`);
// 👑 Merge by stable ID. Only still-draft, file-less entries are refreshed; reviewed/approved text or
// anything with recorded audio metadata is never overwritten by the generator.
const known = new Set(manifest.entries.map((e) => e.id));
const byId = new Map(entries.map((e) => [e.id, e]));
manifest.entries = manifest.entries.map((e) => (byId.has(e.id) && e.status === 'draft' && !e.file ? { ...e, text: byId.get(e.id).text, delivery: byId.get(e.id).delivery } : e));
for (const e of entries) if (!known.has(e.id)) manifest.entries.push(e);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${lessons.length} lessons, ${entries.length} lines (${entries.filter((e) => !known.has(e.id)).length} new)`);
