'use client';

import { useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/templates/AdminLayout';
import {
  ADMIN_USER_ROLES,
  CURRENT_ADMIN_ID,
  adminUsers,
  filterAdminUsers,
  getRoleBadgeVariant,
} from '@/data/admin-users';
import type { AdminUser, AdminUserRole, UsersFilter } from '@/data/admin-users';
import { useAdminSearchQuery } from '@/hooks/useAdminSearch';

const FILTER_TABS: { label: string; value: UsersFilter }[] = [
  { label: 'All roles', value: 'all' },
  { label: 'Suspended', value: 'suspended' },
];

const LIMIT = 5;

function formatJoinedDate(value: string) {
  return value.slice(0, 10);
}

function formatTotalCount(total: number) {
  return total.toLocaleString('en-US');
}

function UsersPanel() {
  const searchQuery = useAdminSearchQuery();
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [activeFilter, setActiveFilter] = useState<UsersFilter>('all');
  const [page, setPage] = useState(1);
  const [roleEditorUserId, setRoleEditorUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredUsers = filterAdminUsers(users, activeFilter, searchQuery);
  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = filteredUsers.slice((safePage - 1) * LIMIT, safePage * LIMIT);
  const roleEditorUser = users.find(function roleEditorUser(user) {
    return user.id === roleEditorUserId;
  });

  const countCaption =
    activeFilter === 'suspended'
      ? `${formatTotalCount(total)} suspended`
      : `${formatTotalCount(total)} total`;

  function handleFilterChange(filter: UsersFilter) {
    setActiveFilter(filter);
    setPage(1);
    setRoleEditorUserId(null);
    setActionError(null);
  }

  function handleOpenRoleEditor(user: AdminUser) {
    if (user.id === CURRENT_ADMIN_ID) {
      setActionError('Cannot change own role');
      return;
    }

    setActionError(null);
    setRoleEditorUserId(user.id);
  }

  function handleChangeRole(userId: string, role: AdminUserRole) {
    if (userId === CURRENT_ADMIN_ID) {
      setActionError('Cannot change own role');
      setRoleEditorUserId(null);
      return;
    }

    setUsers(function (previousUsers) {
      return previousUsers.map(function (user) {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,
          role,
        };
      });
    });

    setRoleEditorUserId(null);
    setActionError(null);
  }

  function handleToggleSuspended(userId: string) {
    if (userId === CURRENT_ADMIN_ID) {
      setActionError('Cannot suspend your own account');
      return;
    }

    setUsers(function (previousUsers) {
      return previousUsers.map(function (user) {
        if (user.id !== userId) {
          return user;
        }

        return {
          ...user,
          suspended: !user.suspended,
        };
      });
    });

    setActionError(null);
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <span className="panel-title">Users</span>
          <span className="panel-count">{countCaption}</span>
        </div>

        <div className="filter-row">
          {FILTER_TABS.map(function (tab) {
            return (
              <button
                key={tab.value}
                suppressHydrationWarning
                className={`chip${activeFilter === tab.value ? ' active' : ''}`}
                onClick={function () {
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
        <div className="border-b border-[color:var(--border-soft)] px-[18px] py-[12px] text-[12px] font-[family:var(--font-mono)] text-[color:var(--accent-red)]">
          {actionError}
        </div>
      ) : null}

      {roleEditorUser ? (
        <div className="border-b border-[color:var(--border-soft)] px-[18px] py-[16px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-[15px] font-[family:var(--font-display)] font-semibold text-[color:var(--text-primary)]">
                Change role for {roleEditorUser.name}
              </div>
              <div className="text-[11px] font-[family:var(--font-mono)] tracking-[0.3px] text-[color:var(--text-faint)]">
                Current role: {roleEditorUser.role}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ADMIN_USER_ROLES.map(function (role) {
                return (
                  <button
                    key={role}
                    suppressHydrationWarning
                    className="btn-ghost"
                    disabled={role === roleEditorUser.role}
                    onClick={function () {
                      handleChangeRole(roleEditorUser.id, role);
                    }}
                    type="button"
                  >
                    {role}
                  </button>
                );
              })}
              <button
                className="btn-ghost"
                onClick={function () {
                  setRoleEditorUserId(null);
                }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pageRows.length === 0 ? (
        <EmptyState
          title="No users found"
          subtitle={
            searchQuery.trim().length > 0
              ? 'No users match this search.'
              : 'There are no users for this filter.'
          }
        />
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pageRows.map(function (user) {
                const isOwnRow = user.id === CURRENT_ADMIN_ID;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="cell-primary">
                        {user.name}
                        {isOwnRow ? ' (you)' : null}
                      </div>
                      <div className="cell-sub">
                        id: {user.id} · {user.email}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td>
                      <Badge variant={user.suspended ? 'suspended' : 'resolved'}>
                        {user.suspended ? 'suspended' : 'active'}
                      </Badge>
                    </td>
                    <td className="cell-mono">{formatJoinedDate(user.joinedAt)}</td>
                    <td>
                      <div className="row-actions">
                        {isOwnRow ? (
                          <button
                            suppressHydrationWarning
                            className="btn-ghost"
                            disabled
                            title="Cannot change own role"
                            type="button"
                          >
                            Role
                          </button>
                        ) : (
                          <>
                            <button
                              suppressHydrationWarning
                              className="btn-ghost"
                              onClick={function () {
                                handleOpenRoleEditor(user);
                              }}
                              type="button"
                            >
                              Role
                            </button>
                            <button
                              suppressHydrationWarning
                              className={`btn-ghost${user.suspended ? '' : ' danger'}`}
                              onClick={function () {
                                handleToggleSuspended(user.id);
                              }}
                              type="button"
                            >
                              {user.suspended ? 'Reinstate' : 'Suspend'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminLayout eyebrow="People" title="Users">
      <UsersPanel />
    </AdminLayout>
  );
}
