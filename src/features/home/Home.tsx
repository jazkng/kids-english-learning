import type { Lesson, Subject } from '../../contracts/course.ts';
import { subjectInfo } from '../../services/content.ts';
import { Teacher } from '../teacher/Teacher.tsx';
import { Visual } from '../lesson/Visual.tsx';

export function Home({ onSubject, onParent, notice }: { onSubject: (s: Subject) => void; onParent: () => void; notice?: string }) {
  return (
    <section className="home">
      <header className="home-head">
        <Teacher state="idle" size={120} />
        <button className="parent-btn" aria-label="Grown-ups" onClick={onParent}>⚙︎</button>
      </header>
      <div className="subjects" role="group" aria-label="Learning areas">
        {subjectInfo.map((s) => (
          <button key={s.id} className={`subject-tile s-${s.id}`} aria-label={s.title} onClick={() => onSubject(s.id)}>
            <span className="symbol" aria-hidden="true">{s.symbol}</span>
            <span className="tile-title">{s.title}</span>
          </button>
        ))}
      </div>
      {notice && <aside role="status">{notice}</aside>}
    </section>
  );
}

export function LessonList({ subject, lessons, done, onOpen, onBack }: {
  subject: Subject; lessons: Lesson[]; done: string[]; onOpen: (l: Lesson) => void; onBack: () => void;
}) {
  const info = subjectInfo.find((s) => s.id === subject);
  return (
    <section className="lesson-list">
      <header className="list-head">
        <button className="ctl" aria-label="Back" onClick={onBack}>◀</button>
        <h1>{info?.title}</h1>
      </header>
      {lessons.length === 0 && <p role="status">No lessons yet.</p>}
      {(['2-3', '4-5'] as const).map((band) => {
        const group = lessons.filter((l) => l.ageBand === band);
        if (!group.length) return null;
        return (
          <div key={band} className="band">
            <h2 className="band-label">Age {band.replace('-', '–')}</h2>
            <div className="lesson-grid">
              {group.map((l) => {
                const first = l.steps[0].visual;
                return (
                  <button key={l.id} className="lesson-tile" aria-label={`${l.title}${done.includes(l.id) ? ', finished' : ''}`} onClick={() => onOpen(l)}>
                    <Visual {...first} small />
                    {done.includes(l.id) && <span className="check" aria-hidden="true">⭐</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
