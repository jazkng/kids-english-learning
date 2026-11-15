import { useEffect, useRef, useState } from 'react';
import type { ProgressV1 } from '../../contracts/course.ts';

// Friction for children only (long press); not authentication or verified parental consent.
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const [held, setHeld] = useState(0);
  const timer = useRef<number | null>(null);
  const stop = () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; setHeld(0); };
  const start = () => {
    stop();
    const t0 = performance.now();
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / 3000);
      setHeld(p);
      if (p >= 1) { stop(); onPass(); }
    }, 50);
  };
  useEffect(() => {
    // 👑 A background tab or lost window focus must never finish a child's abandoned hold.
    const onHide = () => { if (document.visibilityState === 'hidden') stop(); };
    window.addEventListener('blur', stop);
    document.addEventListener('visibilitychange', onHide);
    return () => { stop(); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', onHide); };
  }, []);
  return (
    <Modal onClose={onCancel} label="Grown-ups only">
      <h2>Grown-ups only</h2>
      <p>Press and hold the button for 3 seconds.</p>
      <button className="hold-btn" onPointerDown={(e) => { if (e.button === 0) start(); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); }
        }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); stop(); } }} onBlur={stop}
        onContextMenu={(e) => e.preventDefault()} style={{ ['--p' as string]: held }}>Hold</button>
      <button className="text-btn" onClick={onCancel}>Cancel</button>
    </Modal>
  );
}

export function Modal({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    // 👑 Trap focus and restore it on close; background settings must not be operable through a dialog.
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // 👑 Lock body scroll while a modal is open (iOS Safari otherwise scrolls the page behind it).
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const controls = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
    ) ?? []).filter((el) => !el.hidden);
    const focusFirst = () => (controls()[0] ?? dialog.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close.current(); }
      if (e.key === 'Tab') {
        const items = controls();
        const first = items[0];
        const last = items[items.length - 1];
        if (!first) { e.preventDefault(); dialog.current?.focus(); }
        else if (e.shiftKey && (document.activeElement === first || !dialog.current?.contains(document.activeElement))) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !dialog.current?.contains(document.activeElement))) {
          e.preventDefault(); first.focus();
        }
      }
    };
    const onFocus = (e: FocusEvent) => { if (!dialog.current?.contains(e.target as Node)) focusFirst(); };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('focusin', onFocus);
    focusFirst();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('focusin', onFocus);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div ref={dialog} tabIndex={-1} className="modal" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

interface AreaProps {
  progress: ProgressV1;
  storageOk: boolean;
  lessonCount: number;
  draft: boolean;
  offlineReady: boolean;
  updateReady: boolean;
  onUpdate: () => void;
  onChange: (p: Partial<ProgressV1>) => void;
  onReset: () => void;
  onClose: () => void;
}

export function ParentArea(p: AreaProps) {
  const [confirm, setConfirm] = useState(false);
  return (
    <section className="parent" aria-label="Parent settings">
      <header className="parent-head">
        <h1>Parent area</h1>
        <button className="ctl" aria-label="Close parent area" onClick={p.onClose}>✕</button>
      </header>
      <label className="toggle"><input type="checkbox" checked={p.progress.soundEnabled} onChange={(e) => p.onChange({ soundEnabled: e.target.checked })} />
        Teacher sound <small>Off: you read the teacher's lines aloud from the caption.</small></label>
      <label className="toggle"><input type="checkbox" checked={p.progress.reducedMotion} onChange={(e) => p.onChange({ reducedMotion: e.target.checked })} />
        Reduce motion</label>
      <dl className="facts">
        <dt>Finished lessons</dt><dd>{p.progress.completedLessonIds.length} / {p.lessonCount}</dd>
        <dt>Content</dt><dd>{p.progress.contentVersion}{p.draft ? ' (draft, adult preview only)' : ''}</dd>
        <dt>Offline</dt><dd>{p.offlineReady ? 'App files saved for offline use' : 'Not confirmed on this device'}</dd>
        {!p.storageOk && <><dt>Storage</dt><dd>Unavailable — progress will not be saved.</dd></>}
      </dl>
      {p.updateReady && <button className="wide-btn" onClick={p.onUpdate}>Install app update now</button>}
      <button className="wide-btn danger" onClick={() => setConfirm(true)}>Clear progress</button>
      <p className="small">No accounts, ads, tracking or recordings. Progress stays on this device.</p>
      {confirm && (
        <Modal onClose={() => setConfirm(false)} label="Clear progress?">
          <h2>Clear progress?</h2>
          <p>This removes finished lessons and settings for this app on this device.</p>
          <div className="row">
            <button className="wide-btn" onClick={() => setConfirm(false)}>Keep</button>
            <button className="wide-btn danger" onClick={() => { setConfirm(false); p.onReset(); }}>Clear</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
