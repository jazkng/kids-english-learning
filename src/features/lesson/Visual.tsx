import wordsData from '../../../content/activities/words.json';

const wordEmoji = wordsData.emoji as Record<string, { word: string; emoji: string }>;
const COLOR_HEX: Record<string, string> = {
  red: '#e53935', blue: '#1e63d6', yellow: '#fdd835', green: '#43a047', orange: '#fb8c00', purple: '#8e24aa',
  pink: '#f06292', brown: '#8d5524', black: '#222222', white: '#ffffff', grey: '#9e9e9e', 'light-blue': '#81d4fa',
};

function Quantity({ n, small }: { n: number; small?: boolean }) {
  // 👑 Zero is an empty plate, never a hidden element, so the child sees "nothing".
  if (n === 0) return <div className={`plate ${small ? 'small' : ''}`} />;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  // Large numbers use tens bars + ones dots instead of up to 100 tiny marks.
  return (
    <div className={`quantity ${small ? 'small' : ''}`}>
      {Array.from({ length: tens }, (_, i) => <span key={`t${i}`} className="ten-bar">{Array.from({ length: 10 }, (_, j) => <i key={j} />)}</span>)}
      {ones > 0 && <span className="ones">{Array.from({ length: ones }, (_, i) => <i key={i} className="dot" />)}</span>}
    </div>
  );
}

export function conceptValue(conceptId: string) { return conceptId.split('.').slice(1).join('.'); }

function Dots({ n, crossed = 0 }: { n: number; crossed?: number }) {
  return <span className="sum-dots">{Array.from({ length: n }, (_, i) => <i key={i} className={i >= n - crossed ? 'dot gone' : 'dot'} />)}</span>;
}

export function Visual({ kind, value, label, small }: { kind: string; value: string; label: string; small?: boolean }) {
  if (kind === 'word') {
    const item = wordEmoji[value];
    return <div className={`visual word ${small ? 'small' : ''}`} aria-label={label}><span className="emoji" aria-hidden="true">{item?.emoji ?? '❓'}</span><span className="word-label">{item?.word ?? label}</span></div>;
  }
  if (kind === 'sum') {
    const m = /^(\d+)([+-])(\d+)$/.exec(value);
    if (m) {
      const a = Number(m[1]); const b = Number(m[3]);
      // Subtraction shows the starting dots with the taken-away ones faded and crossed, so it can be counted.
      return (
        <div className={`visual sum ${small ? 'small' : ''}`} aria-label={label}>
          <span className="sum-text">{a} {m[2] === '+' ? '+' : '−'} {b}</span>
          {m[2] === '+'
            ? <span className="sum-groups"><Dots n={a} /><b aria-hidden="true">+</b><Dots n={b} /></span>
            : <span className="sum-groups"><Dots n={a} crossed={b} /></span>}
        </div>
      );
    }
  }
  if (kind === 'letter') {
    const v = value.toUpperCase();
    return <div className={`visual letter ${small ? 'small' : ''}`} aria-label={label}><span>{v}</span><span className="lower">{v.toLowerCase()}</span></div>;
  }
  if (kind === 'quantity') {
    const n = Number(value);
    return (
      <div className={`visual number ${small ? 'small' : ''}`} aria-label={label}>
        <span className="numeral">{value}</span>
        {Number.isInteger(n) && n >= 0 && n <= 100 && <Quantity n={n} small={small} />}
      </div>
    );
  }
  const hex = COLOR_HEX[value] ?? '#cccccc';
  // Color is shown on an apple shape plus an English label so meaning never depends on hue alone.
  return (
    <div className={`visual color ${small ? 'small' : ''}`} aria-label={label}>
      <svg viewBox="0 0 100 100" className="apple" aria-hidden="true">
        <path d="M50 28 C30 14 8 30 14 58 C20 84 40 94 50 88 C60 94 80 84 86 58 C92 30 70 14 50 28 Z" fill={hex} stroke="#333" strokeWidth="2.5" />
        <path d="M50 28 C50 18 54 10 60 6" stroke="#5d4037" strokeWidth="4" fill="none" />
        <path d="M54 18 C64 8 76 12 78 16 C70 22 60 22 54 18 Z" fill="#4caf50" />
      </svg>
      <span className="color-label">{label}</span>
    </div>
  );
}
