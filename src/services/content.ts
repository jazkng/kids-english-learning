import type { Lesson, Subject } from '../contracts/course.ts';
import catalog from '../../content/catalog.json';
import manifest from '../../content/audio/manifest.json';
import { withMoreChoices } from './choice-practice.ts';
import { compareLessons } from './lesson-order.ts';

export interface AudioEntry { id: string; text: string; status: string; file: string | null }

// 👑 Static glob so Vite bundles every lesson into the offline package; files merely under content/ are not cached.
const modules = import.meta.glob<Lesson>('../../content/lessons/*.json', { eager: true, import: 'default' });

const subjects: Subject[] = ['abc', 'numbers', 'colors'];

// 👑 Defensive shape check: one malformed lesson must not blank the whole app.
function usable(value: unknown): value is Lesson {
  const l = value as Lesson;
  return !!l && l.schemaVersion === 1 && typeof l.id === 'string' && subjects.includes(l.subject)
    && Array.isArray(l.steps) && l.steps.length > 0
    && l.steps.every((s) => s && typeof s.promptAudioId === 'string' && s.visual && typeof s.visual.value === 'string'
      && (s.kind !== 'choice' || (Array.isArray(s.choices) && s.choices.some((c) => c.id === s.correctChoiceId))));
}

// Contract fixtures (*.sample) stay in content/ for validator tests but duplicate real lessons for the child.
export const lessons: Lesson[] = Object.values(modules).filter(usable).filter((l) => !l.id.endsWith('.sample')).map(withMoreChoices)
  .sort(compareLessons);
export const invalidLessonCount = Object.values(modules).filter((l) => !usable(l)).length;
export const contentVersion: string = catalog.contentVersion;
export const subjectInfo = catalog.subjects as { id: Subject; title: string; symbol: string; description: string }[];
export const hasDraftContent = lessons.some((l) => l.status !== 'approved');

const audio = new Map<string, AudioEntry>((manifest.entries as AudioEntry[]).map((e) => [e.id, e]));
export const audioEntry = (id: string) => audio.get(id);

export function audioUrl(id: string): string | null {
  const entry = audio.get(id);
  if (!entry?.file) return null;
  // 👑 Family-use scope (2026-11-15): bundled draft narration may play in the private APK/PWA.
  // The validator still keeps unapproved provider audio out of any release build.
  if (entry.status !== 'approved' && entry.status !== 'draft') return null;
  if (!/^audio\/[a-z0-9._/-]+\.(mp3|wav|ogg)$/.test(entry.file) || entry.file.includes('..')) return null;
  return `${import.meta.env.BASE_URL}${entry.file}`;
}

export const lessonsFor = (subject: Subject) => lessons.filter((l) => l.subject === subject);
export const findLesson = (id: string) => lessons.find((l) => l.id === id);
