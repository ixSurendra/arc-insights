# UX Spec — Phase 1

This is the canonical UX spec for Phase 1. Every section below was locked in design discussion and is binding for implementation.

**Phase 1 product model:** Tenants connect a data source or upload a CSV → Arc auto-detects the data model → tenants build **widgets** (saved questions) → group widgets into **dashboards** (responsive grid) and **reports** (flowing documents) → embed dashboards/reports anywhere. AI assists at every step.

**Out of scope for Phase 1** (deferred to Phase 2): authentication wiring (the `ix-copilot` foundation handles it later), RBAC enforcement, license/quota gating, audit publishing, embed JWT signing, admin-portal integration. Phase 1 runs on a mock tenant + mock user.

---

## 1. Top-level navigation

Five surfaces in the left rail / activity bar:

1. **Home** — landing page after login
2. **Dashboards** — list + view + edit dashboards
3. **Widgets** — saved-question library (search, filter, reuse)
4. **Reports** — list + view + edit reports
5. **Data Model** — semantic layer (tables, columns, metrics, relationships, access policies)
6. **Data Sources** — connectors and CSV uploads

Settings, search, and the Ask AI input live in the topbar.

---

## 2. Home page

The first surface a returning tenant sees. Brand-new tenants are routed through the onboarding flow (§3) first.

### Above the fold

1. **Greeting + pulse stats** — _"Good morning, Aman."_ + 4 KPI tiles (queries today, spend MTD, p99 latency, cache hit rate) with delta pills.
2. **Persistent Ask AI input** — natural-language query box at the top. Returns a draft widget the user can preview, accept, or refine conversationally.
3. **Pinned / recent dashboards** — 4-tile responsive grid. Each card: folder pill (with accent), live/stale status dot, mono metric value + delta pill, 72-px sparkline, owner avatar + name + updated-at, hover-lift via `.arc-card-lift`.
4. **AI suggestion cards** — passive cards driven by the tenant's data: _"Based on your `orders` table, want a revenue-by-region widget?"_ Each card is dismissible; dismissed suggestions don't return for 30 days.

### Below the fold

5. **Recent widgets** — list view, click to open in widget builder
6. **Recent reports** — list view, click to open
7. **Recent activity** — who/what/when feed of team actions
8. **Alerts needing attention** — anomalies, refresh failures, quota warnings (sourced from in-product anomaly detection; delivery to email/Slack is Phase 2)
9. **Dashboard templates** — visible **only when the tenant has fewer than 3 dashboards**. Once they cross 3, hidden by default but toggleable in **Settings → Home page** ("Always show templates").

---

## 3. Brand-new tenant onboarding

First-login flow for a tenant with no data sources, dashboards, widgets, or reports.

1. **Skip welcome screen.** Land directly on the connect-data surface. A single-line greeting at the top is enough warmth.
2. **Two equal tiles:** _Connect a database_ · _Upload a CSV_. A small "I'll do this later" link drops them on an empty home page (escape hatch).
3. **Connect flow:**
   - **DB:** connection form (host, port, user, password, db) → test → save.
   - **CSV:** drag-drop or file picker → parse → confirm column types → name the table → import.
4. **AI narrates the schema scan in real time:**
   > _"Found 12 tables. `orders` looks like a fact table — `created_at` is a date, `amount` is a currency. `customers.country` looks geographic. Composing your starter dashboard…"_
   > This narration is part of the onboarding's AI-everywhere promise.
5. **Auto-generate the starter dashboard** (X-rays pattern) — Arc reads the schema, picks 4–6 sensible widgets (row counts, time series on date columns, top categories, geo if present), and shows the dashboard within ~10 seconds.
6. **Land on home page** — starter dashboard pinned, AI suggestion cards populated from real schema, templates section visible (since dashboard count is 1).

Auto-detected data model lives behind a non-blocking banner: _"Review your data model →"_. Banner persists on home until tenant confirms.

---

## 4. Dashboard view

The primary BI surface. Reference shape: the Metabase "Business overview" screenshot used during design.

