import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["catalogo-fotos.spec.ts"],
  workers: 1,
  use: { baseURL: "http://localhost:3002" },
  projects: [{ name: "mobile" }],
});
