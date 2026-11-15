import type { AudioOutcome } from '../features/lesson/engine.ts';
import { audioUrl } from './content.ts';

// Single owner of narration so two lines can never overlap.
class AudioController {
  private el: HTMLAudioElement | null = null;
  private session = 0;
  private settle: ((o: AudioOutcome | 'cancelled') => void) | null = null;

  play(audioId: string): Promise<AudioOutcome | 'cancelled'> {
    this.stop();
    const session = ++this.session;
    const src = audioUrl(audioId);
    // 👑 No browser speech synthesis fallback: it is not an offline guarantee and voice is unapproved.
    if (!src) return Promise.resolve('missing');
    if (!this.el) { this.el = new Audio(); this.el.preload = 'auto'; }
    const el = this.el;
    return new Promise((resolve) => {
      const finish = (o: AudioOutcome | 'cancelled') => {
        if (this.settle !== finish) return;
        this.settle = null; el.onended = null; el.onerror = null;
        resolve(session === this.session ? o : 'cancelled');
      };
      this.settle = finish;
      el.onended = () => finish('ended');
      el.onerror = () => finish('error');
      el.src = src;
      // 👑 Autoplay policies reject play() without a recent tap; surface it so the child can tap Replay.
      el.play().catch((err: unknown) => finish((err as DOMException)?.name === 'NotAllowedError' ? 'blocked' : 'error'));
    });
  }

  stop() {
    this.session++;
    this.settle?.('cancelled');
    if (this.el) { this.el.pause(); this.el.removeAttribute('src'); this.el.load(); }
  }
}

export const audioController = new AudioController();
