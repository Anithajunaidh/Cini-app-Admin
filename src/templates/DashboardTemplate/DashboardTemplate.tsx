import { NeedsAttentionTable } from '@/components/organisms/NeedsAttentionTable';
import { StatGrid } from '@/components/organisms/StatGrid';

/** Dashboard page layout skeleton — StatGrid + Needs Attention panel. */
export function DashboardTemplate() {
  return (
    <div className="flex flex-col gap-[26px]">
      <StatGrid />
      <NeedsAttentionTable />
    </div>
  );
}
