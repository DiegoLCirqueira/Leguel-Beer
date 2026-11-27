import { defineConfig, devices } from "@playwright/test";

// No CI o E2E roda contra o build (start); no local usa o modo dev.
const webCommand = process.env.CI ? "pnpm start" : "pnpm dev";
const apiCommand = process.env.CI
  ? "pnpm --filter @leguele/api start"
  : "pnpm --filter @leguele/api dev";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: "**/support/**",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  // No CI grava o trace da repetição de um teste que falhou; o passo de falha do CI sobe `test-results`.
  use: { baseURL: "http://localhost:3000", trace: process.env.CI ? "on-first-retry" : "off" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 5"] } }],
  webServer: [
    {
      command: webCommand,
      // O build não serve /dev/tokens; os E2E dos componentes (sheet, card) usam a vitrine, então o CI a liga.
      env: { VITRINE_E2E: "1" },
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: apiCommand,
      // Local: o E2E faz muitas chamadas do mesmo IP; o CI usa o limite padrão da API.
      env: process.env.CI
        ? { MAPS_ADAPTER: "local" }
        : { MAPS_ADAPTER: "local", THROTTLE_LIMIT: "10000" },
      url: "http://localhost:3333/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
