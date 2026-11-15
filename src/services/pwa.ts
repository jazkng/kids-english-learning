import { registerSW } from 'virtual:pwa-register';
import { isOfflinePackageCached } from './offline.ts';

type Listener = () => void;
const listeners = new Set<Listener>();
export const pwaState = { offlineReady: false, updateReady: false, apply: null as null | (() => void) };

export function subscribePwa(fn: Listener) { listeners.add(fn); return () => { listeners.delete(fn); }; }
const emit = () => listeners.forEach((fn) => fn());
let verification = 0;

export async function refreshOfflineReady() {
  const current = ++verification;
  let ready = false;
  try {
    // 👑 A controller may survive cache eviction; confirm every expected revision instead of trusting its presence.
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active && 'caches' in window) {
      const base = new URL(import.meta.env.BASE_URL, location.href);
      const response = await fetch(new URL('offline-package.json', base), { cache: 'no-store' });
      if (response.ok) ready = await isOfflinePackageCached(await response.json(), base.href, (url) => caches.match(url));
    }
  } catch { /* 👑 Missing index or offline/storage failure leaves readiness unconfirmed. */ }
  // 👑 A slower prior check must not overwrite the latest cache result.
  if (current === verification) { pwaState.offlineReady = ready; emit(); }
}

export function startPwa() {
  const update = registerSW({
    // 👑 Workbox installation triggers verification; neither connectivity nor a controller proves complete caching.
    onOfflineReady() { void refreshOfflineReady(); },
    // 👑 A waiting worker is only applied from the parent area, never mid-lesson.
    onNeedRefresh() { pwaState.updateReady = true; emit(); },
  });
  pwaState.apply = () => { void update(true); };
  navigator.serviceWorker?.addEventListener('controllerchange', () => { void refreshOfflineReady(); });
  // 👑 First install may activate before it controls this tab; verify once ready without requiring a manual reload.
  void navigator.serviceWorker?.ready.then(() => refreshOfflineReady());
  void refreshOfflineReady();
}
