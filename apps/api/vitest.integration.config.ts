import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./test/test-database-url.js";

export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    environment: "node",
    include: ["src/**/*.integration.test.ts"],
    globalSetup: ["./test/global-setup.ts"],
    env: { DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DATABASE_URL },
    fileParallelism: false,
  },
});
