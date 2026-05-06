/**
 * Shared persistence helper for the Phase 1 Zustand stores. Uses
 * localStorage with a single versioned key prefix so a future schema
 * bump can wipe stale state in one place.
 *
 * SSR-safety: Vite renders client-only so direct `window.localStorage`
 * is fine, but we still wrap it to keep the option open for future
 * Astro/Next surfaces in marketing.
 *
 * Tests: Playwright runs each test in a fresh browser context so
 * localStorage starts empty — the stores fall back to their seed
 * state. Manual `make dev` runs preserve state across reloads.
 */
import {
  createJSONStorage,
  persist,
  type PersistOptions,
} from "zustand/middleware";

const STORAGE_PREFIX = "arc-v1";

/** Bump this version to invalidate every persisted slice at once. */
export const STORE_VERSION = 1;

export function arcStorageKey(slice: string): string {
  return `${STORAGE_PREFIX}:${slice}`;
}

/**
 * Wrap a slice configuration with sensible defaults: versioned key,
 * JSON storage, and a partialize hook callers can override to skip
 * methods or transient fields.
 */
export function persistSlice<T>(
  slice: string,
  options: Partial<PersistOptions<T, T>> = {},
): PersistOptions<T, T> {
  return {
    name: arcStorageKey(slice),
    storage: createJSONStorage(() => localStorage),
    version: STORE_VERSION,
    ...options,
  };
}

export { persist };

/** Clear every Arc slice in localStorage. Used by Settings → reset. */
export function resetAllArcStorage(): void {
  if (typeof localStorage === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`${STORAGE_PREFIX}:`)) keys.push(k);
  }
  for (const k of keys) localStorage.removeItem(k);
}
