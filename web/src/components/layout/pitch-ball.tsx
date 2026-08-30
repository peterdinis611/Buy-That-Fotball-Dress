import { useId } from "react";

export function PitchBall({ className = "" }: { className?: string }) {
  const raw = useId().replace(/:/g, "");
  const leather = `${raw}-leather`;
  const clip = `${raw}-clip`;

  return (
    <svg
      className={`pitch-ball ${className}`}
      viewBox="0 0 120 120"
      aria-hidden
    >
      <defs>
        <radialGradient id={leather} cx="34%" cy="28%">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="52%" stopColor="#ece6d6" />
          <stop offset="100%" stopColor="#b8b09c" />
        </radialGradient>
        <clipPath id={clip}>
          <circle cx="60" cy="56" r="46" />
        </clipPath>
      </defs>

      <ellipse className="pitch-ball-shadow" cx="60" cy="108" rx="30" ry="7" />

      <g className="pitch-ball-face">
        <g clipPath={`url(#${clip})`}>
          <circle cx="60" cy="56" r="46" fill={`url(#${leather})`} />

          <polygon fill="#161616" points="60,34 78,47.2 71.1,68.4 48.9,68.4 42,47.2" />
          <polygon fill="#161616" points="60,-4 78,12 68,28 52,28 42,12" />
          <polygon fill="#161616" points="108,48 124,68 110,86 90,78 92,56" />
          <polygon fill="#161616" points="12,48 -4,68 10,86 30,78 28,56" />
          <polygon fill="#161616" points="28,96 48,108 44,128 16,128 8,108" />
          <polygon fill="#161616" points="92,96 72,108 76,128 104,128 112,108" />

          <g
            fill="none"
            stroke="#161616"
            strokeWidth="1.7"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d="M60 34 L60 12" />
            <path d="M78 47.2 L102 36" />
            <path d="M71.1 68.4 L88 92" />
            <path d="M48.9 68.4 L32 92" />
            <path d="M42 47.2 L18 36" />
            <path d="M78 47.2 L71.1 68.4 L48.9 68.4 L42 47.2 L60 34 Z" />
            <path d="M78 47.2 L96 58 L88 92" />
            <path d="M42 47.2 L24 58 L32 92" />
            <path d="M71.1 68.4 L60 86 L48.9 68.4" />
          </g>

          <ellipse cx="42" cy="38" rx="16" ry="9" fill="#fff" opacity="0.22" />
        </g>
        <circle cx="60" cy="56" r="46" fill="none" stroke="#161616" strokeWidth="3.2" />
      </g>
    </svg>
  );
}
