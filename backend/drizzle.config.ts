/**
 * Drizzle Kit configuration for migrations + introspection.
 * Run with `bun drizzle-kit generate` and `bun drizzle-kit migrate`.
 */
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://arc:arc_dev@localhost:5432/arc_insights",
  },
  verbose: true,
  strict: true,
} satisfies Config;
