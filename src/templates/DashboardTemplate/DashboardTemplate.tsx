import { StatGrid } from '@/components/organisms/StatGrid';

/** Dashboard page layout — StatGrid only. */
export function DashboardTemplate() {
  return (
    <div className="flex flex-col gap-[26px]">
      <StatGrid />
    </div>
  );
}
