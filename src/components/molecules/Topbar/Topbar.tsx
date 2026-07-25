interface TopbarProps {
  eyebrow: string;
  title: string;
}

export function Topbar({ eyebrow, title }: TopbarProps) {
  return (
    <div className="topbar">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <div className="page-title">{title}</div>
      </div>
      <div className="search-box">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8CA0B3"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input suppressHydrationWarning placeholder="Search users, titles, ids..." readOnly />
      </div>
    </div>
  );
}
