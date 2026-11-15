# Course data contract v1

Canonical validators: schemas/lesson.schema.json and schemas/audio-manifest.schema.json. Example fixtures: content/lessons/*.sample.json. `npm run validate:content` accepts structurally correct drafts; `npm run check:release` applies the stricter shipping gate. CC consumes JSON, never parses prose documents as curriculum.

## Course identity

| Field | Rule |
|---|---|
| schemaVersion | Integer 1; breaking contract changes require a new schema and coordinated migration |
| id / version | Stable lowercase dotted/hyphenated ID; semantic version string. Never recycle an ID for a different concept |
| subject | abc, numbers, colors |
| locale | en-GB for this initial contract; one consistent English pronunciation style |
| ageBand | 2-3 or 4-5; not inferred from stored personal data |
| status | draft → reviewed → approved. Adult editorial review before approval |
| conceptIds | letter.a … letter.z; number.0 … number.100 inclusive; color.<catalog key> |
| steps | Each target has teach, demo, choice and review phases; IDs unique within lesson |

Defaults awaiting editorial validation: 2–3 years learn A–Z gradually, 0–10 and six basic colors; 4–5 years extend to 11–20, then tens and 21–100 with zero and one hundred explicit, plus all 12 colors. This is pacing guidance, not age exclusion. No expectation that a two-year-old must finish 0–100. Keep sessions around 2–4 minutes, one to three targets; actual duration is an editorial estimate until audio timing exists.

Colors: red, blue, yellow, green, orange, purple, pink, brown, black, white, grey, light-blue. Changing this set requires Codex to update the schema/catalog/coverage tests together. English UI title remains “Colors”; provisional en-GB narration spells “colour” consistently in scripts if used.

## Steps

All steps: id, kind, conceptId, promptAudioId, visual {kind, value, label}. For each target, the first occurrences must follow teach → demo → choice → review in array order; the runtime does not reorder curriculum phases. kind = teach/demo/choice/review. Visual kind matches the subject: letter/quantity/color. value matches the target: A, 0, red, etc.; label is an English accessible label.

Choice steps additionally require 2–4 choices {id,label,conceptId}, correctChoiceId, successAudioId, retryAudioId. Correct choice must match the step concept; distractors are distinct concepts within that subject. Non-choice steps omit these choice-only fields. Begin with two choices for younger learners. Randomize presentation in the runtime without moving correctChoiceId away from its semantic target.

Letters: distinguish letter names from phonemes. Do not synthesize phonics by relying on an ambiguous single-letter TTS input. Keep explicit pronunciation guidance in delivery.pronunciationNote for adult listening review. Avoid automatically appending a schwa to consonants. Gemini must document chosen letter-name/phonics scope in docs/content/REVIEW.md.

Numbers: zero uses no objects; 11–19 get their own explanation; tens/ones support larger values. English number spoken form and visual quantity must match, including 100. Colors: meaningful object examples, no “wrong” wording or dependence on hue alone for feedback. No personal questions, purchases, shaming, streak pressure or promises of learning outcomes.

## Audio manifest and scripts

content/audio/manifest.json contains schemaVersion, locale and entries. Each entry:

- id: stable audio ID referenced by steps, globally unique.
- text: exact spoken English only, max 250 characters; no stage directions or pause markup.
- delivery: pace (slow/normal), pauseAfterMs (0–5000), pronunciationNote (adult production guidance).
- status: draft/reviewed/approved; provider: pending/human/elevenlabs.
- file: null until produced, then public-relative audio/<safe-path>.mp3, .wav or .ogg; URLs and traversal prohibited.
- durationMs, bytes, sha256: measured final file metadata; null until final asset exists.
- textSha256: SHA-256 over exact UTF-8 text, so a script edit invalidates prior audio.
- licenseRef, approvalRef, voiceRef, modelRef: non-sensitive evidence references; null while pending. Human recordings use modelRef human-recording.

Spoken text lives once in this manifest. content/scripts may contain derived CSV/JSON export and editorial guidance; export must retain audio IDs and text hashes. Never put an API key, private correspondence or approval contract into this public repository. Approval references point to privately held evidence reviewed by the integration owner.

If provider=elevenlabs, validation requires approved policy metadata in content/policy-approvals.json; this metadata must reflect actual evidence, not just be edited to pass. Do not generate or integrate while issue #5 is blocked. No generation CLI is supplied at initialization.

## Required delivery

1. First integration slice: A–C, 0–3, red/blue/yellow; full teaching loop and all spoken lines, still draft.
2. Full coverage: A–Z, every integer 0–100, all catalog colors, divided into short progressive lessons and age bands.
3. docs/content/COVERAGE.md mapping targets → lesson IDs, plus docs/content/REVIEW.md for pronunciation/content review evidence.
4. Pass validation/tests, and request Codex review. Approval status does not come from the author alone.

Contract changes go through a separate Codex PR before consumers use new fields. Additive changes still need tests and backward compatibility for progress. CC and Gemini must not independently invent different audio IDs or step types.
