import { execFileSync } from "node:child_process";
import { expect, test } from "./support/maior-de-idade";
import { criarContaConfirmada, emailUnico, modo } from "./support/supabase-local";

/** O cadastro pela API chama o serviço de mapas; o endereço padrão entra direto no banco, com a distância dada. */
function inserirEnderecoPadrao(email: string, distanciaMetros: number) {
  const sql = `insert into addresses (id, profile_id, nickname, zip, street, number, district, city, state, is_default, latitude, longitude, distance_meters, route_origin_latitude, route_origin_longitude, updated_at) select gen_random_uuid(), id, 'Casa', '57035000', 'Avenida Fernandes Lima', '100', 'Farol', 'Maceió', 'AL', true, -9.64, -35.73, ${distanciaMetros}, -9.6649, -35.7313, now() from profiles where email = '${email}'`;
  // No CI o banco da API é o service container (DATABASE_URL); no local, o Postgres do Supabase no Docker.
  if (process.env.DATABASE_URL) execFileSync("psql", [process.env.DATABASE_URL, "-c", sql]);
  else
    execFileSync("docker", [
      "exec",
      "supabase_db_leguele-beer",
      "psql",
      "-U",
      "postgres",
      "-c",
      sql,
    ]);
}

const MARE_2 = [{ slug: "mare-alta", quantidade: 2 }]; // R$ 64,00
const MARE_3_E_CARNAVAL_2 = [
  { slug: "mare-alta", quantidade: 3 },
  { slug: "leguele-carnaval", quantidade: 2 },
]; // R$ 96,00 + R$ 60,00 = R$ 156,00

const apiUrl = process.env.API_URL ?? "http://localhost:3333";

test.describe("Frete no resumo da Geladeira", () => {
  test.skip(modo === "pular", "precisa do Supabase local");
  test.beforeEach(() => {
    if (modo === "falhar") throw new Error("CI sem Supabase local para testar o frete");
  });

  async function entrarComGeladeira(
    page: import("@playwright/test").Page,
    itens: { slug: string; quantidade: number }[],
    distanciaMetros: number,
  ) {
    const cervejas = await Promise.all(
      itens.map(async ({ slug, quantidade }) => {
        const cerveja = await (await page.request.get(`${apiUrl}/catalogo/${slug}`)).json();
        return { cervejaId: cerveja.id, quantidade, precoVistoCentavos: cerveja.precoCentavos };
      }),
    );
    const email = emailUnico("frete");
    const senha = "senha-segura-123";
    await criarContaConfirmada(email, senha);
    await page.goto("/entrar?retorno=%2Fconta%2Fenderecos");
    await page.getByLabel("E-mail").fill(email);
    await page.getByLabel("Senha", { exact: true }).fill(senha);
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(page).toHaveURL(/\/conta\/enderecos$/);
    // O perfil nasce no primeiro acesso: só agora a Geladeira da conta e o endereço padrão podem entrar.
    const token = (await page.context().cookies()).find((c) => c.name === "lb_acesso")?.value;
    const envio = await page.request.put(`${apiUrl}/me/geladeira`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { itens: cervejas },
    });
    expect(envio.ok()).toBe(true);
    inserirEnderecoPadrao(email, distanciaMetros);
    await page.goto("/geladeira");
    await page.getByRole("button", { name: "Ver resumo" }).click();
    return page.getByRole("dialog", { name: "Resumo da Geladeira" });
  }

  test("com o endereço padrão a 5,2 km, o frete é R$ 13,00 e o total soma o frete", async ({
    page,
  }) => {
    const resumo = await entrarComGeladeira(page, MARE_2, 5200);

    await expect(resumo.getByText("R$ 13,00")).toBeVisible();
    await expect(resumo.getByText("R$ 77,00")).toBeVisible();
  });

  test("a partir de R$ 150,00 o frete é Grátis", async ({ page }) => {
    const resumo = await entrarComGeladeira(page, MARE_3_E_CARNAVAL_2, 5200);

    await expect(resumo.getByText("Grátis")).toBeVisible();
    await expect(resumo.getByText("R$ 156,00")).toHaveCount(2);
  });

  test("endereço fora da área mostra 'Ainda não entregamos neste endereço' e o total é o subtotal", async ({
    page,
  }) => {
    const resumo = await entrarComGeladeira(page, MARE_2, 30000);

    await expect(resumo.getByText("Ainda não entregamos neste endereço")).toBeVisible();
    // A linha da Maré Alta (2 × R$ 32,00), o subtotal e o total: sem frete, os dois últimos são iguais.
    await expect(resumo.getByText("R$ 64,00")).toHaveCount(3);
  });
});
