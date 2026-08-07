'use client';

import { useEffect, useState } from 'react';

/**
 * Returns a value that updates only after it has been stable for `delayMs`.
 * @param value - Latest value to debounce.
 * @param delayMs - Delay in milliseconds before the debounced value updates.
 * @returns Debounced value.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(function timeoutId() {
      setDebouncedValue(value);
    }, delayMs);

    return function () {
      window.clearTimeout(timeoutId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
