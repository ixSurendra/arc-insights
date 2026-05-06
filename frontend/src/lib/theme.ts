/**
 * Tiny theme helper. The persisted setting on <html data-theme="…">
 * overrides the system preference; the bootstrap script in main.tsx
 * runs synchronously to avoid a flash of the wrong theme on load.
 */
export type Theme = "light" | "dark";

const STORAGE_KEY = "arc-insights:theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  // Hex-inspired identity is dark-first. Light is the explicit toggle.
  return "dark";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(current: Theme): Theme {
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
