# Dashboard Builder — UX Spec

The dashboard builder is the surface users spend ~80% of their time in. Get this right or lose adoption. This spec captures the binding UX requirements; deviations require a documented justification.

## The four pillars

1. Generous play area — Figma-feel, not Excel-feel
2. Responsive layouts for desktop / tablet / mobile, with manual overrides per breakpoint
3. Cascading themes (workspace → dashboard → chart)
4. Keyboard-first power-user UX

---

## 1. Canvas / Play Area

| Requirement | Behavior |
|---|---|
| **Generous workspace** | Canvas extends well beyond the visible viewport. Pan with space-drag (Figma-style) or scroll. Snap-to-grid optional via toggle. |
| **Zoom 25%–200%** | Cmd/Ctrl + scroll zooms. Cmd/Ctrl + 0 fits all charts. Cmd/Ctrl + 1 zooms to 100%. Pinch-to-zoom on trackpad. |
| **Collapsible side panels** | Left panel (chart library) hidden with Cmd+\\. Right panel (chart properties) hidden with Cmd+/. Maximises canvas on demand. |
| **Minimap for large dashboards** | Bottom-right minimap appears when dashboard exceeds viewport. Click-to-jump. |
| **Multi-select + bulk ops** | Shift-click multiple charts; drag a selection box. Bulk move, align, distribute, apply theme, delete. |
| **Smart guides + alignment** | Snap to other charts' edges and centers while dragging. Distribute evenly via right-click menu. |
| **Undo / redo** | Cmd+Z / Cmd+Shift+Z. At least 50 levels deep. Reverses chart adds, deletions, theme changes, layout changes. |
| **Keyboard navigation** | Tab through charts. Arrow keys nudge by 1px (10px with Shift). Delete removes. Enter opens chart settings. |
| **Live cursor + presence (P2)** | Show other users' cursors and selections when real-time co-editing ships. |

## 2. Responsive layouts

| Requirement | Behavior |
|---|---|
| **Three breakpoints** | Desktop (≥1280px), Tablet (768–1279px), Mobile (<768px). Switcher in toolbar with three device icons. |
| **Live device preview** | Switching to Tablet view shows a 1024px-wide framed preview. Mobile shows 375px with phone bezel. Optional side-by-side preview of two breakpoints. |
| **Auto-stack on smaller screens** | Charts side-by-side on desktop stack vertically on tablet/mobile. Filters move to a top drawer on mobile (collapsible). Auto-derived from desktop layout — sensible 80% of the time. |
| **Per-breakpoint chart sizing** | Each chart can have a different size per breakpoint. Big-number cards full-width on mobile, half-width on tablet, quarter-width on desktop. |
| **Hide-on-device toggle** | Each chart has visibility per breakpoint: Desktop ✓ / Tablet ✓ / Mobile ✗. |
| **Reorder for mobile priority** | User can reorder charts independently in mobile view to put the most important one first. Doesn't affect desktop. |
| **Per-breakpoint filter placement** | Filters can be in sidebar on desktop, top bar on tablet, drawer on mobile. |
| **Reset breakpoint** | "Reset to auto-derived layout" button reverts overrides for one breakpoint in one click. |
| **Print / PDF layout** | Optional 4th breakpoint, oriented for A4/Letter. Auto-derived from desktop, separately adjustable. |

## 3. Theming — three layers that cascade

| Layer | What it controls | Who sets it |
|---|---|---|
| **Workspace theme** | Default colors, typography, spacing, light/dark mode, brand logo, fonts. Applies to the whole product unless overridden. | Workspace admin in Settings → Branding. |
| **Dashboard theme** | Per-dashboard overrides — different background, palette, font scale. Inherits from workspace. | Dashboard owner via Dashboard Settings → Theme. |
| **Chart-level theme** | Per-chart overrides — different palette, accents, padding, label sizes. Inherits from dashboard. Final word for that chart. | Chart author via right-panel "Theme" tab. |

**Theme presets:** Workspace admins define named presets ("Default", "Dark", "High contrast", "Print", "Brand A", "Brand B"). Users pick from them with one click.

**Color palettes:** Named palettes ("Categorical", "Sequential blues", "Diverging red-blue", "Colorblind safe", "Brand"). Workspace admin defines; chart author picks per chart.

**Light / dark per chart:** A single dark chart in a light dashboard is allowed (or vice versa). Useful for emphasis.

**Embed theming:** White-labeling exposed via CSS custom properties (`--color-primary`, `--font-family`, etc.). Compile-free runtime overrides. Per-tenant logos, colors, fonts for embedded analytics.

## 4. Chart interactions

| Interaction | Behavior |
|---|---|
| **Hover tooltips** | Show exact values, dimension labels, contextual info (cost, last refreshed, owner). Density without clutter. |
| **Click-to-filter** | Clicking a bar / point / cell filters the rest of the dashboard. Visual indicator: filtered chart shows a small cross-filter pill. |
| **Drill-down** | Click a top-level value to drill into the next level (Year → Quarter → Month). |
| **Drill-through** | Right-click → "View underlying rows" opens raw data in a side panel. Trust-builder. |
| **Resize / move** | Drag corners to resize, drag the chart to move. Snaps to grid. |
| **Inline rename** | Double-click chart title to edit in place. |
| **Right-click menu** | Edit, duplicate, delete, change chart type, copy link, export, copy as image. Power-user shortcut for everything. |
| **Cross-filter clear** | When filters are applied, a "Clear filters" bar shows at the top. Users get lost otherwise. |

## 5. Authoring shortcuts

| Feature | Behavior |
|---|---|
| **Quick chart insert** | Cmd+K opens command palette. Type "sales by region" → suggested chart appears. |
| **Duplicate as variation** | Cmd+D on selected chart. Tweak metric or dimension without rebuilding. |
| **Templates and starters** | New Dashboard → "Start from template". 5–10 industry/role templates seeded with sample charts. |
| **AI-suggested dashboards on connect** | After connecting a database, auto-generate 3–5 starter dashboards based on the schema. |
| **Smart chart suggestions** | Tableau's "Show Me" pattern — pick the best chart type based on result shape. User can override. |
| **Inline edit query** | Click chart → "Edit query" opens query builder in side panel without leaving dashboard. |
| **Duplicate to mobile-only** | Right-click chart → "Create mobile variant" for charts too dense for mobile. |

## 6. States — design every one specifically

| State | Design rule |
|---|---|
| **Empty dashboard** | Friendly illustration + "Add your first chart" CTA + link to templates. |
| **Loading chart** | Skeleton matching chart shape (not generic spinner). Animated shimmer. |
| **Slow loading (>3s)** | Show "Still loading..." with elapsed time. Offer "Cancel query". |
| **Empty data result** | Inside the chart container: "No data for the selected filters." Show what filters are applied. Single action: "Clear filters". |
| **Query error** | Inline in the chart, not a modal. Plain-English error message + the SQL that failed (collapsed). Actions: "Try again" + "Edit query". |
| **Permission denied** | "You don't have access to this dimension." Don't reveal what the dimension is named if user shouldn't see it. |
| **Schema-drift detected** | Banner above the chart: "The column `customer_id` was renamed to `client_id`. Click to fix." One-click apply. |

---

## Mental model

Treat the dashboard builder like Figma — roomy canvas, keyboard-first power, cascading themes, multi-device live preview with manual override. Not like Excel.
