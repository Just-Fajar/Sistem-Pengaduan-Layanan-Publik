import { useEffect, useState } from 'react';

/**
 * useDebounce hook to delay updating value until delay period has elapsed
 * @param {any} value Value to debounce
 * @param {number} delay Delay in milliseconds (default: 500ms)
 * @returns {any} Debounced value
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

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

export default useDebounce;
