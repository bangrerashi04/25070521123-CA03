import { useEffect, useState } from 'react';

/**
 * useState backed by localStorage so preferences survive a refresh.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch (_error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Storage can be disabled (private mode) - the app still works.
    }
  }, [key, value]);

  return [value, setValue];
}
