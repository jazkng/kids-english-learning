// Editorial source for the Words and Math activity areas (owner request 2026-11-15).
// Writes content/activities/{words,math}.json and merges draft narration lines into the audio manifest.
// Activities reuse the lesson step shape so the same teacher/engine plays them, but live outside
// content/lessons so the v1 lesson contract (owned by Codex) is unchanged.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifestPath = resolve(root, 'content/audio/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const entries = [];
const line = (id, text, pronunciationNote = '', pauseAfterMs = 600) => {
  if (text.length > 250) throw new Error(`Line too long: ${id}`);
  entries.push({ id, text, status: 'draft', delivery: { pace: 'slow', pauseAfterMs, pronunciationNote }, provider: 'pending',
    file: null, durationMs: null, bytes: null, sha256: null, textSha256: null, licenseRef: null, approvalRef: null, voiceRef: null, modelRef: null });
  return id;
};
const feedback = { successAudioId: 'shared.great', retryAudioId: 'shared.try-again' };

// --- Words: three picture words per letter (emoji render offline on Android without image files) ---
// Q and X have two: few concrete child words exist; X words END in x, which the script says explicitly.
const W = {
  a: [['apple', '🍎'], ['ant', '🐜'], ['airplane', '✈️']], b: [['ball', '⚽'], ['banana', '🍌'], ['bear', '🐻']],
  c: [['cat', '🐱'], ['car', '🚗'], ['cake', '🎂']], d: [['dog', '🐶'], ['duck', '🦆'], ['drum', '🥁']],
  e: [['egg', '🥚'], ['elephant', '🐘'], ['ear', '👂']], f: [['fish', '🐟'], ['frog', '🐸'], ['flower', '🌸']],
  g: [['goat', '🐐'], ['grapes', '🍇'], ['gift', '🎁']], h: [['hat', '🎩'], ['horse', '🐴'], ['house', '🏠']],
  i: [['ice cream', '🍦'], ['insect', '🐛'], ['island', '🏝️']], j: [['juice', '🧃'], ['jeans', '👖'], ['jacket', '🧥']],
  k: [['kite', '🪁'], ['key', '🔑'], ['kangaroo', '🦘']], l: [['lion', '🦁'], ['lemon', '🍋'], ['leaf', '🍃']],
  m: [['moon', '🌙'], ['monkey', '🐵'], ['milk', '🥛']], n: [['nose', '👃'], ['nut', '🥜'], ['noodles', '🍜']],
  o: [['octopus', '🐙'], ['orange', '🍊'], ['owl', '🦉']], p: [['pig', '🐷'], ['pizza', '🍕'], ['penguin', '🐧']],
  q: [['queen', '👸'], ['quilt', '🛏️']], r: [['rabbit', '🐰'], ['rainbow', '🌈'], ['robot', '🤖']],
  s: [['sun', '☀️'], ['star', '⭐'], ['snake', '🐍']], t: [['tiger', '🐯'], ['train', '🚂'], ['tree', '🌳']],
  u: [['umbrella', '☂️'], ['unicorn', '🦄']], v: [['van', '🚐'], ['violin', '🎻'], ['volcano', '🌋']],
  w: [['whale', '🐳'], ['watch', '⌚'], ['web', '🕸️']], x: [['fox', '🦊'], ['box', '📦']],
  y: [['yo-yo', '🪀'], ['yarn', '🧶']], z: [['zebra', '🦓'], ['zip', '🤐'], ['zero', '0️⃣']],
};
const article = (w) => (/^[aeiou]/.test(w) && w !== 'unicorn' ? 'an' : 'a');
const plural = new Set(['grapes', 'jeans', 'noodles']);
const the = (w) => (plural.has(w) || w === 'milk' || w === 'juice' || w === 'yarn' || w === 'ice cream' ? w : `${article(w)} ${w}`);
const slug = (w) => w.replace(/[^a-z]+/g, '-');
const allWords = Object.values(W).flat();
const words = [];
for (const [letter, list] of Object.entries(W)) {
  const U = letter.toUpperCase();
  const id = `words.letter-${letter}`;
  const steps = [];
  list.forEach(([w, emoji], i) => {
    const concept = `word.${slug(w)}`;
    const visual = { kind: 'word', value: slug(w), label: w };
    const intro = letter === 'x' ? `This is ${the(w)}. ${cap(w)} ends with ${U}.` : `This is ${the(w)}. ${cap(w)} starts with ${U}.`;
    steps.push({ id: `teach-${slug(w)}`, kind: 'teach', conceptId: concept, promptAudioId: line(`${id}.${slug(w)}.teach`, intro, `Say "${w}" slowly and clearly; letter name ${U}${letter === 'z' ? ' is "zed"' : ''}.`), visual });
    // Distractors come from other letters so the picture, not the first sound, is what is being tested.
    const others = [allWords[(allWords.findIndex(([x]) => x === w) + 5) % allWords.length], allWords[(allWords.findIndex(([x]) => x === w) + 11) % allWords.length]];
    const n = i === 0 ? 1 : 2;
    steps.push({ id: `choice-${slug(w)}`, kind: 'choice', conceptId: concept, visual,
      promptAudioId: line(`${id}.${slug(w)}.choice`, `Where is the ${w}? Tap the ${w}.`, '', 400),
      choices: [{ id: 'target', label: w, conceptId: concept }, ...others.slice(0, n).map(([o], k) => ({ id: `other-${k + 1}`, label: o, conceptId: `word.${slug(o)}` }))],
      correctChoiceId: 'target', ...feedback });
  });
  const names = list.map(([w]) => w);
  steps.push({ id: 'review', kind: 'review', conceptId: steps[0].conceptId, visual: steps[0].visual,
    promptAudioId: line(`${id}.review`, `${U} words: ${names.join(', ')}. Well done!`, '') });
  words.push({ id, title: `${U} words`, subject: 'words', ageBand: '2-3', status: 'draft', letter: U, steps });
}
const emoji = Object.fromEntries(allWords.map(([w, e]) => [slug(w), { word: w, emoji: e }]));

