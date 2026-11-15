// Generates narration MP3s for every manifest line with ElevenLabs and records file metadata.
// Owner decision (family use only, 2026-11-15): Lily voice, Flash v2.5, within the free quota.
// The API key is injected by the session network proxy; it is never read from or written to the repo.
// Run: node content/scripts/generate-audio.mjs [--limit N]   (idempotent: skips lines whose file matches the text hash)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifestPath = resolve(root, 'content/audio/manifest.json');
const VOICE = { id: 'pFZP5JQG7iQjIQuC4Bku', ref: 'elevenlabs:premade:lily' };
const MODEL = 'eleven_flash_v2_5';
const KBPS = 64;
const sha = (v) => createHash('sha256').update(v).digest('hex');
const limit = Number(process.argv[process.argv.indexOf('--limit') + 1]) || Infinity;

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
mkdirSync(resolve(root, 'public/audio/v1'), { recursive: true });
const save = () => writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

let done = 0; let credits = 0;
for (const entry of manifest.entries) {
  if (done >= limit) break;
  const textSha = sha(entry.text);
  const file = `audio/v1/${entry.id}.mp3`;
  // 👑 Never overwrite reviewed/approved media; only (re)generate draft lines whose script changed or file is missing.
  if (entry.status !== 'draft') continue;
  if (entry.file === file && entry.textSha256 === textSha && existsSync(resolve(root, 'public', file))) continue;
  const speed = entry.delivery?.pace === 'slow' ? 0.85 : 1;
  let res;
  for (let attempt = 1; attempt <= 4; attempt++) {
    res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE.id}?output_format=mp3_44100_${KBPS}`, {
      method: 'POST',
      headers: { 'xi-api-key': 'proxy-injected', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: entry.text, model_id: MODEL, voice_settings: { stability: 0.6, similarity_boost: 0.75, speed } }),
    });
    if (res.ok || (res.status < 500 && res.status !== 429)) break;
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
  if (!res.ok) {
    // 👑 Stop on quota/auth errors instead of burning through remaining credits with failing calls.
    console.error(`FAILED ${entry.id}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    save();
    process.exit(1);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  writeFileSync(resolve(root, 'public', file), bytes);
  credits += Number(res.headers.get('character-cost') ?? 0);
  Object.assign(entry, {
    file, bytes: bytes.length, sha256: sha(bytes), textSha256: textSha,
    // CBR 64 kbps output, so duration follows from size; listening review confirms real timing.
    durationMs: Math.round((bytes.length * 8) / KBPS),
    provider: 'elevenlabs', voiceRef: VOICE.ref, modelRef: MODEL,
    licenseRef: 'owner-decision:family-use-free-plan', approvalRef: null,
  });
  done++;
  if (done % 25 === 0) { save(); console.log(`${done} generated, ${credits} credits`); }
}
save();
console.log(`Finished: ${done} generated, ${credits} credits used`);
