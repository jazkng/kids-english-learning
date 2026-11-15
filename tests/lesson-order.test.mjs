import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { compareLessons } from '../src/services/lesson-order.ts';

test('number lessons progress from 0 through 100 instead of sorting range/teen/tens IDs alphabetically', () => {
  const dir = new URL('../content/lessons/', import.meta.url);
  const lessons = readdirSync(dir).map((name) => JSON.parse(readFileSync(new URL(name, dir))))
    .filter((lesson) => lesson.subject === 'numbers').sort(compareLessons);
  const targets = lessons.flatMap((lesson) => lesson.conceptIds.map((id) => Number(id.split('.')[1])));
  assert.equal(targets[0], 0);
  assert.equal(targets.at(-1), 100);
  assert.deepEqual(new Set(targets), new Set(Array.from({ length: 101 }, (_, i) => i)));
  assert.ok(targets.every((n, index) => index === 0 || n >= targets[index - 1]));
});
