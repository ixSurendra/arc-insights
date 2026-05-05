# 0002 — License: AGPLv3

- **Status:** Accepted
- **Date:** 2026-05-04
- **Deciders:** Founder

## Context

Arc Insights is open-source. The license affects:
- Who can use, modify, redistribute, and self-host the product
- Whether commercial cloud providers can offer Arc Insights as a managed service without contributing back
- The defensibility of the founder's hosted SaaS business

## Decision

License Arc Insights under **GNU Affero General Public License v3.0 (AGPLv3)**.

## Rationale

- **Permissive for users.** Anyone can self-host and modify Arc Insights without paying. This maximises adoption.
- **Defensible against cloud forks.** A commercial provider offering Arc Insights as a hosted service must release their modifications under AGPLv3. This neutralises the "AWS-style fork" risk that has hurt projects like Elasticsearch and MongoDB.
- **Proven business model.** Metabase ($130M revenue, AGPLv3) demonstrates that AGPLv3 is compatible with a thriving OSS-plus-commercial product.
- **Compatible with embedding ourselves.** Customers embedding Arc Insights in their own products get a separate commercial license (offered for a fee).

## Trade-offs

- Some enterprise legal teams have AGPL-phobia and require an exception for embedded use. We will offer a paid commercial license to address this.
- Some contributors avoid AGPL projects. We accept this trade-off.

## Alternatives considered

- **Apache 2.0 / MIT.** Maximum permissiveness; allows cloud forks. Rejected because it removes our hosted SaaS moat.
- **Business Source License (BSL).** Stronger competitive moat (commercial use restricted for X years). Rejected for v1 because it's less recognised by community contributors and less proven in BI; we may revisit.
- **Source-available proprietary (e.g., FSL).** Faster to monetise; weaker community signal. Rejected.

## Consequences

- The repository LICENSE file is the canonical AGPLv3 text.
- Every source file's header references AGPLv3 (added via tooling at release time).
- Customer contracts that need an embedded distribution exception are a paid commercial license.
- Contributors agree (via DCO sign-off in commits) that their contributions are AGPLv3.
