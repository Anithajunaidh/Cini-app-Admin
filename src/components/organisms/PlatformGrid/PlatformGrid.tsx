'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/molecules/EmptyState';
import { AddPlatformModal } from '@/components/organisms/AddPlatformModal';
import { PlatformCard } from '@/components/organisms/PlatformCard';
import { usePlatforms } from '@/features/admin/api';

/** 3-column responsive grid of PlatformCards + dashed add card. */
export function PlatformGrid() {
  const { data: platforms = [], isLoading, isError, error } = usePlatforms();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            /* eslint-disable-next-line react/no-array-index-key */
            key={i}
            className="h-[130px] animate-pulse rounded-[var(--radius)] border border-[var(--border-soft)] bg-[var(--surface)] p-4"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[var(--radius)] border border-[var(--accent-red-dim)] bg-[var(--surface)] px-4 py-3">
        <p className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent-red)]">
          ⚠ Platforms API error —{' '}
          {(error)?.message ?? 'Could not fetch platforms. Is the backend running?'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        {platforms.length === 0 && (
          <div className="col-span-3">
            <EmptyState title="No platforms yet" sub="Add your first streaming platform below." />
          </div>
        )}

        {platforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}

        {/* Dashed "Add platform" card */}
        <button
          type="button"
          onClick={() => {
            setIsModalOpen(true);
          }}
          className="flex min-h-[130px] flex-col items-center justify-center gap-[6px] rounded-[var(--radius)] border border-dashed border-[var(--border)] font-[family-name:var(--font-mono)] text-[12px] text-[var(--text-faint)] transition-[color,border-color] duration-150 hover:border-[var(--accent-teal)] hover:text-[var(--accent-teal)]"
          aria-label="Add a new platform"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add platform
        </button>
      </div>

      {isModalOpen && (
        <AddPlatformModal
          onClose={() => {
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
