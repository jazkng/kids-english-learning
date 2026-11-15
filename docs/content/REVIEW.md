# Adult content and pronunciation review checklist (draft)

Locale: en-GB (provisional). Reviewer ticks each line after listening/reading; approval is recorded by Codex, never by the author.

## Letter scope decision
- Teach the letter **name** first ("This is B"), then one key word ("B is for ball").
- The letter **sound** is only modelled inside the key word; scripts never ask a TTS/voice to say an isolated phoneme. Target sounds are written in `delivery.pronunciationNote` (e.g. /b/ without an added "buh").
- Upper and lower case are shown together; uppercase is the tap target.

## Checklist per line
- [ ] Spoken text is plain English only (no stage directions, IPA or markup).
- [ ] Short (one idea), slow pace, warm tone; no "wrong", no shaming, no time pressure.
- [ ] Words match the picture: letters show the glyph; numbers show dots on a plate (0 = empty plate); colors show an apple shape plus the color word.
- [ ] Letter name vs sound follows the scope above; no schwa added to consonants.
- [ ] Number word matches numeral and dot count.
- [ ] Spelling of "colour" consistent if used (currently not used in spoken text).

## Special cases to listen for
- Z is "zed" (en-GB), H is "aitch", W is "double-you", R is non-rhotic.
- X uses "X is in box" because few child words start with x.
- Number scripts count every dot aloud up to ten ("one, two, … seven. Seven dots."); 0 is an empty plate.
- 11–19: "Thirteen is ten and three more"; stress "-teen". Tens: "Thirty is three tens"; stress the first syllable. Choices pair teens with their tens (13 vs 30) on purpose.
- 21–99: "Forty-eight is four tens and eight"; the picture shows tens bars plus ones dots, so scripts do not count every dot.
- Light blue is two words in speech and on screen.

## Lines covered
556 lines: `abc.letter-{a..z}.*`, `numbers.number-{0..10}.*`, `numbers.teen-*`, `numbers.tens-*`, `numbers.range-*`, `colors.color-*` for all 12 colors (teach/demo/choice/review each). Feedback reuses `shared.great` / `shared.try-again`.

## Generator safety

Run `node content/scripts/curriculum-v1.mjs` from the repository. It preflights the complete generated target set and manifest before writing. Reviewed/approved lessons, their referenced scripts, and any line carrying media metadata are preserved if unchanged; a differing target aborts with its stable ID and no planned content writes. Unrelated IDs remain intact. Repeated generation is idempotent. Make intentional reviewed-content revisions through an explicit reviewed change rather than downgrading status to bypass the guard. Automated tests use isolated copies and cover conflict/no-write cases.
