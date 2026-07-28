'use client';

import { SearchBox } from '@/components/molecules/SearchBox';
import { useAdminSearch } from '@/hooks/useAdminSearch';

type TopbarProps = {
  eyebrow: string;
  title: string;
};

export function Topbar(props: TopbarProps) {
  const search = useAdminSearch();

  return (
    <div className="flex flex-col gap-4 px-[14px] pb-[6px] pt-[14px] md:flex-row md:items-center md:justify-between md:px-[22px] md:pt-[18px]">
      <div>
        <div className="mb-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[1.4px] text-[var(--text-faint)]">
          {props.eyebrow}
        </div>
        <div className="font-[family-name:var(--font-display)] text-[23px] font-semibold tracking-[0.1px]">
          {props.title}
        </div>
      </div>
      <SearchBox
        value={search.query}
        onChange={search.setQuery}
      />
    </div>
  );
}
