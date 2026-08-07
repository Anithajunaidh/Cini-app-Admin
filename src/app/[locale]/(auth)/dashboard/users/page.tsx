'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/errors';
import { Badge } from '@/components/atoms/Badge';
import { EmptyState } from '@/components/atoms/EmptyState';
import { Pagination } from '@/components/atoms/Pagination';
import { AdminLayout } from '@/components/templates/AdminLayout';
import {
  useAdminUsers,
  useSuspendAdminUser,
  useUpdateAdminUserRole,
} from '@/features/admin/api';
import { useAdminDebouncedSearchQuery } from '@/hooks/useAdminSearch';
import {
  ADMIN_USER_ROLES,
  CURRENT_ADMIN_ID,
  getRoleBadgeVariant,
  type AdminUserRole,
  type UsersFilter,
} from '@/data/admin-users';

import { USER_FILTER_TABS, USERS_PAGE_LIMIT } from '@/constants/admin.constants';

function formatJoinedDate(value: string) {
  return value.slice(0, 10);
}

function formatTotalCount(total: number) {
  return total.toLocaleString('en-US');
}

function getUserErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Something went wrong while updating this user.';
}

function UsersPanel() {
  const [activeFilter, setActiveFilter] = useState<UsersFilter>('all');
  const [page, setPage] = useState(1);
  const [roleEditorUserId, setRoleEditorUserId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchQuery = useAdminDebouncedSearchQuery();
  const usersQuery = useAdminUsers({
    page,
    limit: USERS_PAGE_LIMIT,
    suspended: activeFilter === 'suspended' ? 'true' : 'all',
    query: searchQuery,
  });
  const updateUserRole = useUpdateAdminUserRole();
  const suspendUser = useSuspendAdminUser();

  const total = usersQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_LIMIT));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = usersQuery.data?.data ?? [];
  const roleEditorUser = pageRows.find(function(user) {
    return user.id === roleEditorUserId;
  });

  const countCaption =
    activeFilter === 'suspended'
      ? `${formatTotalCount(total)} suspended`
      : `${formatTotalCount(total)} total`;

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

  function handleFilterChange(filter: UsersFilter) {
    setActiveFilter(filter);
    setPage(1);
    setRoleEditorUserId(null);
    setActionError(null);
  }

  function handleOpenRoleEditor(userId: string) {
    setActionError(null);
    setRoleEditorUserId(userId);
  }

  function handleChangeRole(userId: string, role: AdminUserRole) {
    if (userId === CURRENT_ADMIN_ID) {
      setActionError('Cannot change own role');
      setRoleEditorUserId(null);
      return;
    }

    setActionError(null);

    updateUserRole.mutate(
      { id: userId, role },
      {
        onSuccess() {
          setRoleEditorUserId(null);
        },
        onError(error) {
          setActionError(getUserErrorMessage(error));
        },
      },
    );
  }

  function handleSuspendUser(user: { id: string; suspended: boolean }) {
    if (user.id === CURRENT_ADMIN_ID) {
      setActionError('Cannot suspend your own account');
      return;
    }

    setActionError(null);

    suspendUser.mutate(
      { id: user.id, currentlySuspended: user.suspended },
      {
        onError(error) {
          setActionError(getUserErrorMessage(error));
        },
      },
    );
  }

  if (usersQuery.isError) {
    return (
      <div className="panel">
        <div className="px-[18px] py-[20px] text-[13px] text-[color:var(--accent-red)]">
          {usersQuery.error instanceof ApiError
            ? usersQuery.error.message
            : 'Unable to load the users list.'}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-heading">
          <span className="panel-title">Users</span>
          <span className="panel-count">{usersQuery.isLoading ? 'Loading…' : countCaption}</span>
        </div>

        <div className="filter-row">
          {USER_FILTER_TABS.map(function(tab) {
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

      {roleEditorUser ? (
        <div className="border-b border-[color:var(--border-soft)] px-[18px] py-[16px]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-[family:var(--font-display)] text-[15px] font-semibold text-[color:var(--text-primary)]">
                Change role for {roleEditorUser.name}
              </div>
              <div className="font-[family:var(--font-mono)] text-[11px] tracking-[0.3px] text-[color:var(--text-faint)]">
                Current role: {roleEditorUser.role}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ADMIN_USER_ROLES.map(function(role) {
                return (
                  <button
                    key={role}
                    suppressHydrationWarning
                    className="btn-ghost"
                    disabled={role === roleEditorUser.role || updateUserRole.isPending}
                    onClick={function() {
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
                onClick={function() {
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

      {usersQuery.isLoading ? (
        <div className="px-[18px] py-[24px] font-[family:var(--font-mono)] text-[12px] text-[color:var(--text-faint)]">
          Loading users…
        </div>
      ) : pageRows.length === 0 ? (
        <EmptyState title="No users found" subtitle="There are no users for this filter." />
      ) : (
        <>
          <div className="overflow-x-auto w-full">
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
              {pageRows.map(function(user) {
                const isOwnRow = user.id === CURRENT_ADMIN_ID;

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="cell-primary">
                        {user.name}
                        {isOwnRow ? ' (you)' : null}
                      </div>
                      <div className="cell-sub">
                        id: {user.id} Â· {user.email}
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
                              disabled={updateUserRole.isPending}
                              onClick={function() {
                                handleOpenRoleEditor(user.id);
                              }}
                              type="button"
                            >
                              Role
                            </button>
                            <button
                              suppressHydrationWarning
                              className={`btn-ghost${user.suspended ? '' : ' danger'}`}
                              disabled={suspendUser.isPending}
                              onClick={function() {
                                handleSuspendUser(user);
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
          </div>

          <Pagination page={safePage} totalPages={totalPages} limit={USERS_PAGE_LIMIT} onPageChange={setPage} />
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
