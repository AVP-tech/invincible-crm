import path from "node:path";
import { defineConfig } from "vitest/config";

const testDatabasePath = path.resolve(__dirname, "prisma", "test.db").replace(/\\/g, "/");

process.env.DATABASE_URL = `file:${testDatabasePath}`;
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
