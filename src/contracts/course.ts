export type Subject = 'abc' | 'numbers' | 'colors';
export type ReviewStatus = 'draft' | 'reviewed' | 'approved';
export type TeacherState = 'idle' | 'speaking' | 'waiting' | 'celebrating';
export interface Choice { id: string; label: string; conceptId: string }
export interface LessonStep {
  id: string;
  kind: 'teach' | 'demo' | 'choice' | 'review';
  conceptId: string;
  promptAudioId: string;
  visual: { kind: 'letter' | 'quantity' | 'color'; value: string; label: string };
  choices?: Choice[];
  correctChoiceId?: string;
  successAudioId?: string;
  retryAudioId?: string;
}
export interface Lesson {
  schemaVersion: 1;
  id: string;
  version: string;
  subject: Subject;
  title: string;
  locale: 'en-GB';
  ageBand: '2-3' | '4-5';
  status: ReviewStatus;
  conceptIds: string[];
  steps: LessonStep[];
}
export interface ProgressV1 {
  schemaVersion: 1;
  contentVersion: string;
  completedLessonIds: string[];
  lastLessonId?: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
}
