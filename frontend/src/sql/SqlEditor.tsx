import Editor, { type Monaco } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { getInitialTheme, type Theme } from "../lib/theme";

interface Props {
  value: string;
  onChange: (next: string) => void;
  height?: number | string;
}

/**
 * Monaco-wrapped SQL editor. Loads Monaco lazily — bundle splits keep
 * the initial / route fast. Theme follows the global light/dark setting
 * and re-applies whenever the user toggles via the topbar.
 */
export function SqlEditor({ value, onChange, height = 360 }: Props) {
  const [theme, setLocalTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Re-read the theme on each mount and on storage events from the
    // topbar toggle (different React tree).
    const onStorage = () => setLocalTheme(getInitialTheme());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    // Poll the data-theme attribute so the topbar toggle reflects here.
    const observer = new MutationObserver(() => {
      const next =
        (document.documentElement.getAttribute("data-theme") as Theme) ??
        "light";
      setLocalTheme(next);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
    >
      <Editor
        height={height}
        language="sql"
        value={value}
        theme={theme === "dark" ? "vs-dark" : "vs-light"}
        beforeMount={(monaco: Monaco) => {
          // Compact, opinionated SQL keyword list — Monaco's built-in SQL
          // language already provides reasonable defaults; this is a hook
          // for column-aware completions in P1-06b once we have real
          // schema scans.
          monaco.editor.defineTheme("vs-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {},
          });
        }}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: "all",
          tabSize: 2,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
