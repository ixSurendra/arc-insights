# Arc Insights — design brief

A self-contained brief for designing UI for the Arc Insights product.
Hand this to a design tool, a designer, or Claude design mode — every
constraint a screen needs is in here.

---

## 1. Product in one line

**An open-source, embeddable BI platform that ships to other people's
servers — including air-gapped ones.** Connect a database, build
dashboards visually or with SQL, embed them anywhere.

## 2. Who it's for

Three audiences, in priority order:

1. **Internal data teams** at small-to-mid B2B SaaS companies who today
   pay Looker $$$ or wrestle with Superset's ops surface. _Persona: data
   analyst or engineer, technical, comfortable with SQL._
2. **Embed customers** — B2B SaaS founders who want to ship analytics
   inside _their_ product without building it themselves. _Persona:
   product manager + engineer pair; the analytics is one feature among
   many._
3. **Regulated / on-prem enterprises** — banks, healthcare, government —
   who can't use cloud BI for compliance reasons. \_Persona: VP of data
   - IT/security; long sales cycle.\_

## 3. The four star differentiators

Designs should reinforce these. They are the reason this product exists:

| ★                        | What                                                               | Where it shows up in UI                                                               |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Embed-first**          | Signed-JWT iframes + React/Vue SDKs, white-label via CSS variables | Embed admin console, theme controls, "copy embed code" affordances on every dashboard |
| **On-prem & air-gapped** | Single-binary, Helm chart, license-key activation                  | Health page, license management, "offline mode" indicators                            |
| **BYO everything**       | Your DB, your KMS, your LLM                                        | Settings reveals the BYO surface; nothing hides "you can swap this"                   |
| **Cost transparency**    | Per-query $ on Snowflake/BigQuery, budgets, auto-pause             | Cost chips on every chart, budget bars in admin, alerts when runaway                  |

## 4. The four pillars (UX-SPEC §0)

These are binding UX requirements, not aspirations:

1. **Generous play area — Figma-feel, not Excel-feel.** Canvas extends
   beyond viewport. Pan with space-drag. Zoom 25–200%. Snap-to-grid is
   a toggle, not a constraint.
2. **Responsive layouts.** Desktop / tablet / mobile breakpoints with
   per-breakpoint manual overrides. Phone bezel preview on the editor.
3. **Cascading themes.** Workspace → dashboard → chart, each level can
   override. Embed customers brand via CSS custom properties — no
   recompile.
4. **Keyboard-first power-user UX.** Cmd+K command palette. Every primary
   action has a shortcut. Tab navigates charts; arrows nudge by 1 px
   (10 px with Shift). Visible focus rings only on `:focus-visible`.

## 5. Visual identity (today)

**Logo concept (placeholder):** "Arc Insights" wordmark. The "Insights"
half is highlighted in accent gold (`#F4B860`). A square gradient
swatch (primary → accent) sits to the left as a logo-mark stand-in.
**No real logo yet — designing one is welcome.**

### Color palette (CSS custom properties — see `frontend/src/ui/tokens.css`)

**Light theme:**

| Role                        | Token                   | Hex                   |
| --------------------------- | ----------------------- | --------------------- |
| Background                  | `--color-bg`            | `#FFFFFF`             |
| Background elevated (cards) | `--color-bg-elev`       | `#FAFBFC`             |
| Background subtle           | `--color-bg-subtle`     | `#F1F4F7`             |
| Background hover            | `--color-bg-hover`      | `#EEF2F6`             |
| Foreground                  | `--color-fg`            | `#0F172A`             |
| Foreground muted            | `--color-fg-muted`      | `#475569`             |
| Foreground subtle           | `--color-fg-subtle`     | `#94A3B8`             |
| Border                      | `--color-border`        | `#E2E8F0`             |
| Border strong               | `--color-border-strong` | `#CBD5E1`             |
| **Primary** (brand)         | `--color-primary`       | `#1F3A5F` (deep navy) |
| Primary hover               | `--color-primary-hover` | `#28456F`             |
| **Accent**                  | `--color-accent`        | `#F4B860` (warm gold) |
| Success                     | `--color-success`       | `#16A34A`             |
| Warning                     | `--color-warning`       | `#D97706`             |
| Danger                      | `--color-danger`        | `#DC2626`             |
| Info                        | `--color-info`          | `#2563EB`             |

