import React from 'react';

export type BadgeVariant =
  | 'reported'
  | 'pending'
  | 'hidden'
  | 'suspended'
  | 'resolved'
  | 'active-role'
  | 'admin-role';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge ${variant}`}>
      {children}
    </span>
  );
}
