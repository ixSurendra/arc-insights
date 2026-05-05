/**
 * Arc Insights SDK
 *
 * Type-safe client generated from Elysia routes via Eden Treaty.
 * Once imported in a client app, every backend route is fully typed —
 * rename a route field on the server and TypeScript breaks here at compile time.
 */
import { treaty } from '@elysiajs/eden';
import type { App } from '@arc-insights/backend/src/index';

export interface ArcInsightsClientOptions {
  /** Base URL of the Arc Insights API. Defaults to current origin. */
  baseUrl?: string;
  /** Optional JWT for embedded analytics or authenticated requests. */
  token?: string;
}

export function createArcInsights(options: ArcInsightsClientOptions = {}) {
  const baseUrl = options.baseUrl ?? '';
  return treaty<App>(baseUrl, {
    headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
  });
}

export type ArcInsightsClient = ReturnType<typeof createArcInsights>;
