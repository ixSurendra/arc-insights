# Contributing to Arc Insights

Thanks for your interest in contributing. Arc Insights is an open-source project; we welcome issues, discussions, and pull requests.

## Quickstart

```bash
git clone https://github.com/ixSurendra/arc-insights.git
cd arc-insights
bun install
make dev
```

The frontend runs at `http://localhost:5173`, the backend at `http://localhost:3000`.

## Development workflow

1. **Pick a task.** All in-flight work is tracked in the [Progress Tracker](./docs/PROGRESS.md). Tasks have IDs like `P1-04`.
2. **Branch from `main`.** Branch name format: `<type>/<task-id>-short-description`. Examples: `feat/P1-04-snowflake-connector`, `fix/P3-06-postmessage-events`.
3. **Make small commits.** Follow [Conventional Commits](https://www.conventionalcommits.org/) and include the task ID in brackets:
   ```
   feat(connectors): add snowflake driver with key-pair auth [P1-04]
   ```
4. **Write tests.** Unit tests for logic, Playwright for critical user flows.
5. **Open a PR.** Description must include `Closes [P1-04]` (or `Refs [P1-04]` if partial).

## Code style

- TypeScript strict mode, everywhere.
- Prettier is the source of truth — run `bun run format` before committing.
- ESLint must be green. Run `bun run lint`.
- `bun run typecheck` must pass.

CI runs all three on every PR. Don't bypass.

## Architecture decisions

Major decisions are recorded as ADRs in `docs/adr/`. Read those before proposing structural changes. New ADRs follow the existing template — short, dated, immutable once committed.

## Reporting bugs

Open an issue with: a clear title, what you expected, what happened, and steps to reproduce. Include the Arc Insights version (from `/health`) and your OS/browser.

## Reporting security issues

**Do not open public issues for security problems.** Email security@arcinsights.io. See [SECURITY.md](./SECURITY.md).

## License of contributions

By contributing to Arc Insights, you agree that your contributions will be licensed under the AGPLv3 license.

## Code of conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). Be kind. Assume good intent. Disagree on substance, not tone.
