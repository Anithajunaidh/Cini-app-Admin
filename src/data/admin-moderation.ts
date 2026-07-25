import commentQueueData from '@/data/admin-comment-queue.json';
import availabilityReportsData from '@/data/admin-availability-reports.json';

export interface AdminComment {
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

export interface AdminAvailabilityReport {
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

export function filterCommentQueueRows(rows: AdminComment[], filter: CommentFilter) {
  return rows
    .slice()
    .filter(function(comment) {
      if (filter === 'reported') {
        return !comment.hidden;
      }

      if (filter === 'hidden') {
        return comment.hidden;
      }

      return true;
    })
    .sort(function(left, right) {
      return new Date(right.reportedAt ?? right.createdAt).getTime() - new Date(left.reportedAt ?? left.createdAt).getTime();
    });
}

export function filterAvailabilityReportsRows(rows: AdminAvailabilityReport[], filter: AvailabilityFilter) {
  return rows
    .slice()
    .filter(function(report) {
      if (filter === 'unresolved') {
        return !report.resolved;
      }

      if (filter === 'resolved') {
        return report.resolved;
      }

      return true;
    })
    .sort(function(left, right) {
      return new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime();
    });
}
