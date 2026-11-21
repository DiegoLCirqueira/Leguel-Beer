import { expect, test } from "./support/maior-de-idade";
import { inserirEndereco } from "./support/enderecos-banco";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

const apiUrl = process.env.API_URL ?? "http://localhost:3333";

test.describe("Checkout: Entrega", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar") throw new Error("CI sem Supabase local para testar o checkout");
  });

  test("convidado vai a entrar e volta ao checkout", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page).toHaveURL(/\/entrar\?retorno=%2Fcheckout$/);
  });

  test("escolhe o endereço, vê o frete, e o endereço fora da área não deixa continuar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const mare = await (await page.request.get(`${apiUrl}/catalogo/mare-alta`)).json();
    const email = emailUnico("checkout");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fconta%2Fenderecos");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);
    const token = (await page.context().cookies()).find((c) => c.name === "lb_acesso")?.value;
    const envio = await page.request.put(`${apiUrl}/me/geladeira`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        itens: [{ cervejaId: mare.id, quantidade: 2, precoVistoCentavos: mare.precoCentavos }],
      },
    });
    expect(envio.ok()).toBe(true);
    inserirEndereco(email, { apelido: "Casa", padrao: true, distanciaMetros: 5200 });
    inserirEndereco(email, { apelido: "Trabalho", padrao: false, distanciaMetros: 30000 });

    await page.goto("/checkout");

    await expect(page.getByRole("radio", { name: /Casa/ })).toBeChecked();
    await expect(page.getByText("R$ 13,00")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continuar para pagamento" })).toBeVisible();

    await page.getByRole("radio", { name: /Trabalho/ }).check();

    await expect(page.getByText("Ainda não entregamos neste endereço").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Alterar endereço" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();

    await page.getByRole("radio", { name: /Casa/ }).check();
    await expect(page.getByRole("link", { name: "Continuar para pagamento" })).toBeVisible();
  });
});
