import { registerSW } from 'virtual:pwa-register';

type Listener = () => void;
const listeners = new Set<Listener>();
export const pwaState = { offlineReady: false, updateReady: false, apply: null as null | (() => void) };

export function subscribePwa(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
const emit = () => listeners.forEach((fn) => fn());

export function startPwa() {
  const update = registerSW({
    // 👑 Workbox reports offlineReady only after the whole precache installed; never infer it from navigator.onLine.
    onOfflineReady() { pwaState.offlineReady = true; emit(); },
    // 👑 A waiting worker is only applied from the parent area, never mid-lesson.
    onNeedRefresh() { pwaState.updateReady = true; emit(); },
  });
  pwaState.apply = () => { void update(true); };
  if (navigator.serviceWorker?.controller) { pwaState.offlineReady = true; emit(); }
}
