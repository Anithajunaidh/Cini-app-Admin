'use client';

/** Non-functional search box (no backend endpoint yet). */
export function SearchBox() {
  return (
    <div className="flex w-[280px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <span className="shrink-0">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Search users, titles, ids…"
        className="w-full border-none bg-transparent text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none"
        aria-label="Search users, titles, ids"
      />
    </div>
  );
}
