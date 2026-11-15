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

## Lines in this slice
40 lines: `abc.letter-{a,b,c}.*`, `numbers.number-{0..3}.*`, `colors.color-{red,blue,yellow}.*` (teach/demo/choice/review each). Feedback reuses `shared.great` / `shared.try-again`.
