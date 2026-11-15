import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Lesson, ProgressV1 } from '../contracts/course.ts';
import { Home, LessonList } from '../features/home/Home.tsx';
import { LessonPlayer } from '../features/lesson/LessonPlayer.tsx';
import { ParentArea, ParentGate } from '../features/parent/ParentArea.tsx';
import { contentVersion, findLesson, hasDraftContent, invalidLessonCount, lessons, lessonsFor } from '../services/content.ts';
import { AppNavigation } from '../services/navigation.ts';
import { clearProgress, defaultProgress, loadProgress, saveProgress } from '../services/progress.ts';
import { pwaState, refreshOfflineReady, subscribePwa } from '../services/pwa.ts';

const pwaSnapshot = () => `${pwaState.offlineReady}|${pwaState.updateReady}`;

export function App() {
  const [navigation] = useState(() => new AppNavigation(history, crypto.randomUUID()));
  const screen = useSyncExternalStore(navigation.subscribe, navigation.snapshot);
  const go = navigation.go;
  const [progress, setProgress] = useState<ProgressV1>(() => loadProgress(contentVersion));
  const [storageOk, setStorageOk] = useState(true);
  const [gate, setGate] = useState(false);
  useSyncExternalStore(subscribePwa, pwaSnapshot);

  useEffect(() => {
    if (screen.name === 'parent') void refreshOfflineReady();
  }, [screen.name]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => { setGate(false); navigation.restore(e.state); };
    // 👑 Returning from the background must not expose settings left unlocked by an adult.
    const onHide = () => {
      if (document.visibilityState === 'hidden') { setGate(false); navigation.lockParent(); }
    };
    window.addEventListener('popstate', onPop);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', navigation.lockParent);
    return () => {
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', navigation.lockParent);
    };
  }, [navigation]);

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
          // 👑 Restored lessons may have no app-owned predecessor; fall back to their subject list.
          onExit={() => navigation.back({ name: 'subject', subject: lesson.subject })}
          onFinish={(completed) => update({
            lastLessonId: lesson.id,
            ...(completed ? { completedLessonIds: [...new Set([...progress.completedLessonIds, lesson.id])] } : {}),
          })} />
      );
    }
  } else if (screen.name === 'subject') {
    body = <LessonList subject={screen.subject} lessons={lessonsFor(screen.subject)} done={progress.completedLessonIds}
      onOpen={(l) => go({ name: 'lesson', id: l.id, run: Date.now() })} onBack={() => navigation.back({ name: 'home' })} />;
  } else if (screen.name === 'parent') {
    body = <ParentArea progress={progress} storageOk={storageOk} lessonCount={lessons.length} draft={hasDraftContent}
      offlineReady={pwaState.offlineReady} updateReady={pwaState.updateReady} onUpdate={() => pwaState.apply?.()}
      onChange={update} onClose={() => navigation.back({ name: 'home' })}
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