| Part             | Behavior                                                                                                                                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Header**       | Dashboard title · folder · last refreshed · owner · right-side actions: Edit · Share · Embed · Refresh · Subscribe · Bookmark · More (…)                                                                                                                                                                    |
| **Filter bar**   | Always visible when filters exist. Date range + dropdowns + segments. Applies to every widget on the page.                                                                                                                                                                                                  |
| **Widget grid**  | Tiles on a responsive grid. Drag-resize in edit mode. Per-widget hover actions: drill in · download · full-screen · edit.                                                                                                                                                                                   |
| **Drill-down**   | Click a bar / slice / row filters the rest of the dashboard. Right-click → "See underlying rows" opens raw data side panel.                                                                                                                                                                                 |
| **Modes**        | Hybrid: view mode is default; each widget has a small inline pencil (visible to users with edit permission) that opens that one widget's editor in a slide-over without leaving the dashboard. The top-level pencil flips the whole dashboard into full edit mode (drag-resize layout, add/remove widgets). |
| **Auto-refresh** | Opt-in per dashboard via the More menu. Off by default to save query cost.                                                                                                                                                                                                                                  |
| **Comments**     | Skipped in v1. Phase 3+.                                                                                                                                                                                                                                                                                    |

### Embedded view

When a dashboard is rendered inside an iframe via the embed surface:

- **Default:** bare grid + filter bar (no header). Looks native in the host product.
- **Optional:** "Show header in embed" toggle in the embed config UI.
- Read-only by definition. Tenants cannot edit, save, share, or fork from an embed.

### Responsive behavior

Three breakpoints — desktop (≥1280px), tablet (768–1279px), mobile (<768px). Widgets auto-stack on narrower screens. Per-widget visibility-per-breakpoint toggle so a dense table can hide on mobile while a big-number stays visible. Filter bar collapses to a drawer on mobile.

### Theming — three cascading layers

1. **Workspace theme** — tenant-wide brand colors, logo, font. Sourced from `tenant-service` branding in Phase 2; mock values in Phase 1.
2. **Dashboard theme** — overrides for one dashboard. Useful when embedding in a partner product with different branding.
3. **Widget theme** — per-widget overrides for palette, background, font, padding. Final word for that widget.

Theme presets shipped: **Default · Dark · Print · Dense · Brand**. Pastel chart palette is the default and is **not** overridden by theme switches; themes change chrome (background, borders, density), not chart series colors.

### AI on the dashboard

- **"Ask a follow-up"** input below the dashboard — natural language, returns a new widget that respects current filters.
- **"Explain this widget"** button per widget — AI summarizes the chart in one sentence with the data backing it.
- **Anomaly callouts** — small badges on widgets when a metric breaks its normal pattern.
- **"Suggest dashboard arrangements"** — AI proposes new dashboards using the tenant's existing widgets.

---

## 5. Widget builder

The configurator a tenant lands in when they create a new widget.

### Three doors (entry paths)

When the tenant clicks **"+ New widget"**, they pick one:

1. **Ask AI** — natural language _"Show revenue by region for last 90 days as a bar chart"_ → AI returns a draft.
2. **Visual builder** — pick table → fields → aggregations → filters. No SQL.
3. **SQL editor** — Monaco editor with Data-Model-aware autocomplete.

All three doors converge on the **same configurator**.

### Configurator layout

Three zones, full-screen:

```
┌──────────────────┬─────────────────────────┬───────────────────┐
│ DATA (left)      │  LIVE PREVIEW (middle)  │  VIZ (right)      │
│                  │                         │                   │
│ • Source         │  Chart re-renders on    │  • Type picker    │
│ • Table          │  every change.          │  • Title          │
│ • Columns        │  Debounced 400 ms.      │  • Legend         │
│ • Filters        │  Pastel palette.        │  • Widget filters │
│ • Aggregations   │                         │  • Theme override │
│ • Group by       │                         │  • Number format  │
│ • Sort / limit   │                         │  • Axis options   │
│                  │                         │  • Cond. formatting│
│ [Run]            │                         │  • Goals / lines  │
│                  │                         │  • Sort order     │
│                  │                         │  • Empty state    │
│                  │                         │  • Tooltip        │
└──────────────────┴─────────────────────────┴───────────────────┘
```

