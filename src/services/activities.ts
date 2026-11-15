import type { Subject } from '../contracts/course.ts';
import type { PlayableLesson, PlayableStep } from '../features/lesson/engine.ts';
import { findLesson, lessons, lessonsFor } from './content.ts';
import wordsData from '../../content/activities/words.json';
import mathData from '../../content/activities/math.json';

export type Area = Subject | 'words' | 'math';
export const AREAS: Area[] = ['abc', 'words', 'numbers', 'math', 'colors'];
export type AreaLesson = PlayableLesson & { subject: Area };

export const extraAreas: { id: Area; title: string; symbol: string }[] = [
  { id: 'words', title: 'Words', symbol: '🍎' },
  { id: 'math', title: 'Math', symbol: '+−' },
];

// 👑 Bundled JSON is still checked: a malformed activity is skipped instead of crashing the area.
const usable = (l: AreaLesson) => !!l && typeof l.id === 'string' && Array.isArray(l.steps) && l.steps.length > 0
  && l.steps.every((s) => s && typeof s.promptAudioId === 'string' && s.visual
    && (s.kind !== 'choice' || (Array.isArray(s.choices) && s.choices.some((c) => c.id === s.correctChoiceId))));
const words = (wordsData.lessons as unknown as AreaLesson[]).filter(usable);
const math = (mathData.lessons as unknown as AreaLesson[]).filter(usable);

export function areaLessons(area: Area): AreaLesson[] {
  if (area === 'words') return words;
  if (area === 'math') return math;
  return lessonsFor(area) as AreaLesson[];
}

export const playableCount = lessons.length + words.length + math.length;
export const QUIZ_PREFIX = 'quiz.';
const QUIZ_SIZE = 5;

// Small deterministic PRNG so a restored quiz (same run seed) shows the same questions.
function rng(seed: number) {
  let t = seed >>> 0;
  return () => { t += 0x6d2b79f5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

export function buildQuiz(area: Area, seed: number): AreaLesson | null {
  const pool: PlayableStep[] = areaLessons(area).flatMap((l) => l.steps.filter((s) => s.kind === 'choice'));
  if (pool.length === 0) return null;
  const rand = rng(seed);
  const picked = [...pool].sort(() => rand() - 0.5).slice(0, QUIZ_SIZE);
  // Mixed quiz: question prompts are reused (already voiced where audio exists); the end reuses shared praise.
  const steps: PlayableStep[] = picked.map((s, i) => ({ ...s, id: `q${i}-${s.id}` }));
  steps.push({ ...picked[0], id: 'quiz-end', kind: 'review', promptAudioId: 'shared.great', choices: undefined, correctChoiceId: undefined, successAudioId: undefined, retryAudioId: undefined });
  return { id: `${QUIZ_PREFIX}${area}`, title: 'Quiz', ageBand: 'mixed', subject: area, steps };
}

export function findPlayable(id: string, run: number): AreaLesson | undefined {
  if (id.startsWith(QUIZ_PREFIX)) {
    const area = id.slice(QUIZ_PREFIX.length) as Area;
    return AREAS.includes(area) ? buildQuiz(area, run) ?? undefined : undefined;
  }
  return (findLesson(id) as AreaLesson | undefined) ?? words.find((l) => l.id === id) ?? math.find((l) => l.id === id);
}
