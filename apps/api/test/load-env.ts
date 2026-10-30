import { config } from "dotenv";
import { fileURLToPath } from "node:url";

const API_ENV = fileURLToPath(new URL("../.env", import.meta.url));

/** Completa o ambiente com o apps/api/.env, sem sobrescrever variável já definida; sem o arquivo, segue (CI). */
export function loadApiEnv(
  path: string = API_ENV,
  env: Record<string, string | undefined> = process.env,
): void {
  config({ path, processEnv: env as Record<string, string>, override: false, quiet: true });
}
