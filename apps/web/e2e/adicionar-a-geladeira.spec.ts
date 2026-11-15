import { expect, test } from "./support/maior-de-idade";
import { aguardarRevelacao } from "./support/revelacao";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

test.use({ isMobile: false, hasTouch: false, viewport: { width: 390, height: 844 } });

const API = process.env.API_URL ?? "http://localhost:3333";

test.describe("convidado", () => {
  test.beforeEach(async ({ context, baseURL }) => {
    await context.addCookies([
      { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
    ]);
  });

  for (const [tela, rota] of [
    ["catálogo", "/catalogo"],
    ["home", "/"],
  ] as const) {
    test(`adiciona pelo card da ${tela}, vê o toast, o contador sobe e continua lá ao recarregar; o Desfazer volta`, async ({
      page,
    }) => {
      await page.goto(rota);
      await aguardarRevelacao(page);
      await expect(page.getByRole("link", { name: "Geladeira, 0 unidades" })).toBeVisible();

      await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
      await expect(
        page.getByRole("status").filter({ hasText: /foi para a geladeira/ }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();

      await page.reload();
      await aguardarRevelacao(page);
      await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();

      await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
      await expect(page.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeVisible();
      await page.getByRole("button", { name: "Desfazer" }).click();
      await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();
    });
  }

  test("no limite da quantidade disponível o card avisa 'Só temos N unidades' e a Geladeira não muda", async ({
    page,
    request,
  }) => {
    const cerveja = await (await request.get(`${API}/catalogo/ponta-verde-pilsen`)).json();
    await page.addInitScript(
      (semente) => {
        if (localStorage.getItem("semeado")) return;
        localStorage.setItem("semeado", "1");
        localStorage.setItem("lb:geladeira", JSON.stringify({ versao: 1, itens: semente }));
      },
      [{ cerveja, quantidade: cerveja.quantidadeDisponivel }],
    );

    await page.goto("/catalogo");
    await aguardarRevelacao(page);
    await page
      .getByRole("article")
      .filter({ hasText: "Ponta Verde Pilsen" })
      .getByRole("button", { name: "Adicionar", exact: true })
      .click();

    await expect(
      page
        .getByRole("status")
        .filter({ hasText: `Só temos ${cerveja.quantidadeDisponivel} unidades` }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: `Geladeira, ${cerveja.quantidadeDisponivel} unidades` }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Desfazer" })).toHaveCount(0);
  });

  test("na página do produto, a quantidade escolhida vai para a Geladeira pelo botão fixo", async ({
    page,
  }) => {
    await page.goto("/catalogo/mare-alta");
    await aguardarRevelacao(page);

    const mais = page.getByRole("button", { name: "Aumentar quantidade" });
    await mais.click();
    await mais.click();
    await page.getByRole("button", { name: "Adicionar à geladeira" }).click();

    await expect(
      page.getByRole("status").filter({ hasText: "Maré Alta foi para a geladeira" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Geladeira, 3 unidades" })).toBeVisible();
  });
});

test.describe("cliente logado", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar")
      throw new Error("CI sem Supabase local para testar a Geladeira da conta");
  });

  test("adiciona pelo card do catálogo e a Geladeira fica na conta, inclusive depois de recarregar", async ({
    page,
    context,
  }) => {
    const email = emailUnico("adicionar");
    const password = "senha-segura-123";
    await criarContaConfirmada(email, password);
    await page.goto("/entrar?retorno=%2Fcatalogo");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/catalogo$/);
    await aguardarRevelacao(page);

    await page.getByRole("button", { name: "Adicionar", exact: true }).first().click();
    await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();

    await expect
      .poll(async () => {
        const token = (await context.cookies()).find((c) => c.name === "lb_acesso")?.value;
        if (!token) return 0;
        const resposta = await page.request.get(`${API}/me/geladeira`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return resposta.ok() ? (await resposta.json()).quantidadeTotal : 0;
      })
      .toBe(1);
    await page.reload();
    await expect(page.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeVisible();
  });
});
