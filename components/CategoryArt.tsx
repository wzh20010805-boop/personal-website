type CategoryArtProps = {
  kind: "prompts" | "tools" | "games" | "skills" | "agents" | "learning";
  className?: string;
};

const ink = "#35421F";
const cream = "#FFF8E8";

const illustrations = {
  prompts: (
    <>
      <path
        d="M39 32 133 28Q148 27 150 42L153 88Q154 104 138 106L79 108 52 127 55 108 44 109Q28 109 27 93L25 50Q24 34 39 32Z"
        fill={ink}
        stroke="none"
        transform="translate(6 6)"
      />
      <path
        d="M39 32 133 28Q148 27 150 42L153 88Q154 104 138 106L79 108 52 127 55 108 44 109Q28 109 27 93L25 50Q24 34 39 32Z"
        fill="#FF5C8A"
      />
      <path d="m43 55 14-1m-13 12 29-1" stroke={cream} />
      <path
        d="m85 50-10 8 11 8m23-19 10 8-10 9m-9-18-5 22"
        fill="none"
      />
      <path d="m46 85 37-1m12-1 23-1" />
      <path d="m20 18 5 5m20-14-2 9m114 89 9 2" />
      <path d="m139 7 3 9 9 2-8 5-1 9-6-7-9 1 5-8-3-8Z" fill={cream} strokeWidth="3" />
    </>
  ),
  tools: (
    <>
      <path d="m48 64 3-17q1-10 12-9l24 2q10 1 10 10l-1 14" fill="none" strokeWidth="10" />
      <path
        d="m106 65 15-27q-7-15 3-24l4 15 12 3 9-10q7 19-12 24l-14 26Z"
        fill={cream}
        transform="rotate(7 128 42)"
      />
      <path d="m38 65 104-1q10 0 11 10l2 39q0 10-10 11l-107 1q-10-1-10-11l-1-38q0-11 11-11Z" fill={ink} stroke="none" transform="translate(6 6)" />
      <path d="m38 65 104-1q10 0 11 10l2 39q0 10-10 11l-107 1q-10-1-10-11l-1-38q0-11 11-11Z" fill="#7BC043" />
      <path d="m28 84 45 6m28 0 52-8" fill="none" />
      <path d="m73 82 27-1-1 19-24 1Z" fill={cream} />
      <path d="m86 88 1 6m-42 17 20 1" />
      <path d="m15 54 8 4m-3-26 8 7m131 19 8-5" />
      <path d="m40 18 2-7m-6 3 9 1" strokeWidth="4" />
    </>
  ),
  games: (
    <>
      <path d="M87 45q-7-25 17-23t21-15" fill="none" />
      <path
        d="M59 43q-19-6-28 14-12 26-11 51 0 19 16 18 10-1 25-21l56-1q13 19 26 18 17-2 14-20-3-25-16-47-9-17-27-12Z"
        fill={ink}
        stroke="none"
        transform="translate(6 6)"
      />
      <path
        d="M59 43q-19-6-28 14-12 26-11 51 0 19 16 18 10-1 25-21l56-1q13 19 26 18 17-2 14-20-3-25-16-47-9-17-27-12Z"
        fill="#9B5DE5"
      />
      <path d="m49 59 13 1-1 12 12 1-1 13-12-1-1 12-13-1 1-12-12-1 1-13 12 1Z" fill={cream} strokeWidth="4" />
      <circle cx="120" cy="66" r="7" fill="#FFD93D" strokeWidth="4" />
      <circle cx="137" cy="81" r="7" fill="#FF5C8A" strokeWidth="4" />
      <path d="m84 87 5 1m10-1 5 1" />
      <path d="m33 103 4-8m102 9-4-8" stroke={cream} />
      <path d="m14 39 9 4m139-19 4-8m10 17 8-2" />
    </>
  ),
  skills: (
    <>
      <g transform="rotate(-12 77 72)">
        <rect x="30" y="25" width="83" height="100" rx="10" fill={ink} stroke="none" transform="translate(6 6)" />
        <rect x="30" y="25" width="83" height="100" rx="10" fill={cream} />
        <path d="m42 39 7 1m-8 10 7 1" />
      </g>
      <g transform="rotate(7 94 75)">
        <rect x="54" y="24" width="81" height="101" rx="10" fill={ink} stroke="none" transform="translate(6 6)" />
        <rect x="54" y="24" width="81" height="101" rx="10" fill="#FFD93D" />
        <path d="M72 46h28M72 59h39" />
        <path d="m72 82 5 5 9-10m-14 23 5 5 9-10" fill="none" />
        <path d="M98 84h16m-16 18h13" />
      </g>
      <path d="m126 74-5 34 12-6 10 10 4-36" fill="#FF5C8A" />
      <circle cx="137" cy="65" r="24" fill={cream} />
      <path d="m137 49 4 10 11 1-8 7 2 11-9-6-10 5 3-11-8-7 11-1Z" fill="#FFD93D" strokeWidth="3" />
      <path d="m146 17 4-8m9 18 8-2m-151 71 7-1" />
    </>
  ),
  agents: (
    <>
      <path d="m89 31 1-14" />
      <circle cx="90" cy="12" r="7" fill="#FFD93D" strokeWidth="4" />
      <path d="m42 74-14 3-5 20m114-23 15 4 7-15" fill="none" strokeWidth="7" />
      <path d="m70 113-3 13m45-13 5 13" strokeWidth="9" />
      <path d="m55 36 68-1q13 0 14 13l2 48q0 20-19 23l-58 1q-19-2-21-20l-1-48q-1-15 15-16Z" fill={ink} stroke="none" transform="translate(6 6)" />
      <path d="m55 36 68-1q13 0 14 13l2 48q0 20-19 23l-58 1q-19-2-21-20l-1-48q-1-15 15-16Z" fill="#FF7043" />
      <path d="m62 51 55-1q8 0 8 8l1 22q0 8-8 9l-56 1q-9-1-9-9V61q0-10 9-10Z" fill={cream} strokeWidth="4" />
      <path d="m72 63 1 8m34-9 1 8" strokeWidth="7" />
      <path d="M85 76q6 6 12-1" fill="none" strokeWidth="3" />
      <path d="m65 103 12 1m28-1 8-1" strokeWidth="4" />
      <circle cx="94" cy="104" r="4" fill="#FFD93D" strokeWidth="3" />
      <path d="m151 32 3-8m8 16 8-2M22 31l6 6" />
    </>
  ),
  learning: (
    <>
      <g transform="rotate(-7 88 74)">
        <path d="M46 27h89q10 0 10 10v82q0 9-10 9H49q-13 0-13-13V40q0-13 10-13Z" fill={ink} stroke="none" transform="translate(6 6)" />
        <path d="M46 27h89q10 0 10 10v82q0 9-10 9H49q-13 0-13-13V40q0-13 10-13Z" fill={cream} />
        <path d="M49 20h85q9 0 9 10v77H51q-15 0-15 12V34q0-14 13-14Z" fill="#3EC6E0" />
        <path d="M53 21v85" fill="none" />
        <path d="M72 49h49M72 63h36" />
        <path d="m82 81 4 7 8-4-3 8 7 5-9 1-2 8-5-7-9 2 4-8-6-6 9 1Z" fill={cream} strokeWidth="3" />
        <path d="M112 20h18v30l-9-6-9 6Z" fill="#FF5C8A" strokeWidth="4" />
        <path d="M52 116h77" strokeWidth="3" />
      </g>
      <path d="m17 48 8 2m132 37 9 3M23 22l7 6" />
      <path d="m149 13 3 8 9 1-7 5 1 9-7-6-8 3 4-8-5-7 9 1Z" fill="#FFD93D" strokeWidth="3" />
    </>
  ),
};

export function CategoryArt({ kind, className }: CategoryArtProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 140"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={ink}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {illustrations[kind]}
    </svg>
  );
}
