/**
 * P0-16 — OpenTelemetry skeleton.
 *
 * Phase 0 ships the API surface only: every request gets a span, but no
 * SDK provider is registered, so spans are no-ops at runtime. That keeps
 * the dev loop fast and dependency-light while establishing the call-site
 * pattern future code will follow.
 *
 * P2-09 (OpenTelemetry across all tiers) wires the actual SDK + OTLP
 * exporter. Once that lands, every span emitted via `tracer.startSpan(...)`
 * starts flowing to the collector at `OTEL_EXPORTER_OTLP_ENDPOINT` without
 * any other code changes.
 */
import { trace } from "@opentelemetry/api";

export const SERVICE_NAME = "arc-insights";

/** Default tracer for the service. Use this everywhere we want a span. */
export const tracer = trace.getTracer(
  SERVICE_NAME,
  process.env.APP_VERSION ?? "dev",
);