### Smart chart-type suggestion + alternatives

When the query runs, the configurator picks the most likely chart type as the live preview, shows compatible alternatives as thumbnails on the right, and greys out incompatible types with a hover hint (_"line chart needs a date column"_). Switching types is one click.

### Widget catalog (Phase 1 — 18 chart types + 3 containers)

Variants are exposed as separate tiles in the picker (gallery-style).

**KPI / single value (4)** — Big number · KPI card (value + delta + sparkline) · Gauge · Progress bar
**Trend over time (4)** — Line · Area · Stacked area · Column (vertical bars over time)
**Categorical comparison (3)** — Bar (horizontal) · Stacked bar · Grouped bar
**Parts of whole (2)** — Pie · Donut
**Relationship (2)** — Scatter · Heatmap (matrix)
**Geographic (1)** — Choropleth map
**Tabular (2)** — Table · Pivot table
**Containers (3)** — Markdown / rich text · Image · Divider

Phase 2 expansion: Combo · Bullet · Funnel · Sankey · Waterfall · Treemap · Bubble map · Histogram · Box plot · Cohort retention · Word cloud.

### AI inside the builder

- Persistent "Ask AI" input at top — works even after starting in visual or SQL mode
- "Explain this widget" — one-sentence summary with cited tables/columns
- "Suggest improvements" — AI proposes config tweaks (_"Try grouping by month instead of day for a cleaner trend"_)
- "Auto-name" — AI suggests a name based on the widget's content

### Save metadata

- **Name** (required) · **Description** (used by AI search later) · **Folder** · **Tags**

Saved widgets appear in the Widget library (top-level nav) — searchable, filterable, draggable into any dashboard.

### Edit-once, update-everywhere

When a widget appears in N dashboards/reports and the tenant edits it, the change propagates to all N by default. A **Fork** action visible during edit clones the widget for one-off variants.

---

## 6. Widget library

Top-level nav surface. List of every saved widget in the workspace.

- **Filters:** folder, tag, owner, chart type, last edited
- **Search:** name, description, table, columns
- **Sort:** recently edited, recently used, alphabetical, most reused
- **Card preview:** type icon, title, mini-thumbnail, owner, last-edited, "used in N dashboards"
- **Bulk actions:** move folder, change tags, delete
- **Drag-drop:** drag a widget tile onto a dashboard in edit mode to add it

---

## 7. Reports

Reports are the second primitive — flowing documents that combine widgets and prose. Same widget library powers both dashboards and reports.

### Layout

Top-to-bottom flowing document (Notion / Google Docs feel), not a grid.

- Cover area: title · subtitle · date range · optional logo + tenant brand
- Optional AI-generated summary at the top (on by default, dismissible)
- Body: headings (H1–H3) · paragraphs · widgets dropped inline (full or half width) · tables · bullet/numbered lists · callouts · page breaks · images · dividers
- Filter bar at top (same UX as dashboards)
- Footer: tenant brand · page number · generated-at timestamp

### Three doors to create

1. **From a template** — Monthly business review · Weekly digest · Quarterly board pack
2. **From AI** — _"Generate a monthly sales report for me"_
3. **From scratch** — blank document

### Sharing — three ways

1. Live URL / iframe embed (read-only)
2. PDF / CSV-per-widget / XLSX export (one-shot file download)
3. Schedule + email — auto-generate weekly/monthly, deliver PDF + CSV attachment to a recipient list (delivery wiring lands in Phase 2; UI for setting up the schedule is Phase 1)

### Versioning

Every scheduled run produces a snapshot (frozen filter values + data + PDF). Tenants can browse old versions: _"Show me last March's sales report."_

### AI in reports

- Auto-summary at the top (on by default)
- "Write commentary for this section" — AI generates a paragraph explaining the widget below
- "Extend this report" — AI proposes new sections based on what's already there
- Anomaly callouts — auto-inserted callout boxes when data swings unusually

### Public link sharing

