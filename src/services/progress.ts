import type { ProgressV1 } from '../contracts/course.ts';

export const PROGRESS_KEY = 'kids-english-learning.progress.v1';

export function defaultProgress(contentVersion: string): ProgressV1 {
  return { schemaVersion: 1, contentVersion, completedLessonIds: [], soundEnabled: true, reducedMotion: false };
}

// 👑 Corrupt or foreign data falls back to defaults instead of blanking the app.
export function parseProgress(raw: string | null, contentVersion: string): ProgressV1 {
  const fallback = defaultProgress(contentVersion);
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw) as Partial<ProgressV1>;
    if (!p || p.schemaVersion !== 1) return fallback;
    return {
      schemaVersion: 1,
      contentVersion,
      completedLessonIds: Array.isArray(p.completedLessonIds)
        ? [...new Set(p.completedLessonIds.filter((id): id is string => typeof id === 'string'))].slice(0, 1000) : [],
      lastLessonId: typeof p.lastLessonId === 'string' ? p.lastLessonId : undefined,
      soundEnabled: typeof p.soundEnabled === 'boolean' ? p.soundEnabled : true,
      reducedMotion: typeof p.reducedMotion === 'boolean' ? p.reducedMotion : false,
    };
  } catch { return fallback; }
}

export interface ProgressStore { get(): string | null; set(v: string): void; remove(): void }

const browserStore: ProgressStore = {
  get: () => localStorage.getItem(PROGRESS_KEY),
  set: (v) => localStorage.setItem(PROGRESS_KEY, v),
  remove: () => localStorage.removeItem(PROGRESS_KEY),
};

export function loadProgress(contentVersion: string, store: ProgressStore = browserStore): ProgressV1 {
  // 👑 Storage may be denied (private mode, WebView policy); the lesson still runs without persistence.
  try { return parseProgress(store.get(), contentVersion); } catch { return defaultProgress(contentVersion); }
}

export function saveProgress(p: ProgressV1, store: ProgressStore = browserStore): boolean {
  try { store.set(JSON.stringify(p)); return true; } catch { return false; }
}

export function clearProgress(store: ProgressStore = browserStore): boolean {
  try { store.remove(); return true; } catch { return false; }
}
