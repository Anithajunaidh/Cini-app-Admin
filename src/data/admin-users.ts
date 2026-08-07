import adminUsersData from '@/data/admin-users.json';
import { matchSearchQuery } from '@/lib/search/matchSearchQuery';

export type AdminUserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export type UsersFilter = 'all' | 'suspended';

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  suspended: boolean;
  joinedAt: string;
};

/** Logged-in admin id used for own-row safeguards on the Users page. */
export const CURRENT_ADMIN_ID = 'u_0001';

export const ADMIN_USER_ROLES: AdminUserRole[] = ['USER', 'MODERATOR', 'ADMIN'];

export const adminUsers = adminUsersData as AdminUser[];

/**
 * Filters users by the active tab and optional search query.
 * @param rows - Full user list.
 * @param filter - Active filter tab.
 * @param query - Search string matched against name, email, id, and role.
 * @returns Filtered users in source order.
 */
export function filterAdminUsers(rows: AdminUser[], filter: UsersFilter, query = '') {
  return rows.filter(function (user) {
    if (filter === 'suspended' && !user.suspended) {
      return false;
    }

    return matchSearchQuery(query, [user.name, user.email, user.id, user.role]);
  });
}

/**
 * Maps a role to the shared Badge variant.
 * @param role - User role.
 * @returns Badge variant for the role pill.
 */
export function getRoleBadgeVariant(role: AdminUserRole) {
  if (role === 'USER') {
    return 'active-role' as const;
  }

  return 'admin-role' as const;
}
