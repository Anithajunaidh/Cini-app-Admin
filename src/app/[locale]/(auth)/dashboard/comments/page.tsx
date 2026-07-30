'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/components/templates/AdminLayout';
import { useAdminComments, useSetCommentHidden } from '@/features/admin/api';
import { useAdminDebouncedSearchQuery } from '@/hooks/useAdminSearch';

const FILTER_TABS: { label: string; value: CommentFilter }[] = [
  { label: 'Reported', value: 'reported' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'All', value: 'all' },
];

const LIMIT = 5;

type CommentFilter = 'reported' | 'hidden' | 'all';

function formatRelativeAge(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${Math.max(1, diffMinutes)}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays}d`;
}

function getCommentErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong while updating this comment.';
}

export default function CommentQueuePage() {
  return (
    <AdminLayout eyebrow="Moderation" title="Comment queue">
      <CommentQueuePanel />
    </AdminLayout>
  );
}

function CommentQueuePanel() {
  const [activeFilter, setActiveFilter] = useState<CommentFilter>('reported');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchQuery = useAdminDebouncedSearchQuery();
  const commentsQuery = useAdminComments({
    page,
    limit: LIMIT,
    status: activeFilter,
    query: searchQuery,
  });
  const setCommentHidden = useSetCommentHidden();

  const total = commentsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = commentsQuery.data?.data ?? [];

  const countCaption =
    activeFilter === 'reported'
      ? `${total} reported`
      : activeFilter === 'hidden'
        ? `${total} hidden`
        : `${total} total`;

  useEffect(
    function() {
      if (page > totalPages) {
        setPage(totalPages);
      }
    },
    [page, totalPages],
  );

  useEffect(
    function() {
      setPage(1);
    },
    [searchQuery, activeFilter],
  );

  function handleFilterChange(filter: CommentFilter) {
    setActiveFilter(filter);
    setPage(1);
    setActionError(null);
  }

  function handleToggleHidden(commentId: string, hidden: boolean) {
    setActionError(null);

    setCommentHidden.mutate(
      { id: commentId, hidden },
      {
        onError(error) {
          setActionError(getCommentErrorMessage(error));
        },
      },
    );
  }

  if (commentsQuery.isError) {
    return (
      <div className="panel">
        <div className="px-[18px] py-[20px] text-[13px] text-[color:var(--accent-red)]">
          {commentsQuery.error instanceof ApiError
            ? commentsQuery.error.message
            : 'Unable to load the comment queue.'}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <span className="panel-title">Comment queue</span>
          <span className="panel-count">
            {commentsQuery.isLoading ? 'Loading…' : countCaption}
          </span>
        </div>

        <div className="filter-row">
          {FILTER_TABS.map(function(tab) {
            return (
              <button
                key={tab.value}
                suppressHydrationWarning
                className={`chip${activeFilter === tab.value ? ' active' : ''}`}
                onClick={function() {
                  handleFilterChange(tab.value);
                }}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {actionError ? (
        <div className="border-b border-[color:var(--border-soft)] px-[18px] py-[12px] font-[family:var(--font-mono)] text-[12px] text-[color:var(--accent-red)]">
          {actionError}
        </div>
      ) : null}

      {commentsQuery.isLoading ? (
        <div className="px-[18px] py-[24px] font-[family:var(--font-mono)] text-[12px] text-[color:var(--text-faint)]">
          Loading comments…
        </div>
      ) : pageRows.length === 0 ? (
        <EmptyState
          title="No comments found"
          subtitle="There are no comments for this filter."
        />
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Comment</th>
                <th>Author</th>
                <th>Title</th>
                <th>Reported</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageRows.map(function(comment) {
                return (
                  <tr key={comment.id}>
                    <td>
                      <div className="cell-primary">"{comment.text}"</div>
                      <div className="cell-sub">
                        id: {comment.id}
                        {comment.hidden ? (
                          <>
                            {' Â· '}
                            <Badge variant="hidden">hidden</Badge>
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td className="cell-mono">{comment.userId}</td>
                    <td>{comment.titleName ?? comment.titleId ?? '—'}</td>
                    <td className="cell-mono">
                      {formatRelativeAge(comment.reportedAt ?? comment.createdAt)}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          suppressHydrationWarning
                          className={`btn-ghost${comment.hidden ? '' : ' danger'}`}
                          disabled={setCommentHidden.isPending}
                          onClick={function() {
                            handleToggleHidden(comment.id, !comment.hidden);
                          }}
                          type="button"
                        >
                          {comment.hidden ? 'Unhide' : 'Hide'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination page={safePage} totalPages={totalPages} limit={LIMIT} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
