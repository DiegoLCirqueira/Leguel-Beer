import type { Page } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";
import {
  criarContaConfirmada,
  emailUnico,
  esperarEmail,
  linkDeConfirmacao,
  modo,
} from "./support/supabase-local";

const API_URL = process.env.API_URL ?? "http://localhost:3333";
const SENHA = "senha-segura-123";
const TRINTA_DIAS = 30 * 24 * 60 * 60;

test.skip(modo === "pular", "precisa do Supabase local (SUPABASE_URL e SUPABASE_ANON_KEY)");
test.beforeEach(() => {
  if (modo === "falhar") {
    throw new Error("CI sem Supabase local: faltam SUPABASE_URL e SUPABASE_ANON_KEY no job de E2E");
  }
});
test.use({ viewport: { width: 360, height: 780 } });

async function preencherCadastro(page: Page, email: string) {
  await page.goto("/criar-conta");
  await page.getByLabel("Nome completo").fill("Ana Souza");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Telefone").fill("82999990000");
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByLabel("Confirmar senha").fill(SENHA);
  await page.getByRole("checkbox", { name: /Eu aceito os Termos de Uso/ }).check();
  await page.getByRole("button", { name: "Criar conta" }).click();
}

async function entrar(page: Page, email: string, senha: string, manter: boolean) {
  await page.goto(`/entrar?manter-conectado=${manter ? 1 : 0}`);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("cadastro válido: aviso, e-mail em português, link entra na conta e o perfil existe", async ({
  page,
  context,
}) => {
  const email = emailUnico();
  const antes = Date.now() - 2000;

  await preencherCadastro(page, email);

  await expect(
    page.getByText(
      `Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar sua conta.`,
    ),
  ).toBeVisible();
  const { assunto, html } = await esperarEmail(email, antes);
  expect(assunto).toBe("Confirme sua conta na Leguelé Beer");
  expect(html).toContain("Olá, Ana Souza!");
  expect(html).toContain("Confirmar minha conta");

  // Abrir o link (como faria um scanner de e-mail) só mostra o botão: não gasta o token nem entra.
  await page.goto(linkDeConfirmacao(html));
  await page.goto(linkDeConfirmacao(html));
  expect((await context.cookies()).find((c) => c.name === "lb_acesso")).toBeUndefined();
  await page.getByRole("button", { name: "Confirmar minha conta" }).click();

  await expect(page).toHaveURL(/\/$/);
  const acesso = (await context.cookies()).find((c) => c.name === "lb_acesso");
  expect(acesso?.value).toBeTruthy();
  const perfil = await fetch(`${API_URL}/me/profile`, {
    headers: { Authorization: `Bearer ${acesso?.value}` },
  });
  expect(perfil.status).toBe(200);
  expect(await perfil.json()).toMatchObject({
    email,
    nome: "Ana Souza",
    telefone: "82999990000",
    papel: "cliente",
  });
});

test("e-mail já cadastrado leva à tela de entrar com o e-mail preenchido", async ({ page }) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);

  await preencherCadastro(page, email);

  await expect(page.getByText(/Este e-mail já tem conta\./)).toBeVisible();
  await page.getByRole("main").getByRole("link", { name: "Entrar" }).first().click();
  await expect(page).toHaveURL(new RegExp(`/entrar\\?email=`));
  await expect(page.getByLabel("E-mail")).toHaveValue(email);
});

test("entrar com Manter-me conectado marcado guarda cookies HttpOnly por 30 dias", async ({
  page,
  context,
}) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);

  await entrar(page, email, SENHA, true);

  await expect(page).toHaveURL(/\/$/);
  const cookies = (await context.cookies()).filter((c) => c.name.startsWith("lb_"));
  expect(cookies.map((c) => c.name).sort()).toEqual(["lb_acesso", "lb_manter", "lb_renovacao"]);
  for (const cookie of cookies) {
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    expect(cookie.path).toBe("/");
    const validade = cookie.expires - Date.now() / 1000;
    expect(validade).toBeGreaterThan(TRINTA_DIAS - 120);
    expect(validade).toBeLessThanOrEqual(TRINTA_DIAS + 5);
  }
});

test("entrar com Manter-me conectado desmarcado deixa cookies de sessão, sem validade", async ({
  page,
  context,
}) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);

  await entrar(page, email, SENHA, false);

  await expect(page).toHaveURL(/\/$/);
  const cookies = (await context.cookies()).filter((c) => c.name.startsWith("lb_"));
  expect(cookies).toHaveLength(3);
  for (const cookie of cookies) {
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.expires).toBe(-1);
  }
});

test("depois de entrar volta para a página de onde veio", async ({ page }) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);

  await page.goto("/entrar?retorno=%2Ftermos");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/termos$/);
});

test("senha errada e conta inexistente dão o mesmo aviso", async ({ page }) => {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);

  await entrar(page, email, "senha-errada-123", true);
  await expect(page.getByText("E-mail ou senha inválidos")).toBeVisible();

  await entrar(page, emailUnico("ninguem"), "qualquer-senha", true);
  await expect(page.getByText("E-mail ou senha inválidos")).toBeVisible();
});

test("conta não confirmada pede a confirmação e reenvia o link", async ({ page }) => {
  test.setTimeout(120_000);
  const email = emailUnico();
  await preencherCadastro(page, email);
  await esperarEmail(email, Date.now() - 5000);

  await entrar(page, email, SENHA, true);

  await expect(page.getByText(/Confirme seu e-mail para entrar\. Não recebeu\?/)).toBeVisible();
  // O Supabase só aceita outro e-mail para o mesmo endereço depois de 1 minuto (max_frequency).
  await page.waitForTimeout(61_000);
  const antesDoReenvio = Date.now();
  await page.getByRole("button", { name: "Reenviar link" }).click();
  await expect(page.getByText(`Enviamos um novo link para ${email}.`)).toBeVisible();
  const { html } = await esperarEmail(email, antesDoReenvio);
  expect(linkDeConfirmacao(html)).toContain("/auth/confirmar?token_hash=");
});

test("link já usado, inválido ou sem token leva à tela de entrar com o aviso", async ({ page }) => {
  const aviso =
    "Este link de confirmação é inválido ou já venceu. Entre com seu e-mail e senha para receber um novo link.";
  const email = emailUnico();
  const antes = Date.now() - 2000;
  await preencherCadastro(page, email);
  const { html } = await esperarEmail(email, antes);
  const link = linkDeConfirmacao(html);
  await page.goto(link);
  await page.getByRole("button", { name: "Confirmar minha conta" }).click();
  await expect(page).toHaveURL(/\/$/);

  // O mesmo link de novo: o token já foi gasto.
  await page.context().clearCookies();
  await page
    .context()
    .addCookies([{ name: "leguele_maioridade", value: String(Date.now()), url: page.url() }]);
  await page.goto(link);
  await page.getByRole("button", { name: "Confirmar minha conta" }).click();
  await expect(page).toHaveURL(/\/entrar\?aviso=link-invalido/);
  await expect(page.getByText(aviso)).toBeVisible();

  await page.goto("/auth/confirmar?token_hash=ruim&type=signup");
  await page.getByRole("button", { name: "Confirmar minha conta" }).click();
  await expect(page.getByText(aviso)).toBeVisible();

  await page.goto("/auth/confirmar");
  await expect(page).toHaveURL(/\/entrar\?aviso=link-invalido/);
  await expect(page.getByText(aviso)).toBeVisible();
});
