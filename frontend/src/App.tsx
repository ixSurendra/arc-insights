import { useEffect, useState } from "react";
import { createArcInsights } from "@arc-insights/sdk";

const client = createArcInsights();
type Health = NonNullable<
  Awaited<ReturnType<typeof client.health.get>>["data"]
>;

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void client.health
      .get()
      .then(({ data, error }) => {
        if (error)
          setError(error.value ? String(error.value) : "request failed");
        else if (data) setHealth(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "request failed");
      });
  }, []);

  return (
    <main
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: 720,
        margin: "4rem auto",
        padding: "0 1.5rem",
        color: "#1F3A5F",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        Arc <span style={{ color: "#F4B860" }}>Insights</span>
      </h1>
      <p style={{ color: "#555", fontSize: "1.05rem" }}>
        Open-source BI and embedded analytics. Phase 0 — Foundation.
      </p>

      <section
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "#F4F7FB",
          borderRadius: 8,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>
          Backend health (via Eden Treaty SDK)
        </h2>
        {error && <pre style={{ color: "#9C2D0F" }}>Error: {error}</pre>}
        {health && (
          <pre
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: 4,
              fontSize: "0.9rem",
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        )}
        {!health && !error && <p style={{ color: "#777" }}>Loading…</p>}
      </section>

      <p style={{ marginTop: "2rem", color: "#777", fontSize: "0.85rem" }}>
        If you can read this and the JSON above came through
        `@arc-insights/sdk`, the typed SDK is live — Phase 0 task{" "}
        <code>P0-08</code> is done.
      </p>
    </main>
  );
}
