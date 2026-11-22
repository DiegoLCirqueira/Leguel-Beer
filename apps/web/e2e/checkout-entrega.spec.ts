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

  test("com a Geladeira vazia, o checkout leva à Geladeira (360x640)", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const email = emailUnico("checkout-vazio");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fcheckout");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page).toHaveURL(/\/geladeira$/);
    await expect(page.getByRole("heading", { name: "Geladeira", level: 1 })).toBeAttached();
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);
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
    await expect(page.getByRole("link", { name: "Continuar para pagamento" })).toHaveAttribute(
      "href",
      "/checkout/pagamento",
    );

    await page.getByRole("radio", { name: /Trabalho/ }).check();

    await expect(page.getByText("Ainda não entregamos neste endereço").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Alterar endereço" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();

    await page.getByRole("radio", { name: /Casa/ }).check();
    await expect(page.getByText("R$ 13,00")).toBeVisible();
  });

  test("segue ao Pagamento com o aviso e o Voltar, que devolve o endereço escolhido (360x640)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const mare = await (await page.request.get(`${apiUrl}/catalogo/mare-alta`)).json();
    const email = emailUnico("checkout-pagamento");
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
    inserirEndereco(email, { apelido: "Trabalho", padrao: false, distanciaMetros: 8000 });

    await page.goto("/checkout");
    await page.getByRole("radio", { name: /Trabalho/ }).check();
    await page.getByRole("link", { name: "Continuar para pagamento" }).click();

    await expect(page).toHaveURL(/\/checkout\/pagamento$/);
    const aviso = page.getByText(/projeto sem fins lucrativos, feito para portfólio/);
    const voltar = page.getByRole("link", { name: "Voltar" });
    await expect(aviso).toBeInViewport();
    await expect(voltar).toBeInViewport();
    await expect(page.getByRole("radio", { name: /Pix/ })).toBeChecked();
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(sobra).toBeLessThanOrEqual(0);

    await voltar.click();

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole("radio", { name: /Trabalho/ })).toBeChecked();
  });

  test("endereço forjado na aba não passa da Entrega", async ({ page }) => {
    const email = emailUnico("checkout-forjado");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fconta%2Fenderecos");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);
    await page.evaluate(() =>
      sessionStorage.setItem("lb:checkout", JSON.stringify({ enderecoId: "id-de-outra-conta" })),
    );

    await page.goto("/checkout/pagamento");

    await expect(page).not.toHaveURL(/\/checkout\/pagamento$/);
  });
});
