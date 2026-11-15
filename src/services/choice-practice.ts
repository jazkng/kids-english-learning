import type { Choice, Lesson } from '../contracts/course.ts';

const basicColors = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const allColors = [...basicColors, 'pink', 'brown', 'black', 'white', 'grey', 'light-blue'];
const similarLetters: Record<string, string[]> = {
  a: ['h', 'r', 'v'], b: ['d', 'p', 'r'], c: ['g', 'o', 'q'], d: ['b', 'p', 'o'],
  e: ['f', 'b', 'h'], f: ['e', 't', 'p'], g: ['c', 'q', 'o'], h: ['a', 'n', 'm'],
  i: ['l', 'j', 't'], j: ['i', 'l', 'u'], k: ['r', 'h', 'x'], l: ['i', 't', 'j'],
  m: ['n', 'w', 'h'], n: ['m', 'h', 'u'], o: ['q', 'c', 'g'], p: ['b', 'r', 'd'],
  q: ['o', 'g', 'p'], r: ['p', 'b', 'k'], s: ['z', 'c', 'g'], t: ['i', 'f', 'l'],
  u: ['v', 'j', 'n'], v: ['u', 'w', 'y'], w: ['m', 'v', 'u'], x: ['k', 'y', 'z'],
  y: ['v', 'x', 't'], z: ['s', 'x', 'n'],
};
const similarColors: Record<string, string[]> = {
  red: ['orange', 'pink', 'brown'], blue: ['light-blue', 'purple', 'green'], yellow: ['orange', 'green', 'white'],
  green: ['blue', 'yellow', 'light-blue'], orange: ['red', 'yellow', 'brown'], purple: ['blue', 'pink', 'red'],
  pink: ['red', 'purple', 'white'], brown: ['orange', 'red', 'black'], black: ['grey', 'brown', 'purple'],
  white: ['grey', 'light-blue', 'yellow'], grey: ['black', 'white', 'light-blue'], 'light-blue': ['blue', 'white', 'grey'],
};

function candidates(lesson: Lesson, conceptId: string): { prefix: string; values: string[] } | null {
  const [prefix, value] = conceptId.split('.');
  if (lesson.subject === 'abc' && prefix === 'letter' && /^[a-z]$/.test(value)) {
    return { prefix, values: [...(similarLetters[value] ?? []), ...'abcdefghijklmnopqrstuvwxyz'] };
  }
  if (lesson.subject === 'numbers' && prefix === 'number' && /^(0|[1-9][0-9]?|100)$/.test(value)) {
    const n = Number(value);
    // 👑 Added choices stay in the lesson's existing age range; 0 and 100 never wrap around.
    const max = lesson.ageBand === '2-3' ? 10 : 100;
    if (n > max) return null;
    return { prefix, values: Array.from({ length: max + 1 }, (_, i) => i)
      .sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b).map(String) };
  }
  if (lesson.subject === 'colors' && prefix === 'color' && allColors.includes(value)) {
    const pool = lesson.ageBand === '2-3' ? basicColors : allColors;
    return { prefix, values: [...(similarColors[value] ?? []), ...pool].filter((color) => pool.includes(color)) };
  }
  return null;
}

export function withMoreChoices(lesson: Lesson): Lesson {
  // 👑 Preserve authored targets, choices and narration; add only visual distractors, never rewrite spoken instructions.
  const targetCount = lesson.ageBand === '2-3' ? 3 : 4;
  return { ...lesson, steps: lesson.steps.map((step) => {
    if (step.kind !== 'choice' || !step.choices || step.choices.length >= targetCount
      || !step.choices.some((choice) => choice.id === step.correctChoiceId && choice.conceptId === step.conceptId)) return step;
    const pool = candidates(lesson, step.conceptId);
    if (!pool) return step;
    const choices: Choice[] = [...step.choices];
    const concepts = new Set(choices.map((choice) => choice.conceptId));
    const ids = new Set(choices.map((choice) => choice.id));
    for (const value of pool.values) {
      if (choices.length >= targetCount) break;
      const conceptId = `${pool.prefix}.${value}`;
      if (concepts.has(conceptId)) continue;
      let id = `practice-${value}`;
      while (ids.has(id)) id += '-extra';
      choices.push({ id, conceptId, label: pool.prefix === 'letter' ? value.toUpperCase() : value.replaceAll('-', ' ') });
      concepts.add(conceptId); ids.add(id);
    }
    return { ...step, choices };
  }) };
}
