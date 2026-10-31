import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  credenciaisDoAdmin,
  criarContaConfirmada,
  emailUnico,
  supabaseDisponivel,
} from "./support/supabase-local";

const SENHA = "senha-segura-123";
const TRINTA_DIAS = 30 * 24 * 60 * 60;

test.skip(!supabaseDisponivel, "precisa do Supabase local (SUPABASE_URL e SUPABASE_ANON_KEY)");
test.use({ viewport: { width: 360, height: 780 } });

const tokenFalso = (expiraEmSegundos: number) =>
  `cab.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expiraEmSegundos })).toString("base64url")}.ass`;

async function entrarComoCliente(page: Page, retorno?: string) {
  const email = emailUnico();
  await criarContaConfirmada(email, SENHA);
  await page.goto(retorno ? `/entrar?retorno=${encodeURIComponent(retorno)}` : "/entrar");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha", { exact: true }).fill(SENHA);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/entrar"));
  return email;
}

const cookieDe = async (context: BrowserContext, nome: string) =>
  (await context.cookies()).find((c) => c.name === nome);

test("home só vale como logada com token válido ou renovado: token vencido sem renovação sai", async ({
  page,
  context,
  baseURL,
}) => {
  await context.addCookies(
    ["lb_acesso", "lb_renovacao", "lb_manter"].map((name) => ({
      name,
      value:
        name === "lb_acesso" ? tokenFalso(-60) : name === "lb_manter" ? "1" : "renovacao-invalida",
      url: baseURL ?? "http://localhost:3000",
    })),
  );

  await page.goto("/");

  await expect(page).toHaveURL(/\/boas-vindas$/);
  expect(await cookieDe(context, "lb_acesso")).toBeUndefined();
  expect(await cookieDe(context, "lb_renovacao")).toBeUndefined();
});

test("home com sessão renovada segue como logada", async ({ page, context }) => {
  await entrarComoCliente(page);
  await expect(page).toHaveURL(/\/$/);
  const falso = tokenFalso(-60);
  await context.addCookies([{ name: "lb_acesso", value: falso, url: page.url() }]);

  await page.goto("/");

  await expect(page).toHaveURL(/\/$/);
  const renovado = (await cookieDe(context, "lb_acesso"))?.value;
  expect(renovado).toBeTruthy();
  expect(renovado).not.toBe(falso);
});

for (const caminho of ["/conta", "/checkout"]) {
  test(`visitante em ${caminho} vai para entrar e volta depois do login`, async ({ page }) => {
    await page.goto(caminho);
    await expect(page).toHaveURL(new RegExp(`/entrar\\?retorno=${encodeURIComponent(caminho)}`));

    const email = emailUnico();
    await criarContaConfirmada(email, SENHA);
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(SENHA);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(new RegExp(`${caminho}$`));
  });
}

test("visitante em /admin vai para entrar; cliente comum vê página não encontrada", async ({
  page,
}) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/entrar\?retorno=%2Fadmin/);

  await entrarComoCliente(page);
  const resposta = await page.goto("/admin");

  expect(resposta?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Minha conta" })).toHaveCount(0);
});

test("a cada requisição os cookies ganham mais 30 dias", async ({ page, context }) => {
  await entrarComoCliente(page, "/conta");
  await expect(page).toHaveURL(/\/conta$/);
  const antes = (await cookieDe(context, "lb_renovacao"))?.expires ?? 0;

  await page.waitForTimeout(2100);
  await page.goto("/conta");

  const depois = (await cookieDe(context, "lb_renovacao"))?.expires ?? 0;
  expect(depois).toBeGreaterThan(antes);
  expect(depois - Date.now() / 1000).toBeGreaterThan(TRINTA_DIAS - 120);
});

test("token de acesso vencido com renovação válida: a página abre e o token é trocado", async ({
  page,
  context,
}) => {
  await entrarComoCliente(page, "/conta");
  await expect(page).toHaveURL(/\/conta$/);
  const falso = tokenFalso(-60);
  await context.addCookies([{ name: "lb_acesso", value: falso, url: page.url() }]);

  await page.goto("/conta");

  await expect(page.getByRole("heading", { name: "Minha conta" })).toBeVisible();
  const novo = (await cookieDe(context, "lb_acesso"))?.value;
  expect(novo).toBeTruthy();
  expect(novo).not.toBe(falso);
});

test("sair leva à boas-vindas, /conta volta a pedir entrar e a sessão encerrada não renova mais", async ({
  page,
  context,
}) => {
  await entrarComoCliente(page, "/conta");
  await expect(page).toHaveURL(/\/conta$/);
  const renovacao = (await cookieDe(context, "lb_renovacao"))?.value ?? "";

  await page.getByRole("button", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/boas-vindas$/);
  expect(await cookieDe(context, "lb_acesso")).toBeUndefined();
  await page.goto("/conta");
  await expect(page).toHaveURL(/\/entrar\?retorno=%2Fconta/);
  const tentativa = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: renovacao }),
  });
  expect(tentativa.ok).toBe(false);
});

test("admin acessa /admin com a conta do seed, mesmo sem o perfil completo", async ({ page }) => {
  const admin = credenciaisDoAdmin();
  test.skip(!admin, "precisa da conta admin do seed (ADMIN_EMAIL e ADMIN_SEED_PASSWORD)");
  if (!admin) return;

  await page.goto("/entrar?retorno=%2Fadmin");
  await page.getByLabel("E-mail").fill(admin.email);
  await page.getByLabel("Senha", { exact: true }).fill(admin.senha);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "Administração" })).toBeVisible();
  const resposta = await page.goto("/admin");
  expect(resposta?.status()).toBe(200);
});
