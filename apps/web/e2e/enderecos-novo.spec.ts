import { expect, test } from "./support/maior-de-idade";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

test.describe("Novo endereço", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar") throw new Error("CI sem Supabase local para testar Novo endereço");
  });

  test("de Meus endereços abre o formulário em 360x640, sem rolar de lado, e Cancelar volta", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const email = emailUnico("novo-endereco");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fconta%2Fenderecos");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);

    await page.getByRole("link", { name: "Adicionar novo endereço" }).click();

    await expect(page).toHaveURL(/\/conta\/enderecos\/novo$/);
    await expect(page.getByRole("heading", { name: "Novo endereço", level: 1 })).toBeVisible();
    await page.getByLabel("CEP").fill("57035000");
    await expect(page.getByLabel("CEP")).toHaveValue("57035-000");
    await expect(page.getByRole("button", { name: "Buscar CEP" })).toBeVisible();
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);

    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);
  });
});
