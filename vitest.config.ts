import { defineConfig } from "vitest/config";

// Keep the independent Discover test suite scoped to its own repository.
export default defineConfig({
  test: { include: ["lib/**/*.test.ts"] },
});