**Dark theme** (most distinct from light):

| Role                | Hex                                                            |
| ------------------- | -------------------------------------------------------------- |
| Background          | `#0B1120`                                                      |
| Background elevated | `#111827`                                                      |
| Background subtle   | `#1A2233`                                                      |
| Foreground          | `#F1F5F9`                                                      |
| Foreground muted    | `#94A3B8`                                                      |
| Border              | `#1F2937`                                                      |
| **Primary in dark** | `#F4B860` (the gold becomes primary in dark mode for contrast) |

### Typography

- **Sans:** Inter (variable). Loaded from Google Fonts in `index.html`.
  Weights used: 400, 500, 600, 700.
- **Mono:** JetBrains Mono. Used in the SQL editor, code blocks,
  ⌘K-keycap chips.

### Type scale (px)

| Token         | Size | Use                                     |
| ------------- | ---- | --------------------------------------- |
| `--text-xs`   | 12   | Captions, hints, keyboard chips         |
| `--text-sm`   | 13   | Body in dense surfaces (sidebar, forms) |
| `--text-base` | 14   | Default body                            |
| `--text-md`   | 16   | Card titles, button-large               |
| `--text-lg`   | 20   | Section headings                        |
| `--text-xl`   | 24   | Page titles                             |
| `--text-2xl`  | 32   | Hero numbers (big-number cards)         |
| `--text-3xl`  | 48   | Marketing / empty-state hero            |

### Space (4 px base)

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64` exposed as
`--space-1`..`--space-16`.

### Radius

`4 / 6 / 8 / 12` (`--radius-sm` → `--radius-xl`) plus `--radius-full`.

### Shadow

Three levels: `sm` (subtle card), `md` (popovers, hover), `lg` (modals).

### Motion

Three speeds: `fast: 120ms`, `base: 180ms`, `slow: 280ms`. Easing:
`cubic-bezier(0.16, 1, 0.3, 1)` — fast in, slow out, "snappy but not
jarring."

## 6. Layout shell (`AppShell`)

A fixed, three-zone layout used on every page:

```
┌─ TopBar (56px) ─────────────────────────────────────────────┐
│ [logo] Arc Insights · Acme · Production    [⌘K]    [🌓]    │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Sidebar     │                                              │
│  (240px)     │  Main canvas                                 │
│              │  (responsive, max 1200px content,            │
│  Overview    │   24px padding)                              │
│  Dashboard   │                                              │
│  Builder     │                                              │
│  SQL         │  Optional right rail (320px)                 │
│  Data sources│  for chart properties / filters              │
│  Models      │                                              │
│  Team        │                                              │
│  Settings    │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- **TopBar:** workspace switcher pill (left), Cmd+K-styled global search
  trigger (center, currently a non-functional placeholder), theme toggle
  - user avatar (right).
- **Sidebar:** 6 nav items with Lucide icons. Sticky. Active item shows
  with `--color-bg-hover` background + `--color-fg` foreground.
- **Right rail:** appears in the builder for properties; will appear in
  dashboards for filters in editing mode.

## 7. Screens shipped today (need design polish)

### 7.1 Overview (`/`)

A landing page with the live `/health` JSON in a card and a 2-col grid
of all six chart types rendered from sample data. Demonstrates the
chart primitives.

### 7.2 Dashboard (`/dashboard`)

A 12-col grid with 4 sample charts: line + big-number on row 0,
bar + donut on row 1. A global filter bar at top — column / op / value —
that mutates every chart's spec.

