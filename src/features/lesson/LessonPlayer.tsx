import { useEffect, useReducer, useState } from 'react';
import { audioController } from '../../services/audio.ts';
import { audioEntry } from '../../services/content.ts';
import { Teacher } from '../teacher/Teacher.tsx';
import { initEngine, lessonCompleted, type PlayableLesson as Lesson, reduce, teacherState, type EngineAction, type EngineState } from './engine.ts';
import { Visual, conceptValue } from './Visual.tsx';

interface Props {
  lesson: Lesson;
  soundEnabled: boolean;
  nextLesson?: Lesson;
  onFinish: (completed: boolean) => void;
  onExit: () => void;
  onOpen: (lesson: Lesson) => void;
}

export function LessonPlayer(props: Props) {
  // Keyed by lesson id in the parent so switching lessons always starts a fresh engine.
  const { lesson, soundEnabled } = props;
  const [state, dispatch] = useReducer((s: EngineState, a: EngineAction) => reduce(s, a, lesson), lesson, (l) => initEngine(l));
  const [reported, setReported] = useState(false);
  const step = lesson.steps[state.stepIndex];
  // Last wrong tap, only for a gentle shake animation; cleared whenever the step or attempt changes.
  const [wrongId, setWrongId] = useState<string | null>(null);
  useEffect(() => { if (state.feedback !== 'retry') setWrongId(null); }, [state.stepIndex, state.feedback]);

  useEffect(() => {
    if (state.paused || !state.audioId) { audioController.stop(); return; }
    const { token, audioId } = state;
    if (!soundEnabled) { dispatch({ type: 'audio-done', token, outcome: 'muted' }); return; }
    audioController.play(audioId).then((o) => { if (o !== 'cancelled') dispatch({ type: 'audio-done', token, outcome: o }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.token]);

  useEffect(() => {
    // 👑 Backgrounding pauses narration; returning requires an explicit tap (no surprise audio).
    const onHide = () => { if (document.visibilityState === 'hidden') dispatch({ type: 'pause' }); };
    document.addEventListener('visibilitychange', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); audioController.stop(); };
  }, []);

  useEffect(() => {
    if (state.phase === 'done' && !reported) { setReported(true); props.onFinish(lessonCompleted(state)); }
    if (state.phase !== 'done' && reported) setReported(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const caption = state.line ? audioEntry(state.line)?.text : undefined;
  const showCaption = !soundEnabled || state.audioIssue !== null;
  const canNext = state.phase === 'await-next' || (state.phase === 'speaking' && step.kind !== 'choice');
  const progress = state.phase === 'done' ? 1 : state.stepIndex / lesson.steps.length;

  if (state.phase === 'done') {
    return (
      <section className="player done" aria-label="Lesson finished">
        <Teacher state="celebrating" size={200} />
        <div className="stars" aria-hidden="true"><span>⭐</span><span>⭐</span><span>⭐</span></div>
        <Confetti />
        {state.audioFailed && <p className="adult-note" role="status">Adult note: teacher audio was missing, so this lesson was not saved as finished.</p>}
        <div className="done-actions">
          <button className="big-btn" aria-label="Play again" onClick={() => props.onOpen(lesson)}>↻</button>
          <button className="big-btn" aria-label="Back to lessons" onClick={props.onExit}>🏠</button>
          {props.nextLesson && <button className="big-btn primary" aria-label="Next lesson" onClick={() => props.onOpen(props.nextLesson!)}>▶</button>}
        </div>
      </section>
    );
  }

  return (
    <section className="player" aria-label={lesson.title}>
      <div className="lesson-progress" aria-hidden="true"><span style={{ width: `${progress * 100}%` }} /></div>
      <div key={state.stepIndex} className={`stage ${step.kind === 'choice' ? 'choice-stage' : ''}`}>
        <Teacher state={teacherState(state)} size={step.kind === 'choice' ? 96 : 160} />
        {/* A sum is the question itself, so it stays visible while the child picks the answer. */}
        {(step.kind !== 'choice' || step.visual.kind === 'sum') && <Visual {...step.visual} />}
        {/* 👑 The printed word would give away its first letter, so the picture-only question hides it. */}
        {step.kind === 'choice' && step.choiceKind && <div className="hide-word-label"><Visual {...step.visual} /></div>}
        {step.kind === 'choice' && (
          <div className={`choices n${state.choiceOrder.length}`} role="group" aria-label="Choices">
            {state.choiceOrder.map((id) => {
              const c = step.choices!.find((x) => x.id === id)!;
              const hint = state.hint && id === step.correctChoiceId;
              const won = state.feedback === 'success' && id === step.correctChoiceId;
              const wrong = state.feedback === 'retry' && id === wrongId;
              return (
                <button key={id} className={`choice ${hint ? 'hint' : ''} ${won ? 'won' : ''} ${wrong ? 'wrong' : ''}`} aria-label={c.label}
                  disabled={state.phase !== 'await-choice' || state.paused} onClick={() => { if (id !== step.correctChoiceId) setWrongId(id); dispatch({ type: 'choose', choiceId: id }); }}>
                  <Visual kind={step.choiceKind ?? (step.visual.kind === 'sum' ? 'quantity' : step.visual.kind)} value={conceptValue(c.conceptId)} label={c.label} small />
                </button>
              );
            })}
          </div>
        )}
      </div>
      {state.feedback === 'success' && <Confetti key={state.token} />}
      {showCaption && caption && (
        <p className="caption" role="status">
          {state.audioIssue && <span className="badge">🔇 Audio not ready — adult, please read:</span>} “{caption}”
        </p>
      )}
      {state.audioIssue === 'blocked' && <p className="adult-note" role="status">Tap ↻ to hear the teacher.</p>}
      <nav className="controls" aria-label="Lesson controls">
        <button className="ctl" aria-label="Exit lesson" onClick={props.onExit}>✕</button>
        <button className="ctl" aria-label="Back" disabled={state.stepIndex === 0} onClick={() => dispatch({ type: 'back' })}>◀</button>
        <button className="ctl" aria-label="Replay" onClick={() => dispatch({ type: 'replay' })}>↻</button>
        <button className="ctl" aria-label={state.paused ? 'Play' : 'Pause'} onClick={() => dispatch({ type: state.paused ? 'resume' : 'pause' })}>{state.paused ? '▶' : '⏸'}</button>
        <button className={`ctl ${state.phase === 'await-next' ? 'pulse' : ''}`} aria-label="Next" disabled={!canNext || state.paused} onClick={() => dispatch({ type: 'next' })}>▶▶</button>
      </nav>
      {state.paused && (
        <button className="paused-overlay" aria-label="Play" onClick={() => dispatch({ type: 'resume' })}><span>▶</span></button>
      )}
    </section>
  );
}

const BITS = ['⭐', '✨', '🎉', '🌟', '💛', '🎈'];
// Decorative celebration burst; hidden from assistive tech and removed entirely under reduced motion via CSS.
function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} style={{ ['--x' as string]: `${(i * 37) % 100}%`, ['--d' as string]: `${(i % 5) * 0.06}s`, ['--r' as string]: `${(i * 53) % 360}deg` }}>{BITS[i % BITS.length]}</span>
      ))}
    </div>
  );
}
