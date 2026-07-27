import { SearchBox } from '@/components/molecules/SearchBox';

type TopbarProps = {
  eyebrow: string;
  title: string;
};

/** Page header with eyebrow label, page title, and search box. Server Component. */
export function Topbar(props: TopbarProps) {
  return (
    <div className="flex flex-col gap-4 px-[14px] pt-[14px] pb-[6px] md:flex-row md:items-center md:justify-between md:px-[22px] md:pt-[18px]">
      <div>
        <div className="mb-1 font-[family-name:var(--font-mono)] text-[11px] tracking-[1.4px] text-[var(--text-faint)] uppercase">
          {props.eyebrow}
        </div>
        <div className="font-[family-name:var(--font-display)] text-[23px] font-semibold tracking-[0.1px]">
          {props.title}
        </div>
      </div>
      <SearchBox />
    </div>
  );
}
