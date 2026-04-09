import path from "node:path";
import { defineConfig } from "vitest/config";

process.env.DATABASE_URL = "file:./test.db";
process.env.SESSION_SECRET = "test-session-secret";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"]
    }
  }
});
