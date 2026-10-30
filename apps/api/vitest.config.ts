import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// O esbuild do Vitest não emite metadados de decorators; o SWC emite, e o Nest precisa deles para a injeção.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
  },
});
