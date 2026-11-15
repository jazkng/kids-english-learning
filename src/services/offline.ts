interface OfflineResource { url: string; revision: string | null }
interface OfflinePackage { schemaVersion: 1; resources: OfflineResource[] }
type CachedResponse = { ok: boolean } | undefined;

function isPackage(value: unknown): value is OfflinePackage {
  const p = value as OfflinePackage;
  // 👑 A damaged or empty package index must never advertise a complete offline installation.
  return !!p && p.schemaVersion === 1 && Array.isArray(p.resources) && p.resources.length > 0
    && p.resources.every((r) => r && typeof r.url === 'string' && r.url.length > 0
      && (r.revision === null || (typeof r.revision === 'string' && r.revision.length > 0)));
}

export async function isOfflinePackageCached(
  value: unknown,
  baseUrl: string,
  match: (url: string) => Promise<CachedResponse>,
): Promise<boolean> {
  if (!isPackage(value)) return false;
  try {
    const base = new URL('./', baseUrl);
    for (const resource of value.resources) {
      const url = new URL(resource.url, base);
      // 👑 Only this app's exact local revisions count; old caches and unrelated origins cannot prove readiness.
      if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || url.search || url.hash
        || url.username || url.password) return false;
      if (resource.revision) url.searchParams.set('__WB_REVISION__', resource.revision);
      if (!(await match(url.href))?.ok) return false;
    }
    return true;
  } catch {
    // 👑 Storage denial/eviction is recoverable and must not blank the parent area.
    return false;
  }
}
