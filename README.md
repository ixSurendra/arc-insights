<div align="center">

# Arc Insights

**The open-source BI and embedded analytics platform.**
Connect your database, build dashboards, embed them anywhere — including on-premises and air-gapped environments.

[Quickstart](#quickstart) · [Documentation](https://docs.arcinsights.io) · [Roadmap](./docs/ROADMAP.md) · [Contributing](./CONTRIBUTING.md)

</div>

---

## Why Arc Insights

Most BI tools force a trade-off: easy-to-use but closed-source (Looker, Tableau), open-source but operationally heavy (Superset), or modern but locked to one cloud (Sigma, Hex). Arc Insights is the alternative — modern, open-source, and built from day one to ship to other people's servers, including air-gapped ones.

**Differentiators:**

- 🪶 **Single-binary deployment** — Bun-compiled binary or distroless Docker image. No JVM, no Celery, no Redis required for small deploys.
- 🔌 **Embed-first** — Eden Treaty SDK gives clients fully typed React, Vue, and vanilla components. iframe support for fast integration.
- 🏠 **On-prem & air-gapped from day one** — Helm chart, BYOK / CMEK, license-key activation, and a tested air-gapped install bundle.
- 🌐 **Bring-your-own everything** — your LLM, your KMS, your Postgres, your warehouse. Defaults work for cloud customers; locals work for everyone else.
- 💰 **Cost transparency** — see per-query cost on Snowflake / BigQuery, set budgets, auto-pause runaways.

## Quickstart

```bash
# Prerequisites: Bun >= 1.1, Docker, Make
git clone https://github.com/ixSurendra/arc-insights.git
cd arc-insights

# Boot everything: backend, frontend, Postgres, Valkey
make dev

# Open in browser
open http://localhost:5173
```

That's it. The `make dev` script starts:

- The Elysia API on `:3000`
- The React frontend on `:5173` (proxied to the API)
- Postgres on `:5432`
- Valkey on `:6379`

## Stack at a glance

| Layer           | Pick                                        |
| --------------- | ------------------------------------------- |
| Backend         | Elysia + Bun (TypeScript)                   |
| Frontend        | React + Vite + TypeScript                   |
| Metadata DB     | PostgreSQL (Drizzle ORM)                    |
| Federated query | DuckDB embedded                             |
| Cache           | Valkey (cloud) / Bun SQLite (single-binary) |
| Charts          | Apache ECharts + AG Grid Community          |
| Auth            | Lucia + node-saml (OIDC + SAML)             |
| LLM             | BYO endpoint (OpenAI / Anthropic / Ollama)  |
| Deploy          | Distroless Docker + Helm                    |

Full stack rationale: see [`docs/adr/0001-stack-choice.md`](./docs/adr/0001-stack-choice.md).

## Repository layout

```
arc-insights/
├── backend/        # Elysia API + query engine
├── frontend/       # React SPA
├── sdk/            # Eden Treaty client published to npm
├── helm/           # Kubernetes packaging
├── docs/           # Documentation site + ADRs
└── .github/        # CI/CD workflows
```

## Status

**Phase 0 — Foundation** (Weeks 1–2). Building the dev loop and CI baseline.

See the [Progress Tracker](https://github.com/ixSurendra/arc-insights/projects) for live status.

## Contributing

We welcome contributions. See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and our code of conduct.

## License

[AGPLv3](./LICENSE). Free to use, modify, and self-host. If you offer Arc Insights as a hosted service to others, your modifications must be shared under the same license.

For commercial licensing or enterprise inquiries: hello@arcinsights.io

---

<div align="center">
Built with care by the Arc Insights team.
</div>
