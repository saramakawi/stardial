// This hook provides a way to store a piece of state in localStorage, so it persists across page reloads.
// It's used to store the user's selected birth date and time for the birth chart mode

import { useState, useEffect } from 'react';

export function usePersistentState<T extends string>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (stored as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // fail silently
    }
  }, [key, value]);

  return [value, setValue] as const;
}