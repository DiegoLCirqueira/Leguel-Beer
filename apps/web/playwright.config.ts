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
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 5"] } }],
  webServer: [
    {
      command: webCommand,
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: apiCommand,
      url: "http://localhost:3333/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
