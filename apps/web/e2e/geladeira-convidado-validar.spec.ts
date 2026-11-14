import { expect, test } from "./support/maior-de-idade";

test.use({ isMobile: false, hasTouch: false });

const API = process.env.API_URL ?? "http://localhost:3333";

test("o convidado abre a Geladeira com um preço velho e vê o aviso, com o preço atualizado", async ({
  page,
  request,
  context,
  baseURL,
}) => {
  await context.addCookies([
    { name: "leguele_convidado", value: "1", url: baseURL ?? "http://localhost:3000" },
  ]);
  const cerveja = await (await request.get(`${API}/catalogo/mare-alta`)).json();
  // A Geladeira guardada no navegador tem um preço diferente do que a API vende hoje.
  await page.addInitScript(
    ({ cervejaAtual }) => {
      if (localStorage.getItem("semeado")) return;
      localStorage.setItem("semeado", "1");
      const velha = { ...cervejaAtual, precoCentavos: cervejaAtual.precoCentavos - 500 };
      localStorage.setItem(
        "lb:geladeira",
        JSON.stringify({ versao: 1, itens: [{ cerveja: velha, quantidade: 1 }] }),
      );
    },
    { cervejaAtual: cerveja },
  );

  await page.goto("/geladeira");

  await expect(page.getByText("O preço de Maré Alta mudou")).toBeVisible();
  const guardada = await page.evaluate(() => localStorage.getItem("lb:geladeira"));
  expect(JSON.parse(guardada!).itens[0].cerveja.precoCentavos).toBe(cerveja.precoCentavos);
});
