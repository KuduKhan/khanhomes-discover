import { defineConfig } from "vitest/config";

// Prevent Discover tests from resolving the repository-root Vitest config.
export default defineConfig({ test: { include: ["lib/**/*.test.ts"] } });
