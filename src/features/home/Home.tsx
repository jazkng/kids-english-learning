import { useRef } from 'react';
import { subjectInfo } from '../../services/content.ts';
import { AREAS, extraAreas, type Area as Subject, type AreaLesson as Lesson } from '../../services/activities.ts';
import { Teacher } from '../teacher/Teacher.tsx';
import { Visual } from '../lesson/Visual.tsx';

function AreaArt({ area }: { area: Subject }) {
  if (area === 'abc') return <span className="art-letters" aria-hidden="true">A<span>a</span></span>;
  if (area === 'numbers') return <span className="art-numbers" aria-hidden="true"><i>1</i><i>2</i><i>3</i></span>;
  if (area === 'colors') return <svg className="art-colors" viewBox="0 0 100 64" aria-hidden="true"><circle cx="31" cy="25" r="21" fill="#e46c47" /><circle cx="68" cy="25" r="21" fill="#e9ba45" /><circle cx="50" cy="45" r="21" fill="#5d8eae" /></svg>;
  if (area === 'words') return <span className="art-word" aria-hidden="true">🍎</span>;
  return <span className="art-math" aria-hidden="true">＋<span>−</span></span>;
}

export function Home({ onSubject, onQuiz, onParent, notice }: {
  onSubject: (s: Subject) => void; onQuiz: (s: Subject) => void; onParent: () => void; notice?: string;
}) {
  const quizRail = useRef<HTMLDivElement>(null);
  const areas = [...subjectInfo, ...extraAreas];
  const basics = (['abc', 'numbers', 'colors'] as const).map((id) => areas.find((area) => area.id === id)!);
  const more = (['words', 'math'] as const).map((id) => areas.find((area) => area.id === id)!);
  const moveQuizzes = (direction: number) => quizRail.current?.scrollBy({ left: direction * 240 });
  return (
    <section className="home" aria-label="Learning home">
      <header className="home-head">
        <div className="home-brand"><span className="brand-mark" aria-hidden="true">Aa</span><span>Kids English<span className="brand-caption">Little steps, big discoveries</span></span></div>
        <button className="parent-btn" aria-label="Grown-ups" onClick={onParent}><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="2" /></svg></button>
      </header>
      <div className="home-welcome">
        <div><span className="home-kicker">YOUR LITTLE LEARNING CLUB</span><h1>Ready, set,<br /><em>let’s learn!</em></h1><p>Pick a picture. Play together.</p></div>
        <div className="welcome-teacher"><span className="welcome-spark" aria-hidden="true">✦</span><Teacher state="idle" size={132} /></div>
      </div>
      <section className="home-section" aria-labelledby="basics-title">
        <div className="home-section-head"><div><span className="section-index">01 · LEARN</span><h2 id="basics-title">The basics</h2></div><span className="section-flower" aria-hidden="true">✿</span></div>
        <div className="basic-row">
          {basics.map((s) => <button key={s.id} className={`learning-tile s-${s.id}`} aria-label={s.title} onClick={() => onSubject(s.id)}><AreaArt area={s.id} /><span className="learning-title">{s.title}</span><span className="tile-play" aria-hidden="true">↗</span></button>)}
        </div>
      </section>
      <section className="home-section" aria-labelledby="explore-title">
        <div className="home-section-head"><div><span className="section-index">02 · DISCOVER</span><h2 id="explore-title">More to explore</h2></div></div>
        <div className="explore-row">
          {more.map((s) => <button key={s.id} className={`learning-tile explore-tile s-${s.id}`} aria-label={s.title} onClick={() => onSubject(s.id)}><AreaArt area={s.id} /><span><span className="learning-title">{s.title}</span><span className="learning-detail">{s.id === 'words' ? 'Pictures & words' : 'Add & take away'}</span></span><span className="tile-play" aria-hidden="true">↗</span></button>)}
        </div>
      </section>
      <section className="home-section quiz-section" aria-labelledby="quizzes-title">
        <div className="home-section-head"><div><span className="section-index">03 · PLAY</span><h2 id="quizzes-title">Quiz time</h2></div><div className="rail-controls"><button aria-label="Previous quizzes" aria-controls="home-quiz-rail" onClick={() => moveQuizzes(-1)}>←</button><button aria-label="More quizzes" aria-controls="home-quiz-rail" onClick={() => moveQuizzes(1)}>→</button></div></div>
        <div ref={quizRail} id="home-quiz-rail" className="quiz-row" role="group" aria-label="Subject quizzes">
          {AREAS.map((id) => areas.find((area) => area.id === id)!).map((s) => <button key={s.id} className={`home-quiz s-${s.id}`} aria-label={`${s.title} quiz`} onClick={() => onQuiz(s.id)}><span className="quiz-star" aria-hidden="true">✦</span><span className="quiz-symbol" aria-hidden="true">{s.symbol}</span><span>{s.title}</span></button>)}
        </div>
      </section>
      <footer className="home-footer"><span aria-hidden="true">♡</span> A little learning, a lot of wonder.</footer>
      {notice && <aside className="home-notice" role="status">{notice}</aside>}
    </section>
  );
}

export function LessonList({ subject, lessons, done, onOpen, onBack, onQuiz }: {
  subject: Subject; lessons: Lesson[]; done: string[]; onOpen: (l: Lesson) => void; onBack: () => void; onQuiz: () => void;
}) {
  const info = [...subjectInfo, ...extraAreas].find((s) => s.id === subject);
  return (
    <section className="lesson-list">
      <header className="list-head">
        <button className="ctl" aria-label="Back" onClick={onBack}>◀</button>
        <h1>{info?.title}</h1>
        {lessons.length > 0 && <button className="quiz-btn" aria-label="Quiz" onClick={onQuiz}>⭐ Quiz</button>}
      </header>
      {lessons.length === 0 && <p role="status">No lessons yet.</p>}
      {(['2-3', '4-5'] as const).map((band) => {
        const group = lessons.filter((l) => l.ageBand === band);
        if (!group.length) return null;
        return (
          <div key={band} className="band">
            <h2 className="band-label">Age {band.replace('-', '–')}</h2>
            <div className="lesson-grid">
              {group.map((l, i) => {
                // Words open on a picture; Math on its first sum. Letter tiles show the letter for word lessons.
                const first = 'letter' in l && typeof l.letter === 'string' ? { kind: 'letter', value: l.letter, label: l.title } : l.steps[0].visual;
                return (
                  <button key={l.id} className="lesson-tile" style={{ ['--i' as string]: Math.min(i, 12) }} aria-label={`${l.title}${done.includes(l.id) ? ', finished' : ''}`} onClick={() => onOpen(l)}>
                    <span className="tile-visual"><Visual {...first} small /></span>
                    {/* Short caption helps adults pick a lesson; children navigate by the picture. */}
                    <span className="tile-caption" aria-hidden="true">{l.title}</span>
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
