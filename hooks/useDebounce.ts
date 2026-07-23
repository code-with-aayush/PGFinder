"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce fast-changing values (e.g. search inputs).
 * Prevents flooding backend APIs on every single keystroke.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
