import availabilityReportsData from '@/data/admin-availability-reports.json';
import commentQueueData from '@/data/admin-comment-queue.json';
import { matchSearchQuery } from '@/lib/search/matchSearchQuery';

export type AdminComment = {
  id: string;
  text: string;
  hidden: boolean;
  reported: boolean;
  userId: string;
  titleId: string;
  titleName?: string;
  createdAt: string;
  reportedAt?: string;
}

export type AdminAvailabilityReport = {
  id: string;
  title: string;
  platform: string | null;
  category: string;
  reportedBy: string;
  reportedAt: string;
  resolved: boolean;
  resolution: string | null;
  resolvedAt: string | null;
}

export type CommentFilter = 'reported' | 'hidden' | 'all';
export type AvailabilityFilter = 'unresolved' | 'resolved' | 'all';

export const adminCommentQueue = commentQueueData as AdminComment[];
export const adminAvailabilityReports = availabilityReportsData as AdminAvailabilityReport[];

export function getCommentQueueCounts() {
  const reported = filterCommentQueueRows(adminCommentQueue, 'reported').length;
  const hidden = filterCommentQueueRows(adminCommentQueue, 'hidden').length;

  return {
    reported,
    hidden,
    total: adminCommentQueue.length,
  };
}

export function getAvailabilityReportCounts() {
  const unresolved = filterAvailabilityReportsRows(adminAvailabilityReports, 'unresolved').length;
  const resolved = filterAvailabilityReportsRows(adminAvailabilityReports, 'resolved').length;

  return {
    unresolved,
    resolved,
    total: adminAvailabilityReports.length,
  };
}

/**
 * Filters comment queue rows by status and search query.
 * @param rows - Full comment list.
 * @param filter - Active filter tab.
 * @param query - Search string matched against comment fields.
 * @returns Filtered comments in descending recency order.
 */
export function filterCommentQueueRows(rows: AdminComment[], filter: CommentFilter, query = '') {
  return [...rows]
    .filter(function (comment) {
      if (filter === 'reported') {
        if (comment.hidden) {
          return false;
        }
      } else if (filter === 'hidden') {
        if (!comment.hidden) {
          return false;
        }
      }

      return matchSearchQuery(query, [
        comment.text,
        comment.id,
        comment.userId,
        comment.titleName,
        comment.titleId,
      ]);
    })
    .toSorted(function (left, right) {
      return (
        new Date(right.reportedAt ?? right.createdAt).getTime() -
        new Date(left.reportedAt ?? left.createdAt).getTime()
      );
    });
}

/**
 * Filters availability report rows by status and search query.
 * @param rows - Full report list.
 * @param filter - Active filter tab.
 * @param query - Search string matched against report fields.
 * @returns Filtered reports in descending recency order.
 */
export function filterAvailabilityReportsRows(
  rows: AdminAvailabilityReport[],
  filter: AvailabilityFilter,
  query = '',
) {
  return [...rows]
    .filter(function (report) {
      if (filter === 'unresolved') {
        if (report.resolved) {
          return false;
        }
      } else if (filter === 'resolved') {
        if (!report.resolved) {
          return false;
        }
      }

      return matchSearchQuery(query, [
        report.title,
        report.platform,
        report.category,
        report.reportedBy,
        report.resolution,
      ]);
    })
    .toSorted(function (left, right) {
      return new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime();
    });
}
