import { readdirSync } from 'node:fs';
import { extname, join } from 'node:path';

export const precacheExtensions = ['js', 'css', 'html', 'svg', 'json', 'webmanifest', 'mp3', 'wav', 'ogg'];

export function packageResources(directory: string): string[] {
  const files: string[] = [];
  const walk = (relative: string) => {
    for (const entry of readdirSync(join(directory, relative), { withFileTypes: true })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile() && precacheExtensions.includes(extname(entry.name).slice(1))) files.push(path);
    }
  };
  walk('');
  return files;
}

export function assertCompletePrecache(entries: readonly { url: string }[], resources: readonly string[]) {
  const cached = new Set(entries.map((entry) => entry.url));
  const missing = resources.filter((path) => !cached.has(path));
  // 👑 Workbox can warn and skip oversized files; an atomic offline package must fail instead of claiming readiness.
  if (missing.length) throw new Error(`Offline package excludes required resources: ${missing.join(', ')}. Reduce their size or explicitly redesign the package before building.`);
}