Tenants can generate a tokenized URL that requires no login. Off by default — gated behind a tenant-level setting "Allow public links" in workspace Settings.

---

## 8. Data Model — the semantic layer

A top-level surface where tenants teach Arc about their data once. Without it, AI guesses, raw IDs leak into widgets, and metric definitions drift across dashboards.

### Phase 1 depth — "B-plus"

| Layer                         | What it covers                                                                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tables & columns**          | Friendly names, FK relationships, display label column for each FK, field types (currency / percent / date / email / URL / category), hidden columns (passwords, internal flags)                                                                    |
| **Metrics & calculations**    | Calculated fields (`gross_margin = (revenue − cost) / revenue`) and named metrics (e.g. "Active Users") with canonical logic. Defined in a no-code builder (count, sum, avg, distinct, ratio of two metrics) **OR** SQL expression.                 |
| **Pre-defined joins**         | Paths between tables stored once. AI and visual builder use them; tenants don't re-pick joins per widget.                                                                                                                                           |
| **Row-level access policies** | Per-table rules referencing JWT claims (e.g. `customers.tenant_customer_id = $jwt.customer_id`). Visual rule builder for common cases + SQL expression escape hatch. **Policies are defined in Phase 1; runtime JWT enforcement lands in Phase 2.** |

### Phase 1 surface — three tabs

1. **Tables & columns** — table list, click in to edit names, hide columns, set field types, define FKs and label columns
2. **Metrics & calculations** — list of named metrics and calculated fields with definitions
3. **Access policies** — row-level rules per table

### Auto-detect on connect

On first DB connect or CSV upload, Arc runs auto-detect: FKs from constraints, label-column guesses (`name`/`title`/`label`), field-type guesses, and an AI pass that suggests metrics from common patterns. Results land in the Data Model UI for tenant review. A persistent banner on the home page says _"Review your data model →"_ until the tenant confirms.

### How the Data Model cascades

- **Visual builder** — auto-joins behind the scenes; columns appear as friendly names
- **SQL editor** — autocomplete suggests labels, pre-writes joins
- **AI builder** — reads model first; references named metrics by name, never re-derives them
- **Charts/tables** — display labels, never raw IDs
- **Filter dropdowns** — labels, not IDs
- **Number formatting** — auto-formats based on field type (currency column → `$1,234.56`)

### Deferred from Data Model in Phase 1

Pre-aggregations / materialized views · model versioning · model tests · hierarchies / drill paths. All Phase 3+.

---

## 9. Connect Data — the data sources surface

Two paths, both first-class:

- **Connect a database** — Postgres, MySQL, BigQuery, Snowflake (Phase 1 connectors). Form: host, port, user, password, database, optional SSH tunnel. Test connection before save.
- **Upload a CSV** — drag-drop or file picker. Parser detects column types; tenant confirms; names the table; imports. CSVs are stored as Postgres tables in the tenant's workspace database.

After connect, AI narrates the schema scan and the auto-generate starter-dashboard flow runs (§3 step 4–5).

### Data Sources list page

Top-level nav. Table of connected sources: name · type · status (healthy/stale/error) · latency · cache hit rate · last refreshed · actions (test, edit, disconnect).

---

## 10. AI — surfaces, behavior, contracts

Locked behavior, applies everywhere AI appears.

| Surface                           | Behavior                                                                |
| --------------------------------- | ----------------------------------------------------------------------- |
| Ask AI on Home                    | Conversational with persistent thread, streaming with visible reasoning |
| Ask AI in Widget builder          | Conversational, scoped to the current widget                            |
| Explain this widget / chart       | One-shot, streamed, plain English, cites tables/columns/metrics used    |
| Anomaly callouts                  | One-shot per widget, evaluated on render or on schedule                 |
| Auto-summary on reports           | One-shot, on by default at top of report, dismissible                   |
| Per-section commentary in reports | One-shot, on demand via "Write commentary" button                       |
| Auto-name                         | One-shot, suggests widget/dashboard/report name                         |
| Suggested dashboard arrangements  | One-shot, runs over the tenant's existing widgets                       |
| Schema-scan narration on connect  | Streamed, runs once per connect                                         |

