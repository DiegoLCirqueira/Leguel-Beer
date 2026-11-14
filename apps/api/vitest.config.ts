import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// O esbuild do Vitest não emite metadados de decorators; o SWC emite, e o Nest precisa deles para a injeção.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    environment: "node",
    // Cada arquivo roda num worker isolado; o primeiro teste que carrega o dependency-cruiser ou sobe o
    // AppModule leva cerca de 1 s a frio e passa de 5 s com a máquina ou o runner carregados.
    testTimeout: 20_000,
    hookTimeout: 30_000,
    // Os testes que sobem o AppModule não falam com o Supabase; a URL só precisa existir.
    env: { SUPABASE_URL: "http://127.0.0.1:54321" },
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/modules/*/{domain,application}/**/*.ts"],
      exclude: ["**/*.test.ts"],
      thresholds: { lines: 80 },
    },
  },
});
