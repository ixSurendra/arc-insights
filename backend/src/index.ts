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
import { SpanStatusCode, type Span } from "@opentelemetry/api";
import { aiRoutes } from "./ai/routes";
import { tracer } from "./telemetry";

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
  // ─── Telemetry (P0-16): one span per request ─────────────────────
  // No SDK provider is registered in Phase 0, so these spans are no-ops
  // at runtime. P2-09 wires the OTLP exporter and they begin flowing.
  .derive(({ request }): { span: Span } => {
    const url = new URL(request.url);
    return {
      span: tracer.startSpan(`${request.method} ${url.pathname}`, {
        attributes: {
          "http.method": request.method,
          "http.target": url.pathname,
          "http.url": request.url,
        },
      }),
    };
  })
  .onAfterResponse(({ span, set }) => {
    const status = typeof set.status === "number" ? set.status : 200;
    span.setAttribute("http.status_code", status);
    span.setStatus({
      code: status >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.OK,
    });
    span.end();
  })
  .onError(({ span, error }) => {
    if (span) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.end();
    }
  })
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
  .use(aiRoutes)
  .listen(PORT);

console.info(`🚀 Arc Insights API listening on http://localhost:${PORT}`);
console.info(`📚 API docs at http://localhost:${PORT}/docs`);

// Export the app type so the SDK package can consume it via Eden Treaty
export type App = typeof _app;
