import { defineConfig, devices } from "@playwright/test";

// Só para medir flakiness sem derrubar o :3000/:3333 do Diego: site em :3001, API :3333 reaproveitada.
export default defineConfig({
  testDir: "./e2e",
  testIgnore: "**/support/**",
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://localhost:3001", trace: "retain-on-failure" },
  projects: [{ name: "mobile", use: { ...devices["Pixel 5"] } }],
  webServer: [
    {
      command: "pnpm exec next dev --port 3001",
      url: "http://localhost:3001",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