// --- Math: addition within 5 (ages 2–3); addition and subtraction within 20 (ages 4–5) ---
const N = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const math = [];
function mathLesson(id, title, ageBand, op, problems) {
  const steps = [];
  const sign = op === '+' ? 'plus' : 'take away';
  problems.forEach(([a, b], i) => {
    const r = op === '+' ? a + b : a - b;
    const visual = { kind: 'sum', value: `${a}${op}${b}`, label: `${a} ${op === '+' ? 'plus' : 'minus'} ${b}` };
    const concept = `number.${r}`;
    if (i === 0) {
      // First problem is demonstrated so the child hears how to count the dots before answering.
      const how = op === '+'
        ? `${cap(N[a])} dots and ${N[b]} more dots. Count them all: ${N[r]}! ${cap(N[a])} plus ${N[b]} makes ${N[r]}.`
        : `${cap(N[a])} dots. Take away ${N[b]}. ${cap(N[r])} dots are left! ${cap(N[a])} take away ${N[b]} makes ${N[r]}.`;
      steps.push({ id: `teach-${i}`, kind: 'teach', conceptId: concept, visual, promptAudioId: line(`${id}.p${i}.teach`, how, 'Point-and-count pace; pause after each number.') });
    }
    const near = [r + 1, r - 1, r + 2].filter((d) => d >= 0 && d <= 20 && d !== r);
    const k = ageBand === '2-3' ? 1 : 2;
    steps.push({ id: `choice-${i}`, kind: 'choice', conceptId: concept, visual,
      promptAudioId: line(`${id}.p${i}.choice`, `${cap(N[a])} ${sign} ${N[b]}. How many?`, '', 400),
      choices: [{ id: 'target', label: String(r), conceptId: concept }, ...near.slice(0, k).map((d, j) => ({ id: `other-${j + 1}`, label: String(d), conceptId: `number.${d}` }))],
      correctChoiceId: 'target', ...feedback });
  });
  steps.push({ id: 'review', kind: 'review', conceptId: steps[0].conceptId, visual: steps[0].visual,
    promptAudioId: line(`${id}.review`, op === '+' ? 'Great adding! Well done!' : 'Great taking away! Well done!', '') });
  math.push({ id, title, subject: 'math', ageBand, status: 'draft', steps });
}
mathLesson('math.add-5-a', 'Add to 5', '2-3', '+', [[1, 1], [2, 1], [1, 2], [2, 2], [3, 1]]);
mathLesson('math.add-5-b', 'Add to 5 again', '2-3', '+', [[1, 3], [3, 2], [2, 3], [4, 1], [1, 4]]);
mathLesson('math.add-10-a', 'Add to 10', '4-5', '+', [[3, 3], [4, 2], [5, 3], [6, 2], [4, 4]]);
mathLesson('math.add-10-b', 'Add to 10 again', '4-5', '+', [[5, 5], [6, 3], [7, 2], [2, 8], [3, 6]]);
mathLesson('math.sub-10-a', 'Take away to 10', '4-5', '-', [[3, 1], [5, 2], [4, 2], [6, 3], [5, 4]]);
mathLesson('math.sub-10-b', 'Take away to 10 again', '4-5', '-', [[8, 3], [7, 4], [9, 5], [10, 2], [10, 6]]);
mathLesson('math.add-20-a', 'Add to 20', '4-5', '+', [[10, 2], [10, 5], [8, 5], [9, 4], [7, 6]]);
mathLesson('math.add-20-b', 'Add to 20 again', '4-5', '+', [[11, 3], [12, 5], [9, 9], [14, 4], [10, 10]]);
mathLesson('math.sub-20-a', 'Take away to 20', '4-5', '-', [[12, 2], [15, 5], [13, 3], [14, 4], [18, 8]]);
mathLesson('math.sub-20-b', 'Take away to 20 again', '4-5', '-', [[16, 3], [19, 6], [17, 9], [20, 10], [15, 7]]);

// Quizzes reuse lesson questions; only the start line is new (end uses shared.great).
line('quiz.start', 'Quiz time! Listen and tap.', 'Playful, upbeat.');

writeFileSync(resolve(root, 'content/activities/words.json'), `${JSON.stringify({ schemaVersion: 1, emoji, lessons: words }, null, 2)}\n`);
writeFileSync(resolve(root, 'content/activities/math.json'), `${JSON.stringify({ schemaVersion: 1, lessons: math }, null, 2)}\n`);
// 👑 Merge by stable ID; only still-draft, file-less lines are refreshed, never reviewed text or recorded audio.
const byId = new Map(entries.map((e) => [e.id, e]));
const known = new Set(manifest.entries.map((e) => e.id));
manifest.entries = manifest.entries.map((e) => (byId.has(e.id) && e.status === 'draft' && !e.file ? { ...e, text: byId.get(e.id).text, delivery: byId.get(e.id).delivery } : e));
for (const e of entries) if (!known.has(e.id)) manifest.entries.push(e);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${words.length} word lessons, ${math.length} math lessons, ${entries.length} lines, ${entries.reduce((a, e) => a + e.text.length, 0)} chars`);
