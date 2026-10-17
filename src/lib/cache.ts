// Tiny stale-while-revalidate store: screens render the last known data immediately,
// then replace it when the (possibly slow, cold-start) server responds.
const PREFIX = 'cache:';

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCache(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* storage full or unavailable: cache is optional */ }
}
