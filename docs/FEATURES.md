# Features

The complete inventory of what Arc Insights does, organized by category. **157 features across 17 categories**, each tagged with priority (P0 launch blocker · P1 first 6 months · P2 strategic differentiator · P3 future).

> **Tasks vs features.** Not every feature has a ROADMAP task ID yet. Tasks are assigned when scope is sized; everything in P1 is fair game across Phase 1 and Phase 2.

★ marks the two strategic must-haves: **Embedded Analytics** and **On-Prem & Self-Hosted**.

---

## 1. Data Connectivity (15)

- [ ] Postgres connector — P0
- [ ] MySQL/MariaDB connector — P0
- [ ] BigQuery connector — P0
- [ ] Snowflake connector — P0
- [ ] Redshift / Databricks connectors — P1
- [ ] MongoDB / NoSQL connector — P2
- [ ] REST / Google Sheets / CSV — P1
- [ ] Federated multi-DB joins — P2
- [ ] SSH tunnels & private networking — P0
- [ ] Schema auto-discovery on connect — P0
- [ ] Dataset preview & profiling on connect (null counts, distincts, freshness, sample rows, suggested joins) — P1
- [ ] Connection setup wizard (multi-step UI for adding a data source) — P1
- [ ] Schema-drift detection — P2
- [ ] Connection-level RBAC — P1
- [ ] Read-replica routing — P2

## 2. Query Building (14)

- [ ] Visual no-code query builder — P0
- [ ] Raw SQL editor with autocomplete — P0
- [ ] Query parameters / variables — P0
- [ ] Saved queries with versioning — P1
- [ ] Query history with runtime + cache + plan visibility — P1
- [ ] Query results cache — P0
- [ ] Query cost preview — P1
- [ ] Async / background queries — P1
- [ ] Cohort builder — P2
- [ ] Funnel builder — P2
- [ ] Retention / heatmap builder — P2
- [ ] Segmentation builder — P2
- [ ] Attribution analysis — P3
- [ ] Pivot table / spreadsheet cells — P2

## 3. Semantic / Modeling Layer (8)

- [ ] Define metrics in code (YAML) — P1
- [ ] Dimensions, joins, hierarchies — P1
- [ ] Git-backed model versioning — P1
- [ ] dbt project import — P1
- [ ] Pre-aggregations / materializations — P2
- [ ] Auto-suggest pre-aggs from usage — P2
- [ ] Per-metric documentation & lineage — P1
- [ ] Full lineage graph (chart → dataset → source → column) with impact analysis — P2

## 4. Visualizations (12)

- [ ] Core charts (line / bar / area / pie / scatter) — P0
- [ ] Tables and big-number cards — P0
- [ ] Pivot tables — P0
- [ ] Maps (geo + choropleth) — P1
- [ ] Heatmaps, treemaps, sankey — P2
- [ ] Cohort heatmap & funnel chart — P2
- [ ] Conditional formatting — P1
- [ ] Annotations on charts — P2
- [ ] Drill-down / drill-through — P1
- [ ] Cross-filter between charts — P1
- [ ] Per-chart lineage & explainability panel (source DB → table → metric def → filter chain → runtime → cache hit) — P1
- [ ] Custom viz plugin SDK — P3

## 5. Dashboards & Reports (10)

- [ ] Grid drag-and-drop layout — P0
- [ ] Global + per-chart filters — P0
- [ ] Tabs / multi-page dashboards — P1
- [ ] Mobile-responsive layout — P0
- [ ] Dashboard templates / starters — P1
- [ ] AI-suggested dashboards on connect — P2
- [ ] Subscriptions (email / Slack digest) — P0
- [ ] PDF / PNG / CSV export — P0
- [ ] Overview hub (recently viewed, favorites, alerts-needing-attention, cache health) — P1
- [ ] Scheduled export history & re-run — P1

## 6. Collaboration & Versioning (7)

- [ ] Save / share / fork — P0
- [ ] Real-time co-editing (CRDTs) — P2
- [ ] Threaded comments anchored to charts — P1
- [ ] Version history — P1
- [ ] Visual diff between versions — P2
- [ ] Branches / drafts with PR review — P2
- [ ] Activity feed — P1

## 7. AI / Natural Language (8)

- [ ] NL Q&A grounded in semantic layer — P2
- [ ] AI-generated chart from a question — P2
- [ ] "Why did X change?" explainer — P2
- [ ] AI dashboard summary — P2
- [ ] AI SQL pair-programmer — P1
- [ ] Anomaly detection + push notify — P2
- [ ] Monitoring + acting agent — P3
- [ ] AI conversation history & threading — P2

