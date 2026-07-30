'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/components/templates/AdminLayout';
import {
  useAdminAvailabilityReports,
  useResolveAvailabilityReport,
} from '@/features/admin/api';
import { useAdminDebouncedSearchQuery } from '@/hooks/useAdminSearch';

const FILTER_TABS: { label: string; value: AvailabilityFilter }[] = [
  { label: 'Unresolved', value: 'unresolved' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
];

const LIMIT = 5;

type AvailabilityFilter = 'unresolved' | 'resolved' | 'all';

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

function getCategoryVariant(report: { resolved: boolean; category: string }) {
  if (report.resolved) {
    return 'resolved' as const;
  }

  if (report.category === 'CONTENT' || report.category === 'REGION') {
    return 'reported' as const;
  }

  return 'active-role' as const;
}

function getReportErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong while resolving this report.';
}

export default function AvailabilityReportsPage() {
  return (
    <AdminLayout eyebrow="Moderation" title="Availability reports">
      <AvailabilityReportsPanel />
    </AdminLayout>
  );
}

function AvailabilityReportsPanel() {
  const [activeFilter, setActiveFilter] = useState<AvailabilityFilter>('unresolved');
  const [page, setPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchQuery = useAdminDebouncedSearchQuery();
  const reportsQuery = useAdminAvailabilityReports({
    page,
    limit: LIMIT,
    resolved:
      activeFilter === 'unresolved'
        ? 'false'
        : activeFilter === 'resolved'
          ? 'true'
          : 'all',
    query: searchQuery,
  });
  const resolveReport = useResolveAvailabilityReport();

  const total = reportsQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = reportsQuery.data?.data ?? [];
  const selectedReport = pageRows.find(function(report) {
    return report.id === selectedReportId;
  });

  const countCaption =
    activeFilter === 'unresolved'
      ? `${total} unresolved`
      : activeFilter === 'resolved'
        ? `${total} resolved`
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

  function handleFilterChange(filter: AvailabilityFilter) {
    setActiveFilter(filter);
    setPage(1);
    setSelectedReportId(null);
    setResolutionDraft('');
    setExpandedReportId(null);
    setActionError(null);
  }

  function handleOpenResolve(reportId: string) {
    setSelectedReportId(reportId);
    const match = pageRows.find(function(report) {
      return report.id === reportId;
    });
    setResolutionDraft(match?.resolution ?? '');
    setActionError(null);
  }

  function handleSaveResolve() {
    if (!selectedReportId) {
      return;
    }

    const trimmedNote = resolutionDraft.trim();
    setActionError(null);

    resolveReport.mutate(
      {
        id: selectedReportId,
        resolution: trimmedNote.length > 0 ? trimmedNote : undefined,
      },
      {
        onSuccess() {
          setSelectedReportId(null);
          setResolutionDraft('');
          setExpandedReportId(null);
        },
        onError(error) {
          setActionError(getReportErrorMessage(error));
        },
      },
    );
  }

  function handleToggleExpanded(reportId: string) {
    setExpandedReportId(function(previousId) {
      return previousId === reportId ? null : reportId;
    });
  }

  function getResolvedText(report: { resolution: string | null }) {
    return report.resolution ?? 'Marked as resolved';
  }

  if (reportsQuery.isError) {
    return (
      <div className="panel">
        <div className="px-[18px] py-[20px] text-[13px] text-[color:var(--accent-red)]">
          {reportsQuery.error instanceof ApiError
            ? reportsQuery.error.message
            : 'Unable to load the availability reports.'}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <span className="panel-title">Availability reports</span>
          <span className="panel-count">
            {reportsQuery.isLoading ? 'Loading…' : countCaption}
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

      {selectedReport ? (
        <div className="border-b border-[color:var(--border-soft)] px-[18px] py-[16px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-[family:var(--font-display)] text-[15px] font-semibold text-[color:var(--text-primary)]">
                Resolve {selectedReport.title}
              </div>
              <div className="font-[family:var(--font-mono)] text-[11px] tracking-[0.3px] text-[color:var(--text-faint)]">
                Optional note for the resolution record
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="btn-ghost"
                onClick={function() {
                  setSelectedReportId(null);
                  setResolutionDraft('');
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                className="btn-ghost"
                disabled={resolveReport.isPending}
                onClick={handleSaveResolve}
                type="button"
              >
                {resolveReport.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <textarea
            className="mt-4 w-full rounded-[8px] border border-[color:var(--border)] bg-[color:var(--bg-deep)] px-3 py-3 font-[family:var(--font-body)] text-[13px] text-[color:var(--text-primary)] outline-none transition focus:border-[color:var(--accent-teal)]"
            onChange={function(event) {
              setResolutionDraft(event.target.value);
            }}
            placeholder="Add a short note, or leave this empty"
            rows={3}
            value={resolutionDraft}
          />
        </div>
      ) : null}

      {reportsQuery.isLoading ? (
        <div className="px-[18px] py-[24px] font-[family:var(--font-mono)] text-[12px] text-[color:var(--text-faint)]">
          Loading availability reports…
        </div>
      ) : pageRows.length === 0 ? (
        <EmptyState
          title="No reports found"
          subtitle="There are no availability reports for this filter."
        />
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Platform</th>
                <th>Category</th>
                <th>Reported by</th>
                <th>Age</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageRows.map(function(report) {
                const isExpanded = expandedReportId === report.id;

                return (
                  <tr key={report.id}>
                    <td>
                      <div className="cell-primary">{report.title}</div>
                      {report.resolved ? (
                        <>
                          <div className="cell-sub">resolution: "{getResolvedText(report)}"</div>
                          {isExpanded ? (
                            <div className="cell-sub">
                              full note: {report.resolution ?? 'Resolved without an extra note.'}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                    <td className="cell-mono">{report.platform ?? '—'}</td>
                    <td>
                      <Badge variant={getCategoryVariant(report)}>{report.category}</Badge>
                    </td>
                    <td className="cell-mono">{report.reportedBy}</td>
                    <td className="cell-mono">{formatRelativeAge(report.reportedAt)}</td>
                    <td>
                      <div className="row-actions">
                        {report.resolved ? (
                          <button
                            suppressHydrationWarning
                            className="btn-ghost"
                            onClick={function() {
                              handleToggleExpanded(report.id);
                            }}
                            type="button"
                          >
                            {isExpanded ? 'Hide' : 'View'}
                          </button>
                        ) : (
                          <button
                            suppressHydrationWarning
                            className="btn-ghost"
                            onClick={function() {
                              handleOpenResolve(report.id);
                            }}
                            type="button"
                          >
                            Resolve
                          </button>
                        )}
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
