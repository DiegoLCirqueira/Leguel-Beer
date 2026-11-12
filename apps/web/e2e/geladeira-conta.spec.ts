import { expect, test } from "./support/maior-de-idade";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

test.describe("Geladeira ao entrar na conta", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar")
      throw new Error("CI sem Supabase local para testar a Geladeira da conta");
  });

  test("a Geladeira do convidado passa para a conta vazia e permanece depois de recarregar", async ({
    page,
    context,
  }) => {
    const apiUrl = process.env.API_URL ?? "http://localhost:3333";
    const beerResponse = await page.request.get(`${apiUrl}/catalogo/mare-alta`);
    expect(beerResponse.status()).toBe(200);
    const beer = await beerResponse.json();
    await page.goto("/catalogo");
    await page.evaluate((beer) => {
      localStorage.setItem(
        "lb:geladeira",
        JSON.stringify({ versao: 1, itens: [{ cerveja: beer, quantidade: 2 }] }),
      );
    }, beer);
    await page.reload();
    await expect(page.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeVisible();

    const email = emailUnico("geladeira");
    const password = "senha-segura-123";
    await criarContaConfirmada(email, password);
    await page.goto("/entrar?retorno=%2Fcatalogo");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/catalogo$/);

    await expect
      .poll(async () => {
        const token = (await context.cookies()).find(
          (cookie) => cookie.name === "lb_acesso",
        )?.value;
        if (!token) return [];
        const response = await page.request.get(`${apiUrl}/me/geladeira`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok()) return [];
        const body = await response.json();
        return body.itens.map((item: { cerveja: { id: string }; quantidade: number }) => ({
          beerId: item.cerveja.id,
          quantity: item.quantidade,
        }));
      })
      .toEqual([{ beerId: beer.id, quantity: 2 }]);
    await page.reload();
    await expect(page.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeVisible();
  });
});
