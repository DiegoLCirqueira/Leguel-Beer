import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

const TEST_DATABASE_URL =
  process.env["TEST_DATABASE_URL"] ?? "postgresql://postgres:postgres@127.0.0.1:54322/leguele_test";

// O esbuild do Vitest não emite metadados de decorators; o SWC emite, e o Nest precisa deles para a injeção.
const plugins = [swc.vite({ module: { type: "es6" } })];

export default defineConfig({
  test: {
    projects: [
      {
        plugins,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        plugins,
        test: {
          name: "integration",
          environment: "node",
          include: ["src/**/*.integration.test.ts"],
          globalSetup: ["./test/global-setup.ts"],
          env: { DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DATABASE_URL },
          fileParallelism: false,
        },
      },
    ],
  },
});
