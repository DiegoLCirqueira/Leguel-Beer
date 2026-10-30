// Gera a chave de assinatura ES256 do Supabase Auth local, se ainda não existir (supabase/signing_keys.json).
// O CLI lê o arquivo antes de gerar, então ele nasce vazio e a chave é acrescentada.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";

const file = "supabase/signing_keys.json";
if (existsSync(file)) {
  console.log(`${file} já existe; nada a fazer.`);
} else {
  writeFileSync(file, "[]\n");
  execFileSync(
    "pnpm",
    ["exec", "supabase", "gen", "signing-key", "--algorithm", "ES256", "--append"],
    {
      stdio: "inherit",
      shell: true,
    },
  );
}