### Behavior contracts

- **Streaming + visible reasoning** — collapsible "thinking" disclosure in every conversational surface
- **Act with confirmation on writes** — read queries run freely; saving a widget, editing the Data Model, or modifying RBAC asks once before applying
- **Never edit Data Model or RBAC autonomously** — must always be a tenant-driven action
- **Per-user persistent history** — Ask AI threads saved per user; "share thread" link generates a tenant-internal URL
- **Never fake an answer** — if AI is low-confidence or out-of-scope, it says so explicitly and offers an alternative ("Use the visual builder?")
- **Always cite the work** — every AI-returned widget shows the tables, joins, filters, and metrics it used

### BYO-LLM

OpenAI, Anthropic, Azure OpenAI, Ollama. Per-tenant configuration in Settings → AI.

**Phase 1 default provider:** Ollama Cloud (`https://ollama.com`). API key + model preset names are read from `backend/.env.local` (gitignored) via `ARC_LLM_PROVIDER` / `ARC_LLM_BASE_URL` / `ARC_LLM_API_KEY` / `ARC_LLM_MODEL_HIGH_QUALITY` / `ARC_LLM_MODEL_BALANCED` / `ARC_LLM_MODEL_FAST`. Default presets: `gpt-oss:120b` for high-quality, `gpt-oss:20b` for balanced/fast. Per-tenant provider configuration in the Settings UI lands in Phase 2.

- **Capability detection** at connect time — small benchmark prompt; downgrades UI affordances if the model can't reliably do tool use, structured output, or long context
- **Model presets** — high-quality / balanced / fast / local
- **Per-feature toggles** — tenant can disable individual AI features (e.g. turn off auto-summary for an Ollama setup that writes weak prose)
- **Token budget caps** — per-tenant per-month, visible in Settings, with usage meter (Phase 2 wires into license-service quotas)

---

## 11. Pagination & auto-aggregation rules

Locked defaults applied to every surface.

### Pagination (tables)

| Surface                                       | Behavior                                                                                                                                                                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Live web (dashboards / report-on-web / embed) | Server-side pagination + AG Grid virtual scroll · default page size 100 · search + column filters + multi-sort all server-side · pinned summary row (count/sum/avg) · row count "showing 1–100 of 12,432" always visible |
| PDF export                                    | Per-widget choice: **Top-N rows** (default 100, plus auto-attach CSV) · **Full table across pages** with repeating header (warns above 50 pages) · **Summary only**                                                      |
| CSV / XLSX export                             | Full data, capped at 1M rows (above that → schedule to S3/SFTP, Phase 5)                                                                                                                                                 |
| Hard caps                                     | Never load more than 100k rows into the browser. Surface the cap explicitly: _"showing first 100,000 rows — narrow your filters or export to CSV."_                                                                      |

### Chart auto-aggregation (automatic, decided by Arc)

| Chart type                | Trigger          | What we do                                                |
| ------------------------- | ---------------- | --------------------------------------------------------- |
| Line / area / time series | > ~500 points    | Roll up to next time grain (day → week → month → quarter) |
| Bar / pie / category      | > ~20 categories | Top 19 + "Other" bucket                                   |
| Scatter                   | > ~5,000 points  | Sample or hex-bin                                         |
| Map (regions)             | > ~200 regions   | Aggregate to coarser geography (city → state → country)   |

Always visible: small badge on the chart — _"Aggregated to weekly · why?"_ — click to expand the rule, with one-click _"show raw"_ override for power users.

---

## 12. Embed config UI (Phase 1: UI only)

Per-dashboard / per-report **Share & Embed** panel. Phase 1 builds the surface; Phase 2 wires the JWT signing and row-level enforcement.

Knobs the tenant gets:

