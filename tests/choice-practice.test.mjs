import assert from 'node:assert/strict';
import test from 'node:test';
import { withMoreChoices } from '../src/services/choice-practice.ts';
import { initEngine, reduce, lessonCompleted } from '../src/features/lesson/engine.ts';
import { loadContent, validateContent } from '../scripts/validate-content.mjs';

const data = loadContent();
const find = (id) => data.lessons.find((lesson) => lesson.id === id);
const choice = (lesson) => lesson.steps.find((step) => step.kind === 'choice');
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

test('all basic lessons gain age-banded choices without changing any audio, target or authored option', () => {
  const before = JSON.stringify(data);
  const expanded = data.lessons.map((lesson) => withMoreChoices(freeze(structuredClone(lesson))));
  assert.deepEqual(validateContent({ ...data, lessons: expanded }), []);
  for (let i = 0; i < expanded.length; i++) {
    const original = data.lessons[i]; const actual = expanded[i];
    for (let j = 0; j < original.steps.length; j++) {
      const old = original.steps[j]; const step = actual.steps[j];
      assert.deepEqual({ ...step, choices: old.choices }, { ...old, choices: old.choices });
      if (old.kind !== 'choice') continue;
      assert.equal(step.choices.length, Math.max(old.choices.length, original.ageBand === '2-3' ? 3 : 4));
      assert.deepEqual(step.choices.slice(0, old.choices.length), old.choices);
      assert.equal(new Set(step.choices.map((c) => c.conceptId)).size, step.choices.length);
      assert.equal(step.choices.filter((c) => c.conceptId === step.conceptId).length, 1);
    }
    assert.deepEqual(withMoreChoices(actual), actual);
  }
  assert.equal(JSON.stringify(data), before);
});

test('number distractors stay close and inside 0–10 / 0–100, including the boundaries', () => {
  for (const id of ['numbers.number-0', 'numbers.number-10', 'numbers.teen-11', 'numbers.tens-100']) {
    const lesson = find(id); const step = choice(withMoreChoices(lesson));
    const added = step.choices.slice(choice(lesson).choices.length);
    const max = lesson.ageBand === '2-3' ? 10 : 100;
    for (const option of added) {
      const n = Number(option.conceptId.split('.')[1]);
      assert.ok(n >= 0 && n <= max);
      assert.ok(Math.abs(n - Number(step.conceptId.split('.')[1])) <= 3);
    }
  }
});

test('extra basic colors stay in the familiar palette and added IDs cannot collide', () => {
  const lesson = structuredClone(find('colors.color-red'));
  choice(lesson).choices[1].id = 'practice-orange';
  const expanded = choice(withMoreChoices(lesson));
  assert.equal(new Set(expanded.choices.map((c) => c.id)).size, expanded.choices.length);
  assert.ok(expanded.choices.every((c) => ['red', 'blue', 'yellow', 'green', 'orange', 'purple'].includes(c.conceptId.split('.')[1])));
  const complete = withMoreChoices(withMoreChoices({ ...lesson, ageBand: '4-5' }));
  assert.equal(choice(complete).choices.length, 4);
});

test('three/four-option retry, Replay and completion keep using the original teacher lines and answer', () => {
  for (const id of ['abc.letter-a', 'numbers.teen-11']) {
    const lesson = withMoreChoices(find(id));
    let s = initEngine(lesson, 12);
    const dispatch = (action) => { s = reduce(s, action, lesson); };
    const ended = () => dispatch({ type: 'audio-done', token: s.token, outcome: 'ended' });
    while (lesson.steps[s.stepIndex].kind !== 'choice') ended();
    const step = lesson.steps[s.stepIndex]; ended();
    const order = [...s.choiceOrder];
    assert.equal(order.length, lesson.ageBand === '2-3' ? 3 : 4);
    dispatch({ type: 'choose', choiceId: step.choices.at(-1).id });
    assert.equal(s.audioId, step.retryAudioId); ended(); assert.equal(s.hint, true);
    dispatch({ type: 'replay' }); assert.deepEqual(s.choiceOrder, order); ended();
    dispatch({ type: 'choose', choiceId: step.correctChoiceId });
    assert.equal(s.audioId, step.successAudioId); ended();
    while (s.phase !== 'done') ended();
    assert.equal(lessonCompleted(s), true);
  }
});

test('seeded shuffle can place the answer in every slot and never loses or duplicates a choice', () => {
  const lesson = withMoreChoices(find('numbers.teen-11'));
  const positions = new Set();
  for (let seed = 0; seed < 128; seed++) {
    let s = initEngine(lesson, seed * 7919);
    while (lesson.steps[s.stepIndex].kind !== 'choice') s = reduce(s, { type: 'audio-done', token: s.token, outcome: 'ended' }, lesson);
    const step = lesson.steps[s.stepIndex];
    assert.deepEqual([...s.choiceOrder].sort(), step.choices.map((c) => c.id).sort());
    positions.add(s.choiceOrder.indexOf(step.correctChoiceId));
  }
  assert.equal(positions.size, 4);
});
