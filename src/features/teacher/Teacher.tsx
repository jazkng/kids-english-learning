import type { TeacherState } from '../../contracts/course.ts';

// Original cartoon owl teacher drawn inline so it ships offline with no image requests.
export function Teacher({ state, size = 160 }: { state: TeacherState; size?: number }) {
  return (
    <div className={`teacher teacher-${state}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <g className="teacher-body">
          <ellipse cx="100" cy="128" rx="66" ry="62" fill="#5b8def" />
          <ellipse cx="100" cy="140" rx="42" ry="40" fill="#cfe0ff" />
          <path d="M44 72 L58 30 L80 62 Z" fill="#3f6fd1" />
          <path d="M156 72 L142 30 L120 62 Z" fill="#3f6fd1" />
          <circle cx="100" cy="86" r="58" fill="#5b8def" />
          <g className="teacher-eyes">
            <circle cx="76" cy="82" r="20" fill="#fff" />
            <circle cx="124" cy="82" r="20" fill="#fff" />
            <circle className="pupil" cx="78" cy="84" r="9" fill="#1d2b4f" />
            <circle className="pupil" cx="122" cy="84" r="9" fill="#1d2b4f" />
            <rect className="lid" x="54" y="60" width="92" height="0" fill="#5b8def" />
          </g>
          <path className="beak" d="M92 104 L108 104 L100 118 Z" fill="#f6a623" />
          <ellipse className="mouth" cx="100" cy="122" rx="8" ry="0" fill="#9c3d2e" />
          <ellipse cx="62" cy="106" rx="9" ry="5" fill="#ff9db0" opacity=".7" />
          <ellipse cx="138" cy="106" rx="9" ry="5" fill="#ff9db0" opacity=".7" />
          <path className="wing wing-l" d="M38 120 Q20 150 44 172 Q50 146 52 126 Z" fill="#3f6fd1" />
          <path className="wing wing-r" d="M162 120 Q180 150 156 172 Q150 146 148 126 Z" fill="#3f6fd1" />
          <rect x="70" y="34" width="60" height="10" rx="3" fill="#1d2b4f" />
          <rect x="88" y="22" width="24" height="14" rx="3" fill="#1d2b4f" />
        </g>
        <g className="teacher-stars">
          <text x="18" y="46" fontSize="26">⭐</text>
          <text x="160" y="40" fontSize="22">✨</text>
        </g>
      </svg>
    </div>
  );
}
