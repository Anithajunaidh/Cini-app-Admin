'use client';

import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/components/templates/AdminLayout';
import {
  adminAvailabilityReports,
  filterAvailabilityReportsRows,
  type AdminAvailabilityReport,
  type AvailabilityFilter,
} from '@/data/admin-moderation';

const FILTER_TABS: { label: string; value: AvailabilityFilter }[] = [
  { label: 'Unresolved', value: 'unresolved' },
  { label: 'Resolved', value: 'resolved' },
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

function getCategoryVariant(report: AdminAvailabilityReport) {
  if (report.resolved) {
    return 'resolved' as const;
  }

  if (report.category === 'CONTENT' || report.category === 'REGION') {
    return 'reported' as const;
  }

  return 'active-role' as const;
}

export default function AvailabilityReportsPage() {
  const [reports, setReports] = useState<AdminAvailabilityReport[]>(adminAvailabilityReports);
  const [activeFilter, setActiveFilter] = useState<AvailabilityFilter>('unresolved');
  const [page, setPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [resolutionDraft, setResolutionDraft] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const filteredReports = filterAvailabilityReportsRows(reports, activeFilter);
  const total = filteredReports.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = filteredReports.slice((safePage - 1) * LIMIT, safePage * LIMIT);
  const selectedReport = reports.find(function(report) {
    return report.id === selectedReportId;
  });

  const countCaption =
    activeFilter === 'unresolved'
      ? `${total} unresolved`
      : activeFilter === 'resolved'
        ? `${total} resolved`
        : `${total} total`;

  function handleFilterChange(filter: AvailabilityFilter) {
    setActiveFilter(filter);
    setPage(1);
    setSelectedReportId(null);
    setResolutionDraft('');
    setExpandedReportId(null);
  }

  function handleOpenResolve(report: AdminAvailabilityReport) {
    setSelectedReportId(report.id);
    setResolutionDraft(report.resolution ?? '');
  }

  function handleSaveResolve() {
    if (!selectedReportId) {
      return;
    }

    const trimmedNote = resolutionDraft.trim();

    setReports(function(previousReports) {
      return previousReports.map(function(report) {
        if (report.id !== selectedReportId) {
          return report;
        }

        return {
          ...report,
          resolved: true,
          resolution: trimmedNote.length > 0 ? trimmedNote : 'Resolved without an extra note.',
          resolvedAt: new Date().toISOString(),
        };
      });
    });

    setSelectedReportId(null);
    setResolutionDraft('');
    setExpandedReportId(null);
    setPage(1);
  }

  function handleToggleExpanded(reportId: string) {
    setExpandedReportId(function(previousId) {
      return previousId === reportId ? null : reportId;
    });
  }

  function getResolvedText(report: AdminAvailabilityReport) {
    return report.resolution ?? 'Marked as resolved';
  }

  return (
    <AdminLayout eyebrow="Moderation" title="Availability reports">
      <div className="panel">
        <div className="panel-head">
          <div className="panel-heading">
            <span className="panel-title">Availability reports</span>
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
                <button suppressHydrationWarning className="btn-ghost" onClick={handleSaveResolve} type="button">
                  Save
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

        {pageRows.length === 0 ? (
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
                                handleOpenResolve(report);
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
    </AdminLayout>
  );
}
