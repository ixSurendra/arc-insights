.PHONY: help install dev infra-up infra-down build test lint format typecheck docker-build clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies
	bun install

infra-up: ## Start Postgres + Valkey
	docker compose up -d
	@echo "⏳ Waiting for Postgres..."
	@until docker compose exec postgres pg_isready -U arc -d arc_insights >/dev/null 2>&1; do sleep 1; done
	@echo "✅ Infrastructure ready"

infra-down: ## Stop Postgres + Valkey
	docker compose down

dev: infra-up ## Boot the full dev environment (infra + backend + frontend)
	@echo "🚀 Starting Arc Insights dev loop..."
	@trap 'docker compose down' EXIT; \
	bun run --filter '@arc-insights/backend' dev & \
	bun run --filter '@arc-insights/frontend' dev & \
	wait

build: ## Build all workspaces
	bun run --filter '*' build

test: ## Run all tests
	bun run --filter '*' test

lint: ## Lint everything
	bun run lint

format: ## Format with Prettier
	bun run format

typecheck: ## Type-check everything
	bun run typecheck

docker-build: ## Build the production Docker image
	docker buildx build --platform linux/amd64,linux/arm64 -t arc-insights:dev .

clean: ## Remove build artifacts and node_modules
	rm -rf node_modules backend/node_modules frontend/node_modules sdk/node_modules
	rm -rf backend/dist frontend/dist sdk/dist
	rm -rf .turbo

ci: lint typecheck test ## Run the full CI pipeline locally
