# Arc Insights — public docs site

This directory is the source for [docs.arcinsights.io](https://docs.arcinsights.io)
(once it's pointed at this content). It's a [Mintlify](https://mintlify.com/)
site — `mint.json` is the config, MDX pages are the content.

## Local preview

```bash
npm i -g mintlify
cd docs-site
mintlify dev
```

Open <http://localhost:3000>.

## What's in here (Phase 0 stub — `P0-18`)

- **`mint.json`** — site config (nav, colors, top-bar links).
- **`introduction.mdx`** — landing page.
- **`quickstart.mdx`** — five-minute dev-loop walkthrough.
- **`api/health.mdx`** — example API page; the model for future route docs.

This site is intentionally minimal in Phase 0. Full reference, embedding
guides, semantic-layer docs, and on-prem ops content fill in alongside the
phases that ship those features. See [`docs/ROADMAP.md`](../docs/ROADMAP.md).

## Relation to `docs/`

| Directory    | Audience     | Content                                                                |
| ------------ | ------------ | ---------------------------------------------------------------------- |
| `docs/`      | Contributors | ADRs, ROADMAP, PROGRESS, FEATURES, ARCHITECTURE, UX-SPEC, AI-SURFACES. |
| `docs-site/` | End users    | User-facing docs published to docs.arcinsights.io via Mintlify.        |
