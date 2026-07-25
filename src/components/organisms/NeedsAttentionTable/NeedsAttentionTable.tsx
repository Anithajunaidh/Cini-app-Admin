'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/atoms/Badge';
import type { BadgeVariant } from '@/components/atoms/Badge';
import { GhostButton } from '@/components/atoms/GhostButton';
import { EmptyState } from '@/components/molecules/EmptyState';
import { DataTable } from '@/components/organisms/DataTable';
import { Panel } from '@/components/organisms/Panel';
import { useNeedsAttention } from '@/features/admin/api';
import type { NeedsAttentionSource } from '@/features/admin/types';

function sourceBadgeVariant(source: NeedsAttentionSource): BadgeVariant {
  switch (source) {
    case 'comment': {
      return 'reported';
    }
    case 'avail. report': {
      return 'pending';
    }
    case 'user': {
      return 'suspended';
    }
  }
}

function relativeAge(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  return `${Math.floor(hours / 24)}d`;
}

/** "Needs attention" panel on the Dashboard. Fetches and merges reported comments + unresolved reports. */
export function NeedsAttentionTable() {
  const router = useRouter();
  const { data: items = [], isLoading } = useNeedsAttention();

  function handleReview() {
    // All Review buttons navigate to Comment Queue (per spec)
    router.push('/comments');
  }

  return (
    <Panel
      title="Needs attention"
      count={isLoading ? '' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
    >
      {isLoading ? (
        <EmptyState title="Loading…" />
      ) : (items.length === 0 ? (
        <EmptyState
          title="Nothing needs attention"
          sub="All reported comments and availability reports are resolved."
        />
      ) : (
        <DataTable columns={['Source', 'Detail', 'Age', '']}>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border-soft)] transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
            >
              <td className="px-[18px] py-3 align-middle">
                <Badge variant={sourceBadgeVariant(item.source)}>{item.source}</Badge>
              </td>
              <td className="min-w-0 px-[18px] py-3 align-middle text-[13px] font-medium">
                {item.detail}
              </td>
              <td className="px-[18px] py-3 align-middle font-[family-name:var(--font-mono)] text-[12px] whitespace-nowrap text-[var(--text-muted)]">
                {relativeAge(item.createdAt)}
              </td>
              <td className="px-[18px] py-3 align-middle">
                <div className="flex justify-end">
                  <GhostButton onClick={handleReview} aria-label={`Review ${item.source} item`}>
                    Review
                  </GhostButton>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      ))}
    </Panel>
  );
}
