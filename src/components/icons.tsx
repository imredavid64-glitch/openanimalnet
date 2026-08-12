// Shared stroke-SVG icon set — the platform's visual language instead of
// emoji. All icons inherit currentColor so they work in light and dark mode.
import { ReactNode } from 'react';
import { AnimalCategory } from '@/types/animal/types';

function Svg({ children, className = 'w-4 h-4' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PawIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="6.8" cy="10" r="1.6" />
      <circle cx="10.5" cy="7" r="1.6" />
      <circle cx="13.5" cy="7" r="1.6" />
      <circle cx="17.2" cy="10" r="1.6" />
      <path d="M12 12.5c-2.7 0-4.4 2-4.4 4.3 0 1.8 1.4 3.2 3.1 3.2h2.6c1.7 0 3.1-1.4 3.1-3.2 0-2.3-1.7-4.3-4.4-4.3Z" />
    </Svg>
  );
}

export function SunIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Svg>
  );
}

export function MoonIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Svg>
  );
}

export function UsersIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
    </Svg>
  );
}

export function FilterIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 21v-7" />
      <path d="M4 10V3" />
      <path d="M12 21v-9" />
      <path d="M12 8V3" />
      <path d="M20 21v-5" />
      <path d="M20 12V3" />
      <path d="M1 14h6" />
      <path d="M9 8h6" />
      <path d="M17 16h6" />
    </Svg>
  );
}

export function AntennaIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 21h.01" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M8.46 16.54a6 6 0 0 1 0-9.08" />
      <path d="M15.54 16.54a6 6 0 0 0 0-9.08" />
    </Svg>
  );
}

export function GlobeIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
    </Svg>
  );
}

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Svg>
  );
}

export function DownloadIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </Svg>
  );
}

export function BookIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </Svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Svg>
  );
}

export function ScaleIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </Svg>
  );
}

export function BellIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  );
}

export function RobotIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <rect x="8" y="13" width="2" height="2" />
      <rect x="14" y="13" width="2" height="2" />
      <path d="M4 13H2" />
      <path d="M22 13h-2" />
    </Svg>
  );
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </Svg>
  );
}

export function ChartIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16v-5" />
      <path d="M11 16V8" />
      <path d="M15 16v-7" />
      <path d="M19 16V5" />
    </Svg>
  );
}

export function TrendIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
      <path d="M16 7h6v6" />
    </Svg>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </Svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M4 4l16 16" />
      <path d="M20 4 4 20" />
    </Svg>
  );
}

export function MessageIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5A5.98 5.98 0 0 1 16 8z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Svg>
  );
}

// Category glyphs — one recognizable line shape per class.
const CATEGORY_PATHS: Record<AnimalCategory, ReactNode> = {
  mammals: (
    <>
      <circle cx="6.8" cy="10" r="1.6" />
      <circle cx="10.5" cy="7" r="1.6" />
      <circle cx="13.5" cy="7" r="1.6" />
      <circle cx="17.2" cy="10" r="1.6" />
      <path d="M12 12.5c-2.7 0-4.4 2-4.4 4.3 0 1.8 1.4 3.2 3.1 3.2h2.6c1.7 0 3.1-1.4 3.1-3.2 0-2.3-1.7-4.3-4.4-4.3Z" />
    </>
  ),
  birds: (
    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
  ),
  reptiles: (
    <>
      <path d="M4 19c4-1 6-5 4-8S7 6 10 4c2-1.5 4-1.5 6-1" />
      <circle cx="17" cy="3.5" r="1.4" />
    </>
  ),
  amphibians: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  ),
  fish: (
    <>
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z" />
      <path d="M18 12v.5" />
      <path d="M16 17.93a9.77 9.77 0 0 1 0-11.86" />
    </>
  ),
  invertebrates: (
    <>
      <path d="M12 12c-2-3-5-3-6-6 3-1 5 1 6 4 1-3 3-5 6-4-1 3-4 3-6 6Z" />
      <path d="M12 12v8" />
      <circle cx="12" cy="20.5" r="1.2" />
    </>
  ),
  insects: (
    <>
      <path d="m8 2 1.88 1.88" />
      <path d="M14.12 3.88 16 2" />
      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9" />
      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
      <path d="M6 13H2" />
      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
      <path d="M22 13h-4" />
      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
    </>
  ),
  marine: (
    <>
      <circle cx="12" cy="5" r="3" />
      <path d="M12 22V8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </>
  ),
};

export function CategoryIcon({ category, className }: { category: AnimalCategory; className?: string }) {
  return <Svg className={className}>{CATEGORY_PATHS[category]}</Svg>;
}

// Data-category glyphs for the little trait bubbles on species cards.
const DATA_CATEGORY_PATHS: Record<string, ReactNode> = {
  biological: (
    <>
      <path d="M8 4c-2 2-2 14 0 16" />
      <path d="M16 4c2 2 2 14 0 16" />
      <path d="M8 8.5h8" />
      <path d="M8 15.5h8" />
    </>
  ),
  behavioral: (
    <>
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8" />
    </>
  ),
  ecological: (
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
  ),
  population: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16v-5" />
      <path d="M11 16V8" />
      <path d="M15 16v-7" />
      <path d="M19 16V5" />
    </>
  ),
  health: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  agricultural: (
    <>
      <path d="M12 22V8" />
      <path d="M12 8c-2 0-3-2-3-4 2 0 3 2 3 4Z" />
      <path d="M12 12c-2 0-3-2-3-4 2 0 3 2 3 4Z" />
      <path d="M12 16c-2 0-3-2-3-4 2 0 3 2 3 4Z" />
    </>
  ),
  shelter: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  'human-interaction': (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

export function DataCategoryIcon({ category, className }: { category: string; className?: string }) {
  return <Svg className={className}>{DATA_CATEGORY_PATHS[category] ?? <circle cx="12" cy="12" r="8" />}</Svg>;
}

// Alert severity glyphs for the monitoring feed.
export function SeverityIcon({ type, className }: { type: 'critical' | 'warning' | 'info'; className?: string }) {
  if (type === 'critical') {
    return (
      <Svg className={className}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </Svg>
    );
  }
  if (type === 'warning') {
    return (
      <Svg className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </Svg>
    );
  }
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </Svg>
  );
}