- **Show header in embed** (default off — bare grid + filters reads native)
- **Locked filters** — pin filter values so embedded viewers can't change them
- **Hide chrome** — toolbar / footer / branding (per-tenant theme overrides)
- **Theme** — pick which theme preset the embed uses (independent of the tenant's workspace default — so they can ship a different look in their partner's product)
- **Allowed domains** — list of host domains where the iframe may render (CSP-style allowlist)
- **Expiry** — token TTL (15 min default, refreshable)
- **Custom claims preview** — show what claims the host app must put in the JWT for row-level access policies to work (driven by the tenant's Data Model rules)

Output: an iframe snippet + a code sample (Node, Python, Java) for signing the JWT server-side.

---

## 13. Templates content

### Dashboard templates (5)

- **Executive overview** — 4 KPI big numbers + trend line + geo map + top-N table
- **Sales pipeline** — funnel + deals by stage + win-rate trend + top reps + forecast
- **Marketing performance** — channel mix donut + campaigns table + conversion funnel + weekly trend
- **Operations / health** — uptime gauge + p99 latency line + error rate + top failures
- **Customer engagement / SaaS metrics** — DAU/MAU sparklines + activation funnel + retention cohort + feature adoption

### Report templates (3)

- **Monthly business review** — KPIs + AI-written callouts + supporting widgets, PDF-optimized
- **Weekly digest** — short scannable email-style report with KPI deltas + 3 highlights
- **Quarterly board pack** — multi-page formal pack: executive summary + trended KPIs + risks + forward-looking metrics

### Theme presets (5)

- **Default** — calm, modern, pastel charts, neutral chrome
- **Dark** — dark backgrounds, slightly desaturated pastel charts for legibility
- **Print / PDF** — white background, high contrast, no gradients, page-break aware
- **Dense** — tight spacing for ops/monitoring
- **Brand** — slots tenant primary/secondary into chrome (charts stay pastel)

### Layout patterns (4) — empty frames for Layout-only mode

- Executive (4 KPIs + 2 charts + 1 table)
- Operational (4×3 dense grid)
- Funnel / vertical flow
- Comparison (side-by-side period A vs period B)

### Smart-fill flow

Tenant picks a template → AI maps the template's required fields to the tenant's actual columns from the Data Model → tenant **confirms the mapping** before generation → widgets generate on real data → tenant lands on the new dashboard ready to tweak.

---

## 14. States — design every one

| State                               | Rule                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Empty home page (no dashboards yet) | Show 5 templates prominently + persistent Ask AI input + "Connect data" tile                                        |
| Empty dashboard                     | Friendly illustration + "Add your first widget" CTA + link to templates                                             |
| Loading widget                      | Skeleton matching widget shape (not a generic spinner)                                                              |
| Slow loading (>3s)                  | "Still loading…" with elapsed time. "Cancel query" action.                                                          |
| Empty data result                   | Inside the widget: "No data for the selected filters." Show applied filters. Single action: "Clear filters".        |
| Query error                         | Inline in the widget. Plain-English message + the SQL that failed (collapsed). Actions: "Try again" + "Edit query". |
| Schema drift                        | Banner above the widget: _"The column `customer_id` was renamed to `client_id`. Click to fix."_ One-click apply.    |
| AI low-confidence                   | "I'm not sure — would you like to use the visual builder?" with a clear handoff link.                               |

---

## 15. Cross-cutting design tokens

- **Font:** Inter (UI), JetBrains Mono (mono).
- **UI accent:** electric cyan `#22d3ee` (unchanged from current tokens — pastel applies to charts only, not the product chrome).
- **Chart palette:** pastel by default. Soft purple, soft green, soft blue, peach, mint, soft amber, soft red. Saved as a durable preference; do not drift back to bright colors.
- **Spacing:** 4 px base scale.
- **Motion:** 120 ms / 200 ms / 320 ms with `cubic-bezier(0.16, 1, 0.3, 1)` ease.
- **Background patterns** (textured surfaces): dots · grid · noise · mesh gradient. Used on Home page; rest of product stays clean.

---

## Mental model

Treat Arc Insights as **Metabase + AI + better embedded analytics**. Dashboard-first BI tool with widgets as the primitive, reports as the second primitive, semantic layer as the foundation, AI as the differentiator. Not a notebook. Not a Figma canvas.
