import type { Lesson } from '../contracts/course.ts';

export function compareLessons(a: Lesson, b: Lesson): number {
  const band = a.ageBand.localeCompare(b.ageBand);
  if (band) return band;
  if (a.subject === 'numbers' && b.subject === 'numbers') {
    // 👑 File IDs such as range/teen/tens sort alphabetically; children must meet 11 before 21 and 100.
    const firstNumber = (lesson: Lesson) => Math.min(...lesson.conceptIds.map((id) => Number(id.slice('number.'.length))));
    const number = firstNumber(a) - firstNumber(b);
    if (number) return number;
  }
  return a.id.localeCompare(b.id, 'en', { numeric: true });
}
