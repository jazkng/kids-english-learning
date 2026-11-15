# Verification plan

## Automated gates

| Command | Evidence / limitation |
|---|---|
| npm ci | Reproducible locked dependency installation on Node 24 |
| npm run typecheck | React, shared TS contracts, Vite and Capacitor configuration compile |
| npm run validate:content | JSON structure, semantic phases, IDs, target/answer/visual consistency, audio references and media integrity |
| npm test | Positive fixture plus corrupted input, reference, answer, traversal, script/file hash, policy and release-negative cases |
| npm run build | Web bundle, manifest and Workbox generation; not proof of browser offline operation |
| npm run check:release | Full ABC/0–100/12-color coverage, approved course/audio and provider policy metadata; intentionally fails on starter drafts |

CI runs development gates and build. Manual Release Gate validates but never deploys/publishes. The shared Auto Release workflow creates source-version GitHub Releases after main merges; it does not attach an APK, deploy an app or certify child-facing readiness. A status=approved string is not legal/voice evidence. Codex must inspect actual private evidence and record a non-sensitive reference. Listening review checks real audio decoding, timing and pronunciation; synthetic byte fixtures in tests only test integrity checking.

## Browser / device acceptance (CC implementation then Codex review)

1. Adult opens preview → selects one complete sample → teacher introduction → demo → correct/incorrect choice → feedback → review → finish. All child instructions can be understood without reading. No tap action is hidden behind hover.
2. Repeated rapid Replay/Next/Back, route changes and app backgrounding: old audio stops; stale ended events never advance the new lesson. Pause retains current step. Foreground recovery uses explicit replay.
3. Missing file, rejected play, decode error, storage denied/full, corrupt progress and invalid lesson each produce a usable recovery state, not a blank screen. A failed audio lesson is not marked complete.
4. PWA: use production preview over localhost/HTTPS, fresh profile, wait for complete installation/readiness, close app, disable network, reopen and finish a complete lesson with audio. Record resource requests, cache version and device/browser. Test failed first install and partial pack; show retry; preserve prior working version on update failure.
5. APK: fresh install, airplane mode before first app launch, complete a full approved audio lesson. Verify native SW is not registered, packaged paths work, no remote server.url. Test Android hardware back, process termination/relaunch, portrait/landscape, safe areas, low-end performance and background audio stop.
6. Update: pause an active lesson while a new version waits; no forced reload/data loss. Apply only at a safe parent boundary. Reopening restores compatible progress. Outdated content/media cannot be mixed.
7. Check 320px phone, common Android phone, tablet and desktop; 56px child controls, keyboard/focus/accessible names, readable contrast, color alternatives, reduced motion. Test with muted sound and an adult-assisted fallback.
8. Parent gate protects external links, reset and settings; gate is friction for children, not a claim of verified parental consent or secure authentication. Reset confirmation stays inside app.
9. Release: inspect network log for absence of AI APIs, tracking, ads and child uploads; inspect built bundle for secrets. Check official current child privacy/store requirements for intended distribution region before publication.

Record commands, commit SHA, browser/device/OS, test result, recovery result and remaining uncertainty in docs/handoffs. Keep build, deployment, physical device and user acceptance as separate facts. Initialization has no device, browser offline or pronunciation acceptance yet.

## Offline cache integrity regression

Automated offline.test.mjs checks full package media, missing entries, stale HTML/audio revisions, eviction, damaged indexes, denied storage and subdirectory/origin boundaries. The build-generated index must match every distinct Workbox precache URL/revision except its own entry. Parent area now says “App files saved for offline use”; absent draft narration is not an offline-audio completion claim. Browser verification must additionally test cache removal with a surviving service worker and revisit the parent area, then reinstall and confirm recovery. This session's local browser test was blocked by the browser URL policy; no browser/device result is claimed for this change.

## Navigation and parent recovery regression

`navigation.test.mjs` uses an in-memory history port to verify home → subject → lesson → next → back, reloading a lesson without an app-owned predecessor, invalid/foreign history, and parent Back/Forward/reload/background locking. These are navigation-service tests, not browser or Android acceptance.

Manual checks still required:
- Open a lesson, reload, then Exit → its subject list → Back → home. The in-app controls must not leave the app, even with unrelated history before it. Android hardware Back is a separate device check.
- Pass the parent hold, leave, press Forward, reload, and background/foreground: settings require a new hold. Existing progress remains unchanged.
- Hold with touch or Space/Enter for three seconds; release early, move away, lose focus or background partway through: access stays locked.
- In both parent-entry and reset dialogs, Tab/Shift+Tab stay inside, Escape closes, focus returns to the invoking control, body scroll stays locked. Screen-reader and physical-keyboard acceptance remain pending.

## Build rejects partial offline packages

The shared extension list drives both Workbox's glob and a build-directory scan. Before writing the readiness index, every packaged runtime/media resource must appear in Workbox's entries. Oversized assets skipped by Workbox warnings now fail the build. `precache-policy.test.mjs` covers complete packages and skipped audio/scripts. Local integration fault injection added a temporary >2 MiB public audio fixture: real Vite/Workbox build failed with the named omitted file; the fixture was removed and normal build passed again. These synthetic bytes test packaging only, not audio decoding.

## More-choice practice regression

`choice-practice.test.mjs` validates every expanded lesson against the canonical contracts, deep-freezes source input, compares all original options/targets/audio references, and checks idempotence. Boundary-number and familiar-color checks prevent added distractors exceeding the original age range. Expanded three/four-option lessons exercise wrong → original retry → Replay → original success → completion, and deterministic seeds cover every answer position. No source course, script, manifest or audio file is modified.

Manual device check pending: on a 320px phone, common Android and tablet, open ABC A, number 0, color red (three choices) and number 11/100 (four choices). Check all labels/quantities are visible in two columns, touch targets remain at least 56px, the smaller teacher leaves room for options, Replay retains option positions, and feedback still plays the original line. No new timing pressure, penalty or sound generation. Test narrow landscape/long captions with ordinary scrolling; do not claim browser/device acceptance from these unit tests.
