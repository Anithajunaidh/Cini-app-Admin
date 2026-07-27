'use client';

import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/components/templates/AdminLayout';
import {
  adminCommentQueue,
  filterCommentQueueRows,
  type AdminComment,
  type CommentFilter,
} from '@/data/admin-moderation';
import { useAdminSearchQuery } from '@/hooks/useAdminSearch';

const FILTER_TABS: { label: string; value: CommentFilter }[] = [
  { label: 'Reported', value: 'reported' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'All', value: 'all' },
];

const LIMIT = 5;

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

export default function CommentQueuePage() {
  return (
    <AdminLayout eyebrow="Moderation" title="Comment queue">
      <CommentQueuePanel />
    </AdminLayout>
  );
}

function CommentQueuePanel() {
  const [comments, setComments] = useState<AdminComment[]>(adminCommentQueue);
  const [activeFilter, setActiveFilter] = useState<CommentFilter>('reported');
  const [page, setPage] = useState(1);
  const searchQuery = useAdminSearchQuery();

  const filteredComments = filterCommentQueueRows(comments, activeFilter, searchQuery);
  const total = filteredComments.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = filteredComments.slice((safePage - 1) * LIMIT, safePage * LIMIT);

  const countCaption =
    activeFilter === 'reported'
      ? `${total} reported`
      : activeFilter === 'hidden'
        ? `${total} hidden`
        : `${total} total`;
  const hasSearchQuery = searchQuery.trim().length > 0;

  function handleFilterChange(filter: CommentFilter) {
    setActiveFilter(filter);
    setPage(1);
  }

  function handleToggleHidden(commentId: string) {
    setComments(function(previousComments) {
      return previousComments.map(function(comment) {
        if (comment.id !== commentId) {
          return comment;
        }

        return {
          ...comment,
          hidden: !comment.hidden,
        };
      });
    });
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <span className="panel-title">Comment queue</span>
          <span className="panel-count">{countCaption}</span>
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

      {pageRows.length === 0 ? (
        <EmptyState
          title="No comments found"
          subtitle={hasSearchQuery ? 'No comments match this search.' : 'There are no comments for this filter.'}
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
                            {' · '}
                            <Badge variant="hidden">hidden</Badge>
                          </>
                        ) : null}
                      </div>
                    </td>
                    <td className="cell-mono">{comment.userId}</td>
                    <td>{comment.titleName ?? comment.titleId}</td>
                    <td className="cell-mono">{formatRelativeAge(comment.reportedAt ?? comment.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          suppressHydrationWarning
                          className={`btn-ghost${comment.hidden ? '' : ' danger'}`}
                          onClick={function() {
                            handleToggleHidden(comment.id);
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
