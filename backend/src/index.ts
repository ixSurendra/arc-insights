/**
 * Arc Insights — Backend entry point
 *
 * Elysia + Bun. Single process. Hot-reload in dev.
 *
 * Routes are versioned under /v1. Add new feature modules under src/features/
 * and mount them here.
 */
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

const PORT = Number(process.env.PORT ?? 3000);

const _app = new Elysia()
  .use(cors())
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "Arc Insights API",
          version: "0.1.0",
          description: "Open-source BI and embedded analytics.",
        },
      },
    }),
  )
  // ─── Health ─────────────────────────────────────────────────────
  .get(
    "/health",
    () => ({
      status: "ok",
      service: "arc-insights",
      version: process.env.APP_VERSION ?? "dev",
      timestamp: new Date().toISOString(),
    }),
    {
      detail: { summary: "Liveness check" },
      response: t.Object({
        status: t.String(),
        service: t.String(),
        version: t.String(),
        timestamp: t.String(),
      }),
    },
  )
  // ─── v1 routes ──────────────────────────────────────────────────
  .group("/v1", (app) =>
    app.get("/hello", () => ({ message: "Hello from Arc Insights v1" })),
  )
  .listen(PORT);

console.info(`🚀 Arc Insights API listening on http://localhost:${PORT}`);
console.info(`📚 API docs at http://localhost:${PORT}/docs`);

// Export the app type so the SDK package can consume it via Eden Treaty
export type App = typeof _app;
