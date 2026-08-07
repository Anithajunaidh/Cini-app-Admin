'use client';

import { useState } from 'react';
import { GhostButton } from '@/components/atoms/GhostButton';
import { useCreatePlatform } from '@/features/admin/api';
import type { ApiError } from '@/lib/api/errors';

type AddPlatformModalProps = {
  onClose: () => void;
};

/** Modal form for creating a new streaming platform. */
export function AddPlatformModal(props: AddPlatformModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<'SVOD' | 'TVOD' | 'AVOD' | 'LINEAR'>('SVOD');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const createPlatform = useCreatePlatform();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !slug.trim()) {
      setErrorMessage('Name and slug are required.');
      return;
    }

    createPlatform.mutate(
      { nameEs: name.trim(), slug: slug.trim(), type },
      {
        onSuccess: () => {
          props.onClose();
        },
        onError: (err) => {
          const apiError = err as ApiError;
          if (apiError.code === 'errors.admin.platform_slug_taken') {
            setErrorMessage('That slug is already taken. Please choose a different one.');
          } else {
            setErrorMessage(apiError.message ?? 'Failed to create platform.');
          }
        },
      },
    );
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-platform-title"
    >
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between">
          <h2
            id="add-platform-title"
            className="font-[family-name:var(--font-display)] text-[16px] font-semibold"
          >
            Add platform
          </h2>
          <button
            type="button"
            onClick={props.onClose}
            className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            aria-label="Close add platform dialog"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="platform-name"
              className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.6px] text-[var(--text-faint)] uppercase"
            >
              Name
            </label>
            <input
              id="platform-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="e.g. Prime Video"
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-teal)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="platform-slug"
              className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.6px] text-[var(--text-faint)] uppercase"
            >
              Slug
            </label>
            <input
              id="platform-slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
              }}
              placeholder="e.g. prime-video"
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent-teal)] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="platform-type"
              className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.6px] text-[var(--text-faint)] uppercase"
            >
              Type
            </label>
            <select
              id="platform-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as 'SVOD' | 'TVOD' | 'AVOD' | 'LINEAR');
              }}
              className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 font-[family-name:var(--font-mono)] text-[13px] text-[var(--text-primary)] focus:border-[var(--accent-teal)] focus:outline-none"
            >
              <option value="SVOD">SVOD (Subscription)</option>
              <option value="TVOD">TVOD (Rental/Buy)</option>
              <option value="AVOD">AVOD (Ad-supported)</option>
              <option value="LINEAR">Linear TV</option>
            </select>
          </div>

          {errorMessage && (
            <p className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent-red)]">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <GhostButton type="button" onClick={props.onClose}>
              Cancel
            </GhostButton>
            <button
              type="submit"
              disabled={createPlatform.isPending}
              className="rounded-[7px] border border-[#4FD1C540] bg-[var(--accent-teal-dim)] px-4 py-[7px] font-[family-name:var(--font-mono)] text-[11.5px] text-[var(--accent-teal)] transition-[background,color] duration-150 hover:bg-[var(--accent-teal)] hover:text-[#06231F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createPlatform.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
