import { Badge } from '@/components/atoms/Badge';
import type { AdminPlatformDto } from '@/features/admin/types';

type PlatformCardProps = {
  platform: AdminPlatformDto;
};

/** Single platform card with name, slug, status badge, and subscriber/title metrics. */
export function PlatformCard(props: PlatformCardProps) {
  const { platform } = props;
  const isDeletable = platform.subscriberCount === 0;

  return (
    <div className="flex flex-col rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <div className="truncate font-[family-name:var(--font-display)] text-[15px] font-semibold">
            {platform.nameEs}
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-faint)]">
            {platform.slug}
          </div>
        </div>
        <Badge variant={isDeletable ? 'suspended' : 'active-role'}>
          {isDeletable ? '0 subs — deletable' : 'active'}
        </Badge>
      </div>

      <div className="mt-3 flex gap-[18px]">
        <div>
          <div className="font-[family-name:var(--font-mono)] text-[16px] font-semibold">
            {platform.subscriberCount.toLocaleString()}
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.4px] text-[var(--text-faint)] uppercase">
            Subscribers
          </div>
        </div>
      </div>
    </div>
  );
}
