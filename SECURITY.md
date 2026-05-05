# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.x     | ✅        |

Pre-1.0 means we may ship breaking changes. Once 1.0 is reached, we'll publish a formal support window.

## Reporting a vulnerability

**Please do not open public GitHub issues for security problems.**

Email **security@arcinsights.io** with:

- A clear description of the issue
- Steps to reproduce
- Affected versions
- Your name (so we can credit you in the changelog, optional)

We aim to:

- Acknowledge your report within 48 hours.
- Provide a remediation plan within 7 days.
- Disclose publicly once a fix is available, with credit to you.

## Scope

In scope:

- Arc Insights backend (Elysia + Bun)
- Arc Insights frontend (React)
- Arc Insights SDK (`@arc-insights/sdk`)
- Helm chart and Dockerfiles
- Documented APIs

Out of scope:

- Issues in third-party dependencies (report upstream first; let us know)
- Social engineering or physical attacks
- Denial of service (we have rate limits, not DoS protection)

## Hardening

- Distroless container images (minimal CVE surface)
- SBOM published with every release
- Audit log of all auth and admin actions
- Tenant isolation enforced via Postgres row-level security (multi-tenant deployments)
- BYOK / customer-managed encryption keys for on-prem
