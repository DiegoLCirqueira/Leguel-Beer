// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const raiz = resolve(process.cwd(), "../..");
const config = readFileSync(resolve(raiz, "supabase/config.toml"), "utf8");

function valor(secao: string, chave: string): string {
  const linhas = config.split("\n").map((linha) => linha.replace("\r", ""));
  const inicio = linhas.findIndex((linha) => linha.trim() === `[${secao}]`);
  if (inicio < 0) throw new Error(`seção ${secao} não encontrada`);
  for (const linha of linhas.slice(inicio + 1)) {
    if (linha.startsWith("[")) break;
    const [nome, ...resto] = linha.split("=");
    if (nome?.trim() === chave && resto.length > 0) return resto.join("=").trim();
  }
  throw new Error(`${secao}.${chave} não definido`);
}

describe("configuração do Supabase Auth local (cadastro-login)", () => {
  it("exige a confirmação de e-mail e a senha de 8 caracteres", () => {
    expect(valor("auth.email", "enable_confirmations")).toBe("true");
    expect(valor("auth", "minimum_password_length")).toBe("8");
  });

  it("segue a tabela de limites de tentativa", () => {
    expect(valor("auth.rate_limit", "email_sent")).toBe("30");
    expect(valor("auth.email", "max_frequency")).toBe('"1m"');
    expect(valor("auth.rate_limit", "sign_in_sign_ups")).toBe("30");
    expect(valor("auth.rate_limit", "token_verifications")).toBe("30");
    expect(valor("auth.rate_limit", "token_refresh")).toBe("150");
  });

  it("o e-mail de confirmação é em português e leva ao site com o token", () => {
    expect(valor("auth.email.template.confirmation", "subject")).toBe(
      '"Confirme sua conta na Leguelé Beer"',
    );
    // O Supabase CLI resolve o caminho a partir da raiz do projeto, não da pasta supabase.
    const caminho = valor("auth.email.template.confirmation", "content_path").replaceAll('"', "");
    const modelo = readFileSync(resolve(raiz, caminho), "utf8");
    // O nome vem do cadastro (texto livre): o Supabase renderiza o e-mail com html/template, do Go,
    // que escapa o valor no HTML. Por isso o modelo usa o campo direto, sem "safeHtml" nem similar.
    expect(modelo).toContain("{{ .Data.nome }}");
    expect(modelo).not.toMatch(/safeHtml|\| *html/i);
    expect(modelo).toContain("Confirmar minha conta");
    expect(modelo).toContain(
      "{{ .SiteURL }}/auth/confirmar?token_hash={{ .TokenHash }}&type=signup",
    );
    expect(existsSync(resolve(raiz, caminho))).toBe(true);
  });

  it("o site local é localhost:3000, que recebe o retorno da confirmação", () => {
    expect(valor("auth", "site_url")).toBe('"http://localhost:3000"');
  });

  it("o e-mail de recuperação é em português, vale 1 hora e leva ao site com o token", () => {
    expect(valor("auth.email", "otp_expiry")).toBe("3600");
    expect(valor("auth.email.template.recovery", "subject")).toBe(
      '"Redefina sua senha da Leguelé Beer"',
    );
    const caminho = valor("auth.email.template.recovery", "content_path").replaceAll('"', "");
    const modelo = readFileSync(resolve(raiz, caminho), "utf8");
    expect(modelo).toContain(
      "Recebemos um pedido para redefinir sua senha. O link vale por 1 hora.",
    );
    expect(modelo).toContain("Redefinir senha");
    expect(modelo).toContain("Se não foi você, ignore este e-mail.");
    expect(modelo).toContain("{{ .SiteURL }}/nova-senha?token_hash={{ .TokenHash }}&type=recovery");
  });
});
