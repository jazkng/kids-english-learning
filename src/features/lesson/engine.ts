// Pure lesson state machine so playback, UI and tests share one source of truth.
// Kept free of React/DOM imports so Node's type stripping can run it in tests.
import type { Lesson, LessonStep, TeacherState } from '../../contracts/course.ts';

export type AudioOutcome = 'ended' | 'missing' | 'error' | 'blocked' | 'muted';
export type Phase = 'speaking' | 'await-next' | 'await-choice' | 'feedback' | 'done';

export interface EngineState {
  stepIndex: number;
  phase: Phase;
  feedback: 'success' | 'retry' | null;
  audioId: string | null;
  // Last requested line, kept after playback so captions stay in sync with the current step.
  line: string | null;
  // 👑 Every new audio request bumps the token; outcomes carrying an older token are ignored.
  token: number;
  paused: boolean;
  hint: boolean;
  choiceOrder: string[];
  audioIssue: AudioOutcome | null;
  // 👑 A lesson whose narration failed is not recorded as completed (TEST_PLAN §3).
  audioFailed: boolean;
  failedAudioRequests: string[];
  seed: number;
}

export type EngineAction =
  | { type: 'audio-done'; token: number; outcome: AudioOutcome }
  | { type: 'choose'; choiceId: string }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'replay' }
  | { type: 'pause' }
  | { type: 'resume' };

function order(step: LessonStep, seed: number): string[] {
  const ids = (step.choices ?? []).map((c) => c.id);
  if (ids.length < 2) return ids;
  // Deterministic rotation keeps the correct answer from always sitting in the same spot.
  const shift = Math.abs(seed) % ids.length;
  return [...ids.slice(shift), ...ids.slice(0, shift)];
}

function enter(state: EngineState, lesson: Lesson, stepIndex: number): EngineState {
  const step = lesson.steps[stepIndex];
  const seed = state.seed * 31 + stepIndex + 7;
  return {
    ...state, stepIndex, phase: 'speaking', feedback: null, audioId: step.promptAudioId, line: step.promptAudioId,
    token: state.token + 1, paused: false, hint: false, choiceOrder: order(step, seed), audioIssue: null, seed,
  };
}

export function initEngine(lesson: Lesson, seed = Date.now()): EngineState {
  const base: EngineState = {
    stepIndex: 0, phase: 'speaking', feedback: null, audioId: null, line: null, token: 0, paused: false, hint: false,
    choiceOrder: [], audioIssue: null, audioFailed: false, failedAudioRequests: [], seed: seed % 9973,
  };
  return enter(base, lesson, 0);
}

function advance(state: EngineState, lesson: Lesson): EngineState {
  const nextIndex = state.stepIndex + 1;
  if (nextIndex >= lesson.steps.length) return { ...state, phase: 'done', audioId: null, feedback: null, token: state.token + 1 };
  return enter(state, lesson, nextIndex);
}

const isFailure = (o: AudioOutcome) => o === 'missing' || o === 'error' || o === 'blocked';

export function reduce(state: EngineState, action: EngineAction, lesson: Lesson): EngineState {
  const step = lesson.steps[state.stepIndex];
  switch (action.type) {
    case 'audio-done': {
      if (action.token !== state.token || state.paused) return state;
      const ok = action.outcome === 'ended';
      const issue = ok || action.outcome === 'muted' ? null : action.outcome;
      // 👑 A successful replay resolves only that step's failed line, never an earlier skipped failure.
      const request = `${state.stepIndex}:${state.audioId}`;
      const failedAudioRequests = ok ? state.failedAudioRequests.filter((id) => id !== request)
        : isFailure(action.outcome) ? [...new Set([...state.failedAudioRequests, request])] : state.failedAudioRequests;
      const failed = failedAudioRequests.length > 0;
      if (state.phase === 'speaking') {
        if (step.kind === 'choice') return { ...state, phase: 'await-choice', audioId: null, audioIssue: issue, audioFailed: failed, failedAudioRequests };
        if (ok) return advance({ ...state, audioFailed: failed, failedAudioRequests }, lesson);
        return { ...state, phase: 'await-next', audioId: null, audioIssue: issue, audioFailed: failed, failedAudioRequests };
      }
      if (state.phase === 'feedback') {
        if (state.feedback === 'retry') return { ...state, phase: 'await-choice', audioId: null, hint: true, audioIssue: issue, audioFailed: failed, failedAudioRequests };
        if (ok) return advance({ ...state, audioFailed: failed, failedAudioRequests }, lesson);
        return { ...state, phase: 'await-next', audioId: null, audioIssue: issue, audioFailed: failed, failedAudioRequests };
      }
      return state;
    }
    case 'choose': {
      if (state.phase !== 'await-choice' || state.paused || step.kind !== 'choice') return state;
      const correct = action.choiceId === step.correctChoiceId;
      // Gentle retry: no score or penalty, the teacher demonstrates by highlighting the answer next time.
      return {
        ...state, phase: 'feedback', feedback: correct ? 'success' : 'retry',
        audioId: (correct ? step.successAudioId : step.retryAudioId) ?? null,
        line: (correct ? step.successAudioId : step.retryAudioId) ?? null, token: state.token + 1, audioIssue: null,
      };
    }
    case 'next':
      if (state.phase === 'done' || state.phase === 'await-choice' || (state.phase === 'feedback' && state.feedback === 'retry')) return state;
      if (step.kind === 'choice' && state.feedback !== 'success') return state;
      return advance(state, lesson);
    case 'back':
      return enter(state, lesson, Math.max(0, state.phase === 'done' ? lesson.steps.length - 1 : state.stepIndex - 1));
    case 'replay': {
      if (state.phase === 'done') return state;
      return { ...state, phase: 'speaking', feedback: null, audioId: step.promptAudioId, line: step.promptAudioId, token: state.token + 1, paused: false, audioIssue: null };
    }
    case 'pause':
      if (state.phase === 'done' || state.paused) return state;
      return { ...state, paused: true, token: state.token + 1 };
    case 'resume':
      // 👑 Resume only on an explicit tap; it replays the current prompt rather than surprising with background audio.
      if (!state.paused) return state;
      return reduce({ ...state, paused: false }, { type: 'replay' }, lesson);
  }
}

export function teacherState(state: EngineState): TeacherState {
  if (state.paused) return 'idle';
  if (state.phase === 'done' || state.feedback === 'success') return 'celebrating';
  if (state.audioId && (state.phase === 'speaking' || state.phase === 'feedback')) return 'speaking';
  if (state.phase === 'await-choice') return 'waiting';
  return 'idle';
}

export const lessonCompleted = (state: EngineState) => state.phase === 'done' && !state.audioFailed;
