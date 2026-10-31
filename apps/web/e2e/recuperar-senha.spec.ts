import type { Page } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  contarEmails,
  criarContaConfirmada,
  emailUnico,
  esperarEmail,
  linkDeRecuperacao,
  modo,
} from "./support/supabase-local";

const SENHA_ANTIGA = "senha-antiga-123";
const SENHA_NOVA = "senha-nova-456";
const AVISO_ENVIO = "Se houver uma conta com esse e-mail, você vai receber o link em instantes.";

test.skip(modo === "pular", "precisa do Supabase local (SUPABASE_URL e SUPABASE_ANON_KEY)");
test.beforeEach(() => {
  if (modo === "falhar") {
    throw new Error("CI sem Supabase local: faltam SUPABASE_URL e SUPABASE_ANON_KEY no job de E2E");
  }
});
test.use({ viewport: { width: 360, height: 780 } });

async function pedirLink(page: Page, email: string) {
  await page.goto("/recuperar-senha");
  await page.getByLabel("E-mail").fill(email);
  await page.getByRole("button", { name: "Enviar link" }).click();
  await expect(page.getByText(AVISO_ENVIO)).toBeVisible();
}

async function novaSenha(page: Page, senha: string, confirmacao = senha) {
  await page.getByLabel("Nova senha").fill(senha);
  await page.getByLabel("Confirmar senha").fill(confirmacao);
  await page.getByRole("button", { name: "Salvar nova senha" }).click();
}

async function entrarCom(page: Page, email: string, senha: string) {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("pedir o link: aviso genérico e e-mail em português com o botão Redefinir senha", async ({
  page,
}) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA_ANTIGA);
  const antes = Date.now() - 1000;

  await pedirLink(page, email);

  const { assunto, html } = await esperarEmail(email, antes);
  expect(assunto).toBe("Redefina sua senha da Leguelé Beer");
  expect(html).toContain("Recebemos um pedido para redefinir sua senha. O link vale por 1 hora.");
  expect(html).toContain("Redefinir senha");
  expect(html).toContain("Se não foi você, ignore este e-mail.");
});

test("e-mail sem conta recebe o mesmo aviso e nenhum e-mail sai", async ({ page }) => {
  const email = emailUnico("ninguem");

  await pedirLink(page, email);

  await page.waitForTimeout(2500);
  expect(await contarEmails(email)).toBe(0);
});

test("pedido repetido em menos de 60 s mostra o mesmo aviso e não manda e-mail novo", async ({
  page,
}) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA_ANTIGA);
  await pedirLink(page, email);
  await esperarEmail(email, Date.now() - 5000);
  const antes = await contarEmails(email);

  await pedirLink(page, email);

  await page.waitForTimeout(2500);
  expect(await contarEmails(email)).toBe(antes);
});

test("definir a nova senha: abrir o link não gasta, entra na conta, a antiga deixa de valer e a nova vale", async ({
  page,
  browser,
  baseURL,
}) => {
  const origem = baseURL ?? "http://localhost:3000";
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA_ANTIGA);
  // Outra sessão aberta da mesma conta, que a troca de senha precisa encerrar.
  const outro = await browser.newContext({ baseURL: origem });
  await outro.addCookies([{ name: "leguele_maioridade", value: String(Date.now()), url: origem }]);
  const paginaOutra = await outro.newPage();
  await entrarCom(paginaOutra, email, SENHA_ANTIGA);
  await paginaOutra.waitForURL((url) => !url.pathname.startsWith("/entrar"));
  const renovacaoOutra = (await outro.cookies()).find((c) => c.name === "lb_renovacao")?.value;
  const antes = Date.now() - 1000;
  await pedirLink(page, email);
  const { html } = await esperarEmail(email, antes);
  const link = linkDeRecuperacao(html);

  // Abrir o link duas vezes (como um scanner de e-mail) só mostra o formulário.
  await page.goto(link);
  await page.goto(link);
  await expect(page.getByRole("heading", { level: 1, name: "Nova senha" })).toBeVisible();
  await novaSenha(page, SENHA_NOVA);

  await expect(page).toHaveURL(/\/\?aviso=senha-alterada$/);
  await expect(page.getByText("Senha alterada. Você já está na sua conta.")).toBeVisible();
  expect((await page.context().cookies()).some((c) => c.name === "lb_acesso")).toBe(true);

  const tentativa = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: renovacaoOutra }),
  });
  expect(tentativa.ok, "a outra sessão não pode mais ser renovada").toBe(false);

  await page.context().clearCookies();
  await page
    .context()
    .addCookies([{ name: "leguele_maioridade", value: String(Date.now()), url: origem }]);
  await entrarCom(page, email, SENHA_ANTIGA);
  await expect(page.getByText("E-mail ou senha inválidos")).toBeVisible();
  await entrarCom(page, email, SENHA_NOVA);
  await expect(page).toHaveURL(/\/$/);
  await outro.close();
});

test("link já usado mostra o aviso e Pedir novo link leva a Recuperar senha", async ({ page }) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA_ANTIGA);
  const antes = Date.now() - 1000;
  await pedirLink(page, email);
  const { html } = await esperarEmail(email, antes);
  const link = linkDeRecuperacao(html);
  await page.goto(link);
  await novaSenha(page, SENHA_NOVA);
  await expect(page).toHaveURL(/aviso=senha-alterada/);

  await page.goto(link);
  await novaSenha(page, "outra-senha-789");

  await expect(page.getByText("Este link expirou ou já foi usado.")).toBeVisible();
  await page.getByRole("link", { name: "Pedir novo link" }).click();
  await expect(page).toHaveURL(/\/recuperar-senha$/);
});

test("link substituído por um pedido novo mostra o aviso de link que não vale mais", async ({
  page,
}) => {
  test.setTimeout(150_000);
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA_ANTIGA);
  const antes = Date.now() - 1000;
  await pedirLink(page, email);
  const primeiro = linkDeRecuperacao((await esperarEmail(email, antes)).html);

  // O Supabase só aceita outro pedido para o mesmo e-mail depois de 1 minuto.
  await page.waitForTimeout(61_000);
  const depoisDoSegundo = Date.now() - 1000;
  await pedirLink(page, email);
  await esperarEmail(email, depoisDoSegundo);

  await page.goto(primeiro);
  await novaSenha(page, SENHA_NOVA);
  await expect(page.getByText("Este link expirou ou já foi usado.")).toBeVisible();
});

test("link sem token mostra direto o aviso de link que não vale mais", async ({ page }) => {
  await page.goto("/nova-senha");

  await expect(page.getByText("Este link expirou ou já foi usado.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Pedir novo link" })).toBeVisible();
});

test("nova senha inválida mostra as mensagens e a senha não muda", async ({ page }) => {
  await page.goto("/nova-senha?token_hash=hash-de-teste&type=recovery");

  await novaSenha(page, "abc123");
  await expect(page.getByText("A senha precisa ter pelo menos 8 caracteres.")).toBeVisible();

  await novaSenha(page, "senha-valida-123", "outra-diferente-1");
  await expect(page.getByText("As senhas não conferem.")).toBeVisible();
});
