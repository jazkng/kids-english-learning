import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initEngine, reduce, lessonCompleted, teacherState } from '../src/features/lesson/engine.ts';
import { parseProgress, loadProgress, saveProgress } from '../src/services/progress.ts';

const lesson = JSON.parse(readFileSync(new URL('../content/lessons/abc.sample.json', import.meta.url)));
const run = (s, a) => reduce(s, a, lesson);
const done = (s, outcome = 'ended') => run(s, { type: 'audio-done', token: s.token, outcome });

test('full lesson with audio: teach → demo → wrong → retry hint → correct → review → completed', () => {
  let s = initEngine(lesson, 1);
  assert.equal(teacherState(s), 'speaking');
  s = done(s); assert.equal(lesson.steps[s.stepIndex].kind, 'demo');
  s = done(s); assert.equal(s.phase, 'speaking');
  s = done(s); assert.equal(s.phase, 'await-choice'); assert.equal(teacherState(s), 'waiting');
  s = run(s, { type: 'choose', choiceId: 'other' }); assert.equal(s.feedback, 'retry');
  s = done(s); assert.equal(s.phase, 'await-choice'); assert.equal(s.hint, true);
  s = run(s, { type: 'choose', choiceId: 'target' }); assert.equal(teacherState(s), 'celebrating');
  s = done(s); assert.equal(lesson.steps[s.stepIndex].kind, 'review');
  s = done(s); assert.equal(s.phase, 'done'); assert.equal(lessonCompleted(s), true);
});

test('stale audio callbacks are ignored after replay/back', () => {
  let s = initEngine(lesson, 1);
  const old = s.token;
  s = run(s, { type: 'replay' });
  const after = run(s, { type: 'audio-done', token: old, outcome: 'ended' });
  assert.equal(after, s);
});

test('missing audio waits for an explicit Next and blocks completion', () => {
  let s = initEngine(lesson, 1);
  s = done(s, 'missing'); assert.equal(s.phase, 'await-next'); assert.equal(s.audioIssue, 'missing');
  s = run(s, { type: 'next' }); s = done(s, 'missing'); s = run(s, { type: 'next' });
  s = done(s, 'missing'); assert.equal(s.phase, 'await-choice');
  assert.equal(run(s, { type: 'next' }), s, 'cannot skip a choice');
  s = run(s, { type: 'choose', choiceId: 'target' }); s = done(s, 'missing'); s = run(s, { type: 'next' });
  s = done(s, 'missing'); s = run(s, { type: 'next' });
  assert.equal(s.phase, 'done'); assert.equal(lessonCompleted(s), false);
});

test('muted (parent-chosen silent) lessons can complete', () => {
  let s = initEngine(lesson, 1);
  for (let i = 0; i < 20 && s.phase !== 'done'; i++) {
    if (s.phase === 'await-choice') s = run(s, { type: 'choose', choiceId: 'target' });
    else if (s.phase === 'await-next') s = run(s, { type: 'next' });
    else s = done(s, 'muted');
  }
  assert.equal(lessonCompleted(s), true);
});

test('pause keeps the step and ignores audio until explicit resume', () => {
  let s = done(initEngine(lesson, 1));
  const step = s.stepIndex;
  s = run(s, { type: 'pause' });
  assert.equal(done(s), s);
  s = run(s, { type: 'resume' });
  assert.equal(s.stepIndex, step); assert.equal(s.phase, 'speaking'); assert.equal(s.paused, false);
});

test('progress parsing recovers from corrupt or foreign data and storage failures', () => {
  assert.deepEqual(parseProgress('{bad', '1').completedLessonIds, []);
  assert.equal(parseProgress('{"schemaVersion":2}', '1').soundEnabled, true);
  const p = parseProgress('{"schemaVersion":1,"completedLessonIds":["a","a",3],"soundEnabled":false}', '1');
  assert.deepEqual(p.completedLessonIds, ['a']); assert.equal(p.soundEnabled, false);
  const denied = { get() { throw new Error('denied'); }, set() { throw new Error('quota'); }, remove() {} };
  assert.equal(loadProgress('1', denied).schemaVersion, 1);
  assert.equal(saveProgress(p, denied), false);
});

test('a blocked prompt can be replayed successfully without losing lesson completion', () => {
  let s = initEngine(lesson, 1);
  s = done(s, 'blocked');
  assert.equal(s.audioFailed, true);
  s = run(s, { type: 'replay' });
  s = done(s);
  assert.equal(s.audioFailed, false, 'successful retry resolves this prompt failure');
  for (let i = 0; i < 20 && s.phase !== 'done'; i++) {
    s = s.phase === 'await-choice' ? run(s, { type: 'choose', choiceId: 'target' }) : done(s);
  }
  assert.equal(lessonCompleted(s), true);
});

test('replaying a later step cannot erase an earlier skipped audio failure', () => {
  let s = done(initEngine(lesson, 1), 'error');
  s = run(s, { type: 'next' });
  s = run(s, { type: 'replay' });
  s = done(s);
  assert.equal(s.audioFailed, true);
});
