# Project memory

Shared by Codex, Claude Code and Gemini through merged Git files. No private chat synchronization is implied. Read AGENTS.md and relevant issues before work. Entry statuses distinguish plans, build, deployment and physical-device acceptance. Initialization changes are pending integration until their PR merges.

| ID | Date | Category | Status | Fact / decision | Source | Next action |
|---|---|---|---|---|---|---|
| KEL-SCOPE-001 | 2026-11-15 | Product | user-confirmed | Ages 2–5; English-only teacher-led ABC, Numbers 0–100 and Colors; offline support. | Owner initialization request | Build progressive short lessons. |
| KEL-STACK-001 | 2026-11-15 | Architecture | user-confirmed | React + TypeScript + Vite + Capacitor + PWA. | Owner request | CC implements runtime and Android. |
| KEL-TEAM-001 | 2026-11-15 | Collaboration | user-confirmed | Codex: architecture/tests/review; CC: app/APK/deployment; Gemini: curriculum/scripts. | Owner request; docs/PARALLEL_PLAN.md | Separate branches and file boundaries; actual remote AI pickup pending. |
| KEL-COST-001 | 2026-11-15 | Cost | user-confirmed | No paid services may be enabled without approval. | Owner request | Apply to provider, hosting and CI changes. |
| KEL-VOICE-001 | 2026-11-15 | Provider policy | verified | ElevenLabs child-directed use requires written approval; offline distribution is not assumed exempt. No provider audio generated or integrated. | Official use-policy and terms; docs/ELEVENLABS_POLICY_GATE.md | #5 approval evidence; #7 remains blocked. |
| KEL-INIT-001 | 2026-11-15 | Initialization | pending | Scaffold, contracts, examples and issue plan prepared on codex/initialize-project. Samples are draft and silent. | Initialization PR; #1 | Merge only after checks pass. |
| KEL-BUILD-001 | 2026-11-15 | Verification | verified | Local typecheck, content validation, 9 tests and production PWA build passed. Release validation correctly rejects draft/incomplete fixtures. npm audit reports zero vulnerabilities with documented build-only overrides. | Node 24 local command output; docs/TEST_PLAN.md | Verify GitHub CI on initialization PR; browser/device checks still pending. |
| KEL-DEPLOY-001 | 2026-11-15 | Deployment | pending | No preview hosting, Android project, APK or production deployment created. | Initialization scope | CC #2 then #6. |
| KEL-DEVICE-001 | 2026-11-15 | Acceptance | pending | Browser offline, physical-device, narration and child/parent acceptance are unverified. | Initialization scope | Execute docs/TEST_PLAN.md after implementation. |
| KEL-DEFAULTS-001 | 2026-11-15 | Editorial | proposed | en-GB locale, 12 colors and 2–3/4–5 pacing are starter defaults, not owner approval of accent or voice. | docs/COURSE_DATA_SPEC.md | Gemini proposes content, adult review confirms. |

## Current work

#1 initialization; next parallel work #2/#3/#4. #5 policy evidence blocks ElevenLabs #7, while app/content development can proceed. Source merge is not proof of hosting or APK deployment.

## Superseded decisions

None.
