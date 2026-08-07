import { type UsersFilter } from '@/data/admin-users';

export type CommentFilter = 'reported' | 'hidden' | 'all';
export type AvailabilityFilter = 'unresolved' | 'resolved' | 'all';

export const COMMENTS_PAGE_LIMIT = 5;
export const REPORTS_PAGE_LIMIT = 5;
export const USERS_PAGE_LIMIT = 5;

export const COMMENT_FILTER_TABS: { label: string; value: CommentFilter }[] = [
  { label: 'Reported', value: 'reported' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'All', value: 'all' },
];

export const REPORT_FILTER_TABS: { label: string; value: AvailabilityFilter }[] = [
  { label: 'Unresolved', value: 'unresolved' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
];

export const USER_FILTER_TABS: { label: string; value: UsersFilter }[] = [
  { label: 'All roles', value: 'all' },
  { label: 'Suspended', value: 'suspended' },
];
