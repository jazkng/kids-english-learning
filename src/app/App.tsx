import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { Lesson, ProgressV1, Subject } from '../contracts/course.ts';
import { Home, LessonList } from '../features/home/Home.tsx';
import { LessonPlayer } from '../features/lesson/LessonPlayer.tsx';
import { ParentArea, ParentGate } from '../features/parent/ParentArea.tsx';
import { contentVersion, findLesson, hasDraftContent, invalidLessonCount, lessons, lessonsFor } from '../services/content.ts';
import { clearProgress, defaultProgress, loadProgress, saveProgress } from '../services/progress.ts';
import { pwaState, subscribePwa } from '../services/pwa.ts';

type Screen =
  | { name: 'home' }
  | { name: 'subject'; subject: Subject }
  | { name: 'lesson'; id: string; run: number }
  | { name: 'parent' };

const pwaSnapshot = () => `${pwaState.offlineReady}|${pwaState.updateReady}`;

export function App() {
  const [screen, setScreen] = useState<Screen>(() => (history.state?.name ? history.state as Screen : { name: 'home' }));
  const [progress, setProgress] = useState<ProgressV1>(() => loadProgress(contentVersion));
  const [storageOk, setStorageOk] = useState(true);
  const [gate, setGate] = useState(false);
  useSyncExternalStore(subscribePwa, pwaSnapshot);

  // Screens live in history so the browser / Android hardware back button steps back one screen.
  const go = useCallback((s: Screen, replace = false) => {
    if (replace) history.replaceState(s, ''); else history.pushState(s, '');
    setScreen(s);
  }, []);
  useEffect(() => {
    if (!history.state?.name) history.replaceState({ name: 'home' }, '');
    const onPop = (e: PopStateEvent) => setScreen((e.state?.name ? e.state : { name: 'home' }) as Screen);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const update = (patch: Partial<ProgressV1>) => setProgress((p) => {
    const next = { ...p, ...patch };
    setStorageOk(saveProgress(next));
    return next;
  });

  useEffect(() => {
    const reduce = progress.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.toggle('reduce-motion', reduce);
  }, [progress.reducedMotion]);

  const notice = [
    hasDraftContent && 'Development preview for adults: lessons and teacher audio are drafts.',
    invalidLessonCount > 0 && `${invalidLessonCount} lesson file(s) could not be loaded and were skipped.`,
  ].filter(Boolean).join(' ');

  let body: React.ReactNode;
  if (screen.name === 'lesson') {
    const lesson = findLesson(screen.id);
    if (!lesson) body = <Home onSubject={(s) => go({ name: 'subject', subject: s }, true)} onParent={() => setGate(true)} notice="That lesson is not available." />;
    else {
      const list = lessonsFor(lesson.subject);
      const nextLesson = list[list.indexOf(lesson) + 1];
      const open = (l: Lesson) => go({ name: 'lesson', id: l.id, run: Date.now() }, true);
      body = (
        <LessonPlayer key={`${lesson.id}:${screen.run}`} lesson={lesson} soundEnabled={progress.soundEnabled} nextLesson={nextLesson}
          onOpen={open}
          // Lessons are pushed above their subject list, so Exit pops back instead of stacking duplicate entries.
          onExit={() => (history.length > 1 ? history.back() : go({ name: 'subject', subject: lesson.subject }, true))}
          onFinish={(completed) => update({
            lastLessonId: lesson.id,
            ...(completed ? { completedLessonIds: [...new Set([...progress.completedLessonIds, lesson.id])] } : {}),
          })} />
      );
    }
  } else if (screen.name === 'subject') {
    body = <LessonList subject={screen.subject} lessons={lessonsFor(screen.subject)} done={progress.completedLessonIds}
      onOpen={(l) => go({ name: 'lesson', id: l.id, run: Date.now() })} onBack={() => history.back()} />;
  } else if (screen.name === 'parent') {
    body = <ParentArea progress={progress} storageOk={storageOk} lessonCount={lessons.length} draft={hasDraftContent}
      offlineReady={pwaState.offlineReady} updateReady={pwaState.updateReady} onUpdate={() => pwaState.apply?.()}
      onChange={update} onClose={() => history.back()}
      onReset={() => { setStorageOk(clearProgress()); setProgress(defaultProgress(contentVersion)); }} />;
  } else {
    body = <Home onSubject={(s) => go({ name: 'subject', subject: s })} onParent={() => setGate(true)} notice={notice || undefined} />;
  }

  return (
    <main>
      {body}
      {gate && <ParentGate onCancel={() => setGate(false)} onPass={() => { setGate(false); go({ name: 'parent' }); }} />}
    </main>
  );
}
