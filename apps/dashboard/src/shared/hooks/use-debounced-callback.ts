import { useCallback, useEffect, useRef } from 'react';

/** Returns a stable function that runs `callback` only after `delayMs` of quiet. */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 300,
): (...args: TArgs) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args: TArgs) => {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [delayMs],
  );
}
