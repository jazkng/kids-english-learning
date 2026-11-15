# Architecture v0.1

## Product journey

Parent opens the adult setup area → child taps a learning area → teacher introduces one small concept → demonstrates it → asks a spoken tap question → gives gentle feedback → reviews → ends a short session. Replay, pause and back remain available. There is no microphone, pronunciation scoring or open-ended dialogue in MVP.

Content is English only, with en-GB as a provisional consistent editorial locale. The locale is a development default, not a final accent approval. Visual teacher design remains CC's task; the requested cartoon child-like voice remains pending provider policy approval. Use an adult-performed, licensed cartoon teacher only if its rights and provider policy permit it.

## Boundaries

| Layer | Directory | Responsibility |
|---|---|---|
| App shell | src/app | Navigation, adult development notice, app lifecycle |
| Child experience | src/features | Subject picker, teacher, lesson player, parent gate |
| Contracts | src/contracts + schemas | TypeScript interfaces + runtime JSON validation |
| Curriculum | content/lessons | Versioned reviewed lesson JSON |
| Spoken scripts/media metadata | content/audio/manifest.json | One source of spoken text; audio IDs, integrity and license refs |
| Local services | src/services | Audio adapter, progress adapter, cache readiness |
| Packaged media | public/audio | Reviewed static audio; never API credentials |
| Native container | capacitor.config.ts; android/ after CC setup | Same dist assets inside Android |
| Assurance | scripts; tests | Contract, semantic, release and offline gates |

Schema files are canonical. TypeScript interfaces describe the same boundary; Codex owns coordinated changes. No backend is needed in MVP; runtime cloud reads/writes and AI calls are zero by design.

## Lesson controller (CC to implement)

States: loading → ready → teaching → waiting-for-choice → feedback → review → completed. Paused and recoverable-error retain the current step. One audio controller owns playback; increment a session token and stop the old audio on replay, next, back, route change or app backgrounding. Ignore callbacks from stale sessions. Never overlap narration. An incorrect answer repeats or demonstrates without losing progress or applying penalties.

Use HTMLAudioElement with bundled media. UI follows audio ended/error events, not only timers. After a tap unlocks playback, handle rejected play promises and offer replay. Resume after foregrounding with an explicit child action; do not surprise the child with background audio. Missing or unapproved files show a visible adult-development/missing-audio state. Do not substitute browser speech synthesis and claim guaranteed offline speech.

Teacher states: idle, speaking, waiting, celebrating; decorative movement respects reduced motion. Teacher state follows the controller. Quantity visuals: 0 is an empty group; large numbers use tens/ones, not 100 tiny tap targets. Correct color choice must have an object/shape and spoken prompt, plus text/accessible labels; do not rely solely on hue for navigation or feedback.

## Offline delivery

Initialization generates a PWA manifest and Workbox shell precache; SW registration is skipped in native containers. The starter shell bundles only catalog data and small icons. CC must import lesson JSON through a static registry or import.meta.glob so Vite actually includes it, and bind every manifest audio file to the build. Files merely stored in content/ are not automatically offline resources.

PWA first use needs HTTPS (localhost is allowed) and a successful installation of the complete package. Never label a package ready based only on navigator.onLine or a previous audio play. Verify cache completeness and version before displaying offline-ready. A failed installation leaves the previous working package available. Starter media individual file limit: 2 MiB; build must fail when a required file exceeds it. Reconsider limits against measured package size before full audio integration.

Start with an atomic small package. If full media size becomes impractical, design versioned subject packs with bytes/checksums, storage quota handling, cancellation/retry, complete-before-activate, and rollback before adding lazy downloads. No unbounded cache or silent partial availability. A prompt-style waiting worker may activate at a parent-approved safe boundary; initialization does not implement that UI yet.

APK: bundle dist and all approved media, verify fresh installation in airplane mode. No remote server.url in release Capacitor config. No paid storage/CDN enrollment. Draft developer preview and child-facing release are distinct gates.

## Local progress (CC to implement)

ProgressV1 contains contentVersion, completed lesson IDs, optional last lesson and sound/motion settings. Store under kids-english-learning.progress.v1. Do not store a child's name, DOB, voice, device identifier or account. Parse and validate defensively; recover to defaults on corrupt/unsupported data without blank screens. Catch storage denial/quota errors and continue the lesson without persistence. Write only meaningful checkpoints, never each animation/audio tick. Parent-gated reset requires an in-app confirmation and clears only this app's data.

## Release boundary

Source CI accepts draft fixtures. Child release rejects drafts, missing references/files, integrity mismatches, incomplete ABC/0–100/Colors coverage and unapproved provider usage. Manual pronunciation, listening, accessibility, parent/privacy/store review and physical-device offline tests remain necessary; JSON status flags alone are not evidence of rights. No service creation, purchases, billing-enabled trials or paid runners without owner approval.

## Build dependency overrides

The initial latest dependency tree pulled audited build-tool advisories through Workbox. package.json pins deepmerge to 4.1.1 and Workbox's glob to 14.0.6; these are deliberate build-only overrides for GHSA-gcqx-w48m-w2h4, GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Re-evaluate when upstream dependencies resolve them; do not remove overrides without audit/build checks. The lockfile pins the full tree.
