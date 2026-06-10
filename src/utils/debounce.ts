// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Like {@link debounce}, but keeps an independent timer per key. Calls with
 * different keys never cancel each other; only repeated calls sharing a key are
 * coalesced. Use this when a single event source fires for many targets at once
 * (e.g. "Save All" emits onDidSaveTextDocument per document) — a single shared
 * timer would drop all but the last call and leave the rest with stale state.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceByKey<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
  keyFn: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => void {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return (...args: Parameters<T>) => {
    const key = keyFn(...args);
    const existing = timers.get(key);
    if (existing) {
      clearTimeout(existing);
    }
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        fn(...args);
      }, delay)
    );
  };
}
