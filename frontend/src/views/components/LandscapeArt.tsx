/** Decorative, theme-aware artwork. No text, member imagery, or private data. */
export function LandscapeArt({ className = '' }: { className?: string }) {
  return (
    <svg className={`landscape-art ${className}`} viewBox="0 0 600 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path className="landscape-sky" d="M0 0h600v180H0z" />
      <circle className="landscape-sun" cx="443" cy="61" r="32" />
      <path className="landscape-far" d="M0 150 84 97 142 116 235 57 310 95 387 76 465 110 546 51 600 73V180H0Z" />
      <path className="landscape-mid" d="M0 151q74-54 148-22t161-17 150 5 141-17v80H0Z" />
      <path className="landscape-near" d="M0 162q92-33 178 0t176-8 246-9v35H0Z" />
      <g className="landscape-sprig" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M38 180q16-41 8-93m0 39-18-17m21 36 20-24m-23-15 15-18" />
        <path d="M28 109q-19-1-15-20 18 1 15 20m41 12q18-5 13-22-18 6-13 22M61 88q16-4 12-19-17 5-12 19M46 106q-15-9-9-22 14 5 9 22" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