### 7.3 Builder (`/builder`)

Two-column layout: a 420px form panel on the left (From / Dimensions /
Measures / Filters / Order / Limit) and a preview pane on the right
showing a live chart and the generated SQL. Chart-type tabs (Table /
Bar / Line / Pie / Big number) at the top of the preview.

### 7.4 SQL editor (`/sql`)

Monaco editor (light/dark, monospace, line numbers) inside a card. A
Run button that populates a result table card below.

## 8. Screens that need design (Phase 1+ roadmap)

### Phase 1 (next 2–3 weeks)

- **Login / sign-up / forgot-password.** Standard auth flow. P1-11.
- **Settings → Workspace.** Branding, theme presets, member management.
- **Settings → Billing.** Plan + usage + invoices.
- **Data sources → list.** Cards per source with status, last-tested,
  type icon. P1-01b.
- **Data sources → add new.** A multi-step form (pick driver → connect →
  test → name).
- **Models / metrics catalog.** Metrics-as-code surface (Phase 1 stub;
  full at P5-07).
- **Save dashboard / query** dialog with naming, tags, folder. P1-10.
- **Share dashboard** modal — copy-link, email invite, embed-code tab,
  scope to roles, expiring link toggle. P1-10/P3-03.
- **Subscription / digest setup** — schedule + recipients + format. P1-12.
- **Empty workspaces** — "Connect your first database" hero. UX-SPEC §6.

### Phase 3 (months 5–7) — Embed surface

- **Embed admin console** — allowed-domains list, per-customer feature
  flags, theme controls, usage rollup. P3-09.
- **Embedded dashboard** — iframe content; minimal chrome (no sidebar);
  parent app brands via CSS variables. P3-03.
- **Embed code generator** — JWT generator, snippet copy, three tabs
  for React / Vue / vanilla.

### Phase 5 (months 9–12) — Differentiators

- **Cost console** — per-query $, per-dashboard $/day rollup, budgets,
  auto-pause runaways. P5-01.
- **Cohort builder** — funnel/retention/heatmap visual builders. P5-02
  to P5-04.
- **AI NL Q&A panel** — chat-style, schema-grounded, refuses on
  ambiguity. P5-07.
- **Schema-drift detector** — banner above charts when an upstream
  column was renamed; one-click suggested mapping. P5-08.
- **Synthetic / demo mode** — sample-data toggle for screen recordings.
  P5-09.

## 9. Binding UX requirements (UX-SPEC §1–§4)

### 9.1 Canvas / play area

