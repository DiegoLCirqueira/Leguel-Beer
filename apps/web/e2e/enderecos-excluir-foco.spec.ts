import { expect, test } from "./support/maior-de-idade";
import { inserirEndereco } from "./support/enderecos-banco";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

test.describe("Meus endereços: excluir", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar") throw new Error("CI sem Supabase local para testar Meus endereços");
  });

  test("depois de excluir, o foco vai para o título da página", async ({ page }) => {
    const email = emailUnico("enderecos");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fconta%2Fenderecos");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);

    inserirEndereco(email);
    await page.reload();

    await page.getByRole("button", { name: "Excluir: Casa" }).click();

    await expect(page.getByText("Você ainda não tem endereço salvo.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Meus endereços" })).toBeFocused();
  });
});
