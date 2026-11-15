import assert from 'node:assert/strict';
import test from 'node:test';
import { AppNavigation } from '../src/services/navigation.ts';

function browser(initial = null) {
  const entries = [initial];
  let index = 0;
  let backCalls = 0;
  const history = {
    get state() { return entries[index]; },
    pushState(s) { entries.splice(++index); entries[index] = s; },
    replaceState(s) { entries[index] = s; },
    back() { backCalls++; if (index > 0) index--; },
  };
  const navigation = new AppNavigation(history, 'current-run');
  return { navigation, history, get backCalls() { return backCalls; }, forward() { if (index + 1 < entries.length) index++; navigation.restore(history.state); } };
}

test('home → subject → lesson → Next lesson → Back returns to subject without growing the lesson stack', () => {
  const b = browser(); const n = b.navigation;
  n.go({ name: 'subject', subject: 'numbers' });
  n.go({ name: 'lesson', id: 'numbers.number-0', run: 1 });
  n.go({ name: 'lesson', id: 'numbers.number-1', run: 2 }, true);
  n.back({ name: 'home' }); n.restore(b.history.state);
  assert.deepEqual(n.snapshot(), { name: 'subject', subject: 'numbers' });
  n.back({ name: 'home' }); n.restore(b.history.state);
  assert.deepEqual(n.snapshot(), { name: 'home' });
});

test('restoring a lesson after reload keeps it usable, but Exit never navigates into another app or site', () => {
  const lesson = { name: 'lesson', id: 'abc.letter-a', run: 1 };
  for (const initial of [lesson, { screen: lesson, session: 'previous-run', depth: 3 }]) {
    const b = browser(initial);
    assert.deepEqual(b.navigation.snapshot(), lesson);
    b.navigation.back({ name: 'subject', subject: 'abc' });
    assert.equal(b.backCalls, 0);
    assert.deepEqual(b.navigation.snapshot(), { name: 'subject', subject: 'abc' });
  }
});

test('parent access requires a new gate after Back/Forward, reload or a background lock', () => {
  const b = browser(); const n = b.navigation;
  n.go({ name: 'parent' });
  n.back({ name: 'home' }); n.restore(b.history.state); b.forward();
  assert.deepEqual(n.snapshot(), { name: 'home' });
  n.go({ name: 'parent' }); n.lockParent();
  assert.deepEqual(n.snapshot(), { name: 'home' });
  for (const initial of [{ name: 'parent' }, { screen: { name: 'parent' }, session: 'previous-run', depth: 1 }]) {
    assert.deepEqual(browser(initial).navigation.snapshot(), { name: 'home' });
  }
  n.restore({ screen: { name: 'parent' }, session: 'current-run', depth: 1 });
  assert.deepEqual(n.snapshot(), { name: 'home' });
});

test('corrupt and foreign history cannot render invalid subjects, lessons or unsafe back depths', () => {
  const invalid = [null, [], { name: 'subject', subject: 'unknown' }, { name: 'lesson', id: null, run: 2 },
    { name: 'lesson', id: '../a', run: 3 }, { name: 'lesson', id: 'a', run: Infinity }];
  for (const value of invalid) {
    const b = browser(value);
    assert.deepEqual(b.navigation.snapshot(), { name: 'home' });
    b.navigation.restore({ screen: { name: 'subject', subject: 'colors' }, session: 'other', depth: 100 });
    b.navigation.back({ name: 'home' });
    assert.equal(b.backCalls, 0);
  }
});
