function Mark() {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <path d="M6 6h14v6H12v8H6V6z" className="fill-accent" />
      <path d="M42 6H28v6h10v8h4V6z" className="fill-accent" />
      <path d="M6 42V28h6v8h8v6H6z" className="fill-accent" />
      <rect x="27" y="27" width="15" height="15" rx="3" className="fill-foreground" />
      <circle cx="34.5" cy="34.5" r="2.6" className="fill-background" />
    </svg>
  );
}

const scaffolded = [
  "Next.js PWA (installable, offline app shell)",
  "Supabase client wiring — waiting on real project keys",
  "Database schema + Row Level Security migrations",
  "TagPoint design tokens",
];

const next = [
  "Asset / Location / Cost Centre CRUD (office & admin screens)",
  "QR generation and printable labels",
  "Mobile scan-and-log flow with offline sync",
];

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-lg">
        <div className="flex items-center gap-3">
          <Mark />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Tag<span className="text-accent">Point</span>
            </h1>
            <p className="font-mono text-xs text-ink-muted">Scan the tag. See the asset.</p>
          </div>
        </div>

        <p className="mt-8 text-sm text-ink-muted">
          Phase 0 scaffold — the asset register itself isn&apos;t built yet.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="font-mono text-xs tracking-wide text-ink-faint uppercase">
              In place
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {scaffolded.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-good">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-xs tracking-wide text-ink-faint uppercase">
              Phase 1
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">
              {next.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-ink-faint">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