| Requirement             | Behavior                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Generous workspace      | Canvas extends beyond viewport. Pan with space-drag. Snap-to-grid optional.                     |
| Zoom 25–200%            | `Cmd/Ctrl+scroll` zooms. `Cmd+0` fits. `Cmd+1` 100%. Pinch on trackpad.                         |
| Collapsible side panels | Left panel hidden with `Cmd+\`. Right panel with `Cmd+/`.                                       |
| Minimap                 | Bottom-right when canvas exceeds viewport. Click-to-jump.                                       |
| Multi-select            | Shift-click + drag-selection-box. Bulk move/align/distribute/theme/delete.                      |
| Smart guides            | Snap to other charts' edges/centers while dragging. Right-click distribute evenly.              |
| Undo/redo               | `Cmd+Z` / `Cmd+Shift+Z`. ≥50 levels.                                                            |
| Keyboard nav            | Tab through charts. Arrow nudges 1 px (10 px with Shift). Delete removes. Enter opens settings. |
| Live cursors (P2)       | Show other users' cursors when real-time co-editing ships.                                      |

### 9.2 Responsive layouts

- **Three breakpoints**: Desktop ≥1280, Tablet 768–1279, Mobile <768.
  Toolbar device-icon switcher.
- **Live device preview**: Tablet → 1024px framed; Mobile → 375px with
  phone bezel. Optional side-by-side dual-breakpoint.
- **Auto-stack** + **per-breakpoint sizing** + **hide-on-device** toggle
  per chart per breakpoint.
- **Reorder for mobile** independently.
- **"Reset to auto-derived layout"** one-click revert per breakpoint.
- Optional **Print/PDF** as a 4th breakpoint.

### 9.3 Theming — three cascading layers

| Layer               | Set by          | Scope                          |
| ------------------- | --------------- | ------------------------------ |
| **Workspace theme** | Workspace admin | Whole product default          |
| **Dashboard theme** | Dashboard owner | Per-dashboard overrides        |
| **Chart theme**     | Chart author    | Per-chart override; final word |

- **Named theme presets**: Default / Dark / High contrast / Print /
  Brand A / Brand B.
- **Named color palettes**: Categorical / Sequential blues / Diverging
  red-blue / **Colorblind safe** / Brand.
- **Light/dark per chart** is allowed.
- **Embed theming via CSS custom properties** — runtime, no recompile.

### 9.4 Chart interactions

| Interaction        | Behavior                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| Hover tooltip      | Value + label + context (cost, last-refreshed, owner). Density without clutter. |
| Click-to-filter    | Cross-filters dashboard. Filtered chart shows a small "cross-filter" pill.      |
| Drill-down         | Click a top-level value to drill (Year → Quarter → Month).                      |
| Drill-through      | Right-click → "View underlying rows" in a side panel. Trust-builder.            |
| Resize / move      | Drag corners to resize, drag body to move. Snap-to-grid.                        |
| Inline rename      | Double-click chart title.                                                       |
| Right-click menu   | Edit / duplicate / delete / change type / copy link / export / copy as image.   |
| Cross-filter clear | "Clear filters" bar at top whenever filters active.                             |

### 9.5 Authoring shortcuts

- **`Cmd+K` command palette** — type "sales by region" → suggested chart.
- **`Cmd+D`** duplicates the selected chart.
- **Templates / starters** on new dashboard (5–10 industry/role).
- **AI-suggested starter dashboards** auto-generated from schema after
  DB connect.
- **Smart chart suggestions** — Tableau "Show Me" pattern, override-able.
- **Inline "Edit query"** opens the builder in a side panel without
  leaving the dashboard.
- **"Create mobile variant"** for dense charts.

## 10. State design — every one designed deliberately

UX-SPEC §6. These are not nice-to-have; they're load-bearing.

| State                 | Treatment                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Empty dashboard**   | Friendly illustration + "Add your first chart" CTA + templates link                                                |
| **Loading chart**     | Skeleton _matching the chart's shape_ (not a spinner). Animated shimmer.                                           |
| **Slow load (>3 s)**  | "Still loading…" + elapsed time + "Cancel query" button                                                            |
| **Empty result**      | Inline in chart: "No data for the selected filters." Show what filters are applied. Single action: "Clear filters" |
| **Query error**       | Inline (NOT modal). Plain-English message + collapsed failed SQL. Actions: "Try again" + "Edit query"              |
| **Permission denied** | "You don't have access to this dimension." _Don't reveal the dimension name if the user shouldn't see it._         |
| **Schema-drift**      | Banner above chart: "Column `customer_id` was renamed to `client_id`. Click to fix." One-click apply               |

Every state has a designed empty illustration / icon. Lucide icons are
the icon source today; brand illustrations would be a nice upgrade.

## 11. Embed-first implications for design

When the product is embedded inside a customer's app:

- **No top bar, no sidebar.** The dashboard is the entire content of an
  iframe.
- **Brand follows the parent app via CSS custom properties.** The
  customer can override `--color-primary`, `--font-family`, etc.,
  without rebuilding.
- **No Arc-branded chrome** unless the customer explicitly asks.
  Watermarks are an admin-flag feature for free-tier embeds.
- **Touch targets** matter — embed customers may run on tablets / kiosks.
- **postMessage events** flow up to the parent app: `filter-changed`,
  `chart-clicked`, `drill-through`. The parent app handles those.

## 12. Architecture context (so design choices match reality)

- **Frontend:** React 18 + Vite + TypeScript. Charts via Apache ECharts;
  tables via AG Grid Community (Quartz theme).
- **Backend:** Elysia + Bun. The visual builder emits a `QuerySpec` JSON;
  the backend compiles it to SQL per dialect (postgres/mysql/duckdb).
- **DB:** PostgreSQL (metadata). Customer DBs are remote — we don't
  control their schema.
- **Multi-tenant:** Postgres row-level security is load-bearing. Every
  domain table has `tenant_id`. Designs should never imply a "global"
  resource that crosses tenants.
- **No native mobile app yet.** Phase 6.
- **Real-time co-edit (cursors, live presence) lands at Phase 2** —
  designs should leave space for cursor avatars but not require them.

## 13. What design help would unblock the most right now

In rough priority order:

1. **Login + sign-up + forgot-password screens** — needed for the next
   engineering task (P1-11). Today there's no auth UI at all.
2. **Empty state illustrations / icons** — every state in §10 needs a
   designed asset. Lucide is a stopgap.
3. **Logo + favicon + open-graph image** — the gradient-square logo-mark
   is a placeholder.
4. **Dashboard "view" vs "edit" mode treatment** — today both are the
   same; edit mode needs the right rail, dim/measure swap controls,
   undo/redo affordances.
5. **Embed admin console mock** — allowed-domains, feature flags, theme
   override surface. Needed for P3-09.
6. **Marketing / docs site visual identity** — `docs-site/` is plain
   Mintlify defaults. The product chrome and the docs site should feel
   related.
7. **Mobile breakpoint specifics** — the responsive rules are written
   but no specific mobile mock exists yet.

## 14. Hard constraints (don't propose these away)

- **AGPLv3 license.** Designs reflecting "open source" are part of the
  story. The OSS toggle in the topbar is important.
- **Multi-tenant from day 1.** Designs can't imply a single-tenant
  product even if Phase 1 ships single-tenant first.
- **Cascading themes via CSS custom properties.** Any design that
  hard-codes color values can't be themed by embed customers.
- **Keyboard-first.** Every interaction must be reachable with a
  keyboard, not just clickable.
- **Accessibility — WCAG AA** at minimum. Color-blind safe palette
  exists; contrast on `--color-fg-muted` against `--color-bg-elev`
  passes 4.5:1.

## 15. Deliverables (what would help most, ranked)

1. **Login screen mocks** (light + dark, mobile + desktop) — direct
   unblocker for P1-11.
2. **Empty state pack** — illustrations for each of the 7 states in §10.
3. **Logo + wordmark + favicon** in SVG, with light + dark variants.
4. **Color palette refinement** — the gold accent works in dark, less
   so on light primary buttons; the ratio could be re-balanced.
5. **Dashboard edit-mode mock** — chart selection halo, drag handle,
   right-rail properties panel, the Cmd+K palette overlay.
6. **Mobile breakpoint mocks** — overview + dashboard at 375px.
7. **Embed-mode mock** — same dashboard inside a parent app's chrome,
   showing CSS-variable theming applied.

## 16. References

- [`docs/UX-SPEC.md`](./UX-SPEC.md) — full UX requirements
- [`docs/AI-SURFACES.md`](./AI-SURFACES.md) — every AI surface + privacy
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — system design
- [`docs/FEATURES.md`](./FEATURES.md) — full feature inventory
- [`docs/ROADMAP.md`](./ROADMAP.md) — what ships when
- [`docs/adr/0001-stack-choice.md`](./adr/0001-stack-choice.md) — why this stack
- [`frontend/src/ui/tokens.css`](../frontend/src/ui/tokens.css) — current tokens
- Repo: <https://github.com/ixSurendra/arc-insights>
