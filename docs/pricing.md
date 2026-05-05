# Pricing sketch — internal alignment

Internal-facing pricing model for Arc Insights. **Not yet public.** Numbers
here are starting positions for design-partner conversations, not committed
prices. Revisit before Phase 3 launch.

## Tiers (working draft)

| Tier              | Audience                                    | Price (USD)                | Includes                                                                                                                                                                | Doesn't include                                           |
| ----------------- | ------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Free OSS**      | Self-hosters                                | $0                         | Full product under AGPLv3. Single-binary or Helm. BYO Postgres, cache, LLM. Community Slack support.                                                                    | Embedded distribution rights. SLA. SOC 2 hosted.          |
| **Cloud Starter** | Solo founders / 5-seat teams                | $99 / month                | Hosted SaaS. 5 seats. Up to 10 dashboards. 25 k cached query responses / mo. Email support.                                                                             | Embed. SAML SSO. BYOK. Custom domain.                     |
| **Cloud Pro**     | Growing B2B SaaS that wants to embed        | $799 / month + usage       | Everything in Starter. 25 seats. **Embed enabled** (signed-JWT iframe + SDK). Per-tenant subdomains. SSO. 250 k QR / mo.                                                | On-prem. BYOK / CMEK. Air-gapped. License-key activation. |
| **Enterprise**    | Regulated, on-prem, or air-gapped customers | Annual contract, from $50k | Everything in Pro. **Self-hosted via Helm or single-binary.** BYOK / CMEK. License-key activation + offline validation. Air-gapped install bundle. SLA + named support. | —                                                         |

## Strategic shape

- **OSS is generous.** Mirrors the Metabase / GitLab dynamic — adoption is the moat. AGPLv3 protects against AWS-style hosted forks (see [`docs/adr/0002-license.md`](./adr/0002-license.md)).
- **Embed is the Pro-tier wedge.** The whole "embed-first" positioning is monetized at Pro+. It's the feature OSS users can't trivially deploy themselves (signed JWT key management, per-tenant subdomain wildcards, white-label CSS variables — all integrate cleanly but operationally meaningful).
- **On-prem is the Enterprise wedge.** Single-binary works in OSS, but the complete on-prem story (HA Helm, BYOK, license-key activation, air-gapped install bundle, SLA) is bundled into Enterprise.
- **Usage component above the included QR ceiling.** Soft cap at the included number of cached query responses (warning + email at 80%, hard cap at 100%, customer can raise). Avoids surprise bills.

## Design-partner pricing

Design partners (target: 3 by end of Phase 0) get **Cloud Pro free for 12 months** and a 50% discount on Enterprise for years 2+ in exchange for:

- Twice-monthly 30-min calls during Phase 1 + Phase 2
- A public case study post by Phase 5
- Permission to use their company name on the website (logo, not testimonial — testimonials separately)

## Open questions

- Per-seat vs per-monthly-active-viewer pricing for Cloud Pro? Looker is per-seat; Sigma is per-viewer. Embed customers especially care because their _customers_ are the viewers.
- LLM token costs in Cloud — bundle a free monthly allowance, or always pass-through with a markup? See [`docs/AI-SURFACES.md`](./AI-SURFACES.md) cost-model section.
- Does "Enterprise" gate the Helm HA chart, or do we ship it OSS too? The AGPLv3 license technically allows full self-host; the distinction is the SLA + commercial license + air-gapped bundle, not the chart.
- Connector marketplace revenue split when `P6-07` ships — 70/30? 80/20? Decide before the SDK opens to community contributors (`P3` of the connector SDK at the earliest).

## Status

- 2026-05-06 — first draft committed alongside `P0-22 Phase 0 EXIT review`. **Internal-only.**
- Next review: after design partner #1 signs.
