export function PitchMarkings() {
  return (
    <svg
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full opacity-[0.18]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect x="3" y="4" width="94" height="92" fill="none" stroke="#eef6ea" strokeWidth="0.35" />
      <line x1="50" y1="4" x2="50" y2="96" stroke="#eef6ea" strokeWidth="0.28" />
      <circle cx="50" cy="50" r="11" fill="none" stroke="#eef6ea" strokeWidth="0.28" />
      <circle cx="50" cy="50" r="0.7" fill="#eef6ea" />
      <rect x="3" y="28" width="16" height="44" fill="none" stroke="#eef6ea" strokeWidth="0.28" />
      <rect x="3" y="38" width="7" height="24" fill="none" stroke="#eef6ea" strokeWidth="0.28" />
      <rect x="81" y="28" width="16" height="44" fill="none" stroke="#eef6ea" strokeWidth="0.28" />
      <rect x="90" y="38" width="7" height="24" fill="none" stroke="#eef6ea" strokeWidth="0.28" />
    </svg>
  );
}
