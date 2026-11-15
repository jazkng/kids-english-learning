import type { Area as Subject } from './activities.ts';

export type Screen =
  | { name: 'home' }
  | { name: 'subject'; subject: Subject }
  | { name: 'lesson'; id: string; run: number }
  | { name: 'parent' };

type Entry = { screen: Screen; session: string; depth: number };
export interface HistoryPort {
  readonly state: unknown;
  pushState(value: unknown, title: string): void;
  replaceState(value: unknown, title: string): void;
  back(): void;
}

function screenFrom(value: unknown): Screen {
  if (!value || typeof value !== 'object') return { name: 'home' };
  const s = value as Record<string, unknown>;
  if (s.name === 'subject' && ['abc', 'numbers', 'colors', 'words', 'math'].includes(s.subject as string)) return { name: 'subject', subject: s.subject as Subject };
  if (s.name === 'lesson' && typeof s.id === 'string' && /^[a-z0-9][a-z0-9.-]{0,127}$/.test(s.id)
    && typeof s.run === 'number' && Number.isFinite(s.run)) return { name: 'lesson', id: s.id, run: s.run };
  // 👑 Parent access is transient: restored history, Forward and reload never grant access.
  return { name: 'home' };
}

export class AppNavigation {
  private entry: Entry;
  private listeners = new Set<() => void>();

  private history: HistoryPort;
  private session: string;

  constructor(history: HistoryPort, session: string) {
    this.history = history;
    this.session = session;
    const old = history.state;
    const value = old && typeof old === 'object' && 'screen' in old ? old.screen : old;
    // 👑 Browser history length includes other sites and previous app runs; only this run owns a back depth.
    this.entry = { screen: screenFrom(value), session, depth: 0 };
    history.replaceState(this.entry, '');
  }

  snapshot = () => this.entry.screen;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private commit(entry: Entry, replace: boolean) {
    if (replace) this.history.replaceState(entry, ''); else this.history.pushState(entry, '');
    this.entry = entry;
    this.listeners.forEach((fn) => fn());
  }

  go = (screen: Screen, replace = false) => {
    this.commit({ screen, session: this.session, depth: this.entry.depth + (replace ? 0 : 1) }, replace);
  };

  restore = (value: unknown) => {
    const e = value && typeof value === 'object' ? value as Partial<Entry> : {};
    const depth = e.session === this.session && Number.isSafeInteger(e.depth) && e.depth! >= 0 ? e.depth! : 0;
    this.commit({ screen: screenFrom(e.screen ?? value), session: this.session, depth }, true);
  };

  back = (fallback: Screen) => {
    // 👑 Scrub the granted parent entry before leaving so Forward cannot reopen its settings.
    if (this.entry.screen.name === 'parent') this.go({ name: 'home' }, true);
    if (this.entry.depth > 0) this.history.back();
    else this.go(fallback, true);
  };

  lockParent = () => {
    if (this.entry.screen.name === 'parent') this.go({ name: 'home' }, true);
  };
}
