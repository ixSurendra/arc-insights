# syntax=docker/dockerfile:1.7

# ──────────────────────────────────────────────────────────────────
# Arc Insights — production Dockerfile
# Multi-stage: builder → distroless runtime.
# Multi-arch: amd64 + arm64.
# ──────────────────────────────────────────────────────────────────

ARG BUN_VERSION=1.1.34

# ─── Bun binary stage ─────────────────────────────────────────────
# Named stage so the runtime stage can COPY from it without needing ARG
# expansion in --from (BuildKit doesn't substitute ARG in --from references).
FROM oven/bun:${BUN_VERSION}-distroless AS bun-runtime

# ─── Builder ──────────────────────────────────────────────────────
FROM oven/bun:${BUN_VERSION}-alpine AS builder
WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json bun.lock* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY sdk/package.json ./sdk/

RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run --filter '@arc-insights/frontend' build

# Build backend
RUN bun run --filter '@arc-insights/backend' build

# ─── Runtime (distroless) ─────────────────────────────────────────
FROM gcr.io/distroless/base-debian12:nonroot AS runtime
WORKDIR /app

# Bun runtime binary (from the named stage above so ARG expansion is not
# required at this COPY)
COPY --from=bun-runtime /usr/local/bin/bun /usr/local/bin/bun

# Built artifacts
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER nonroot

CMD ["/usr/local/bin/bun", "run", "backend/dist/index.js"]