> All AI features go through one swappable endpoint. See [docs/AI-SURFACES.md](#) for the full map.

## 8. Sharing / Distribution (7)

- [ ] Tokenized public share links — P1
- [ ] Public dashboards (no login) — P1
- [ ] Slack interactive cards (Block Kit) — P2
- [ ] Microsoft Teams adaptive cards — P2
- [ ] Webhook delivery — P1
- [ ] Mobile push notifications with chart — P3
- [ ] Watermarking / tenant branding on shares — P2

## 9. Embedded Analytics ★ (16) — STRATEGIC MUST-HAVE

- [ ] Signed-JWT iframe embedding — P0
- [ ] React / JS / Vue SDKs — P0
- [ ] Auto-resize / responsive iframe — P0
- [ ] White-labeling (logos, colors, fonts) — P0
- [ ] Multi-tenant data isolation — P0
- [ ] Theme via CSS variables / dark mode — P1
- [ ] Chart-level embed (single widget) — P1
- [ ] postMessage event hooks — P1
- [ ] SSO passthrough from parent app — P1
- [ ] Per-tenant subdomain / custom domain (CNAME) — P1
- [ ] Locale / timezone passthrough — P1
- [ ] Embedded usage analytics for clients — P1
- [ ] Embed admin console (allowed-domains, per-customer feature flags, theme controls, usage rollup) — P1
- [ ] Embedded query builder for end-customers — P2
- [ ] Print-friendly / PDF render of embedded view — P2
- [ ] Resource isolation per tenant — P1

## 10. Cost & Performance (6)

- [ ] Per-query $ display — P1
- [ ] Per-dashboard $/day rollup — P1
- [ ] Per-user / per-tenant query budgets — P2
- [ ] Auto-pause runaway queries — P2
- [ ] Result + query plan caching — P0
- [ ] Materialization recommendations — P2

## 11. Closed-Loop Actions (7)

- [ ] Threshold + anomaly alerts — P0
- [ ] Action triggers (Slack / Linear / Jira / PagerDuty) — P2
- [ ] dbt / Airflow job triggers — P3
- [ ] Write-back to warehouse — P3
- [ ] Reverse-ETL syncs (Salesforce / Braze / Hubspot) — P3
- [ ] Action buttons on dashboards — P3
- [ ] Alert history & incident timeline — P1

## 12. Security & Governance (10)

- [ ] Email/password auth — P0
- [ ] SSO (SAML / OIDC / Google) — P0
- [ ] MFA / 2FA — P1
- [ ] RBAC (groups + roles) — P0
- [ ] Row-level + column-level permissions — P1
- [ ] Audit log (machine + readable) — P1
- [ ] Synthetic / demo mode — P2
- [ ] Data masking & redaction — P1
- [ ] IP allowlist & session controls — P2
- [ ] SOC 2 / GDPR / HIPAA hooks — P2

## 13. Mobile (4)

- [ ] Mobile-responsive web — P0
- [ ] iOS / Android viewer apps — P2
- [ ] Mobile-first chart authoring — P3
- [ ] Offline mode for cached dashboards — P3

## 14. Admin / Ops (7)

- [ ] Workspace / org management — P0
- [ ] User management UI — P0
- [ ] Usage analytics on the product itself — P1
- [ ] Workspace backup & restore — P1
- [ ] Multi-region deployment (cloud) — P3
- [ ] Tenant admin UI (list, settings, themes, usage, support impersonation) — P1
- [ ] Workspace settings admin UI (branding, LLM provider, KMS) — P1

## 15. On-Prem & Self-Hosted ★ (14) — STRATEGIC MUST-HAVE

- [ ] Single-binary / single-container deploy — P0
- [ ] Production Helm chart (HA) — P0
- [ ] Air-gapped install (no internet egress) — P0
- [ ] Telemetry opt-out / fully offline mode — P0
- [ ] On-prem backup & restore tooling — P0
- [ ] Bring-your-own metadata DB (Postgres / MySQL) — P1
- [ ] Zero-downtime upgrade path — P1
- [ ] License-key activation & enforcement — P1
- [ ] Customer-managed encryption keys (BYOK / CMEK) — P1
- [ ] On-prem admin/health dashboard — P1
- [ ] Hardened container images (distroless / Wolfi) — P2
- [ ] Air-gapped license & update bundle — P2
- [ ] Long-term support (LTS) release line — P2
- [ ] FIPS / FedRAMP / IL4 compatibility — P3

## 16. Developer Experience (7)

- [ ] REST + GraphQL API — P1
- [ ] Python and TypeScript SDKs — P1
- [ ] CLI — P2
- [ ] Webhook events — P2
- [ ] Public docs + OpenAPI spec — P1
- [ ] Connector SDK (community-authored data sources) — P3
- [ ] API key management UI — P1

## 17. Internationalization (5)

- [ ] Multi-language UI (EN, ES, PT, FR, DE, JA, KO, ZH, AR, HI) — P2
- [ ] RTL layout support — P2
- [ ] Locale-aware number / date / currency — P1
- [ ] Time-zone handling — P0
- [ ] Configurable week-start / fiscal calendar — P1

---

## Counts by priority

- **P0 (MVP launch blockers):** 38
- **P1 (first 6 months):** 61
- **P2 (strategic differentiators):** 45
- **P3 (future / backlog):** 13

**Total: 157 features**
