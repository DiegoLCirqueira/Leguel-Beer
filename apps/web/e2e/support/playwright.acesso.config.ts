import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";
import baseConfig from "../../playwright.config";

// Execução isolada dos testes de layout: não reutiliza o ambiente principal em :3000/:3333.
export default defineConfig(baseConfig, {
  testDir: "..",
  testMatch: [
    "acesso-refluxo.spec.ts",
    "entrar-ui.spec.ts",
    "sem-rolagem.spec.ts",
    "boas-vindas-sem-rolagem.spec.ts",
  ],
  workers: 1,
  use: { baseURL: "http://localhost:3001" },
  webServer: {
    command: "pnpm exec next dev -p 3001",
    cwd: fileURLToPath(new URL("../..", import.meta.url)),
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
