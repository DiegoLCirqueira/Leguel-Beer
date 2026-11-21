import { execFileSync } from "node:child_process";
import { expect, test } from "./support/maior-de-idade";
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

    // O cadastro pela API chama o serviço de mapas; o endereço entra direto no banco local.
    const sql = `insert into addresses (id, profile_id, nickname, zip, street, number, district, city, state, is_default, latitude, longitude, route_origin_latitude, route_origin_longitude, updated_at) select gen_random_uuid(), id, 'Casa', '57035000', 'Avenida Fernandes Lima', '100', 'Farol', 'Maceió', 'AL', true, -9.64, -35.73, -9.65, -35.74, now() from profiles where email = '${email}'`;
    execFileSync("docker", [
      "exec",
      "supabase_db_leguele-beer",
      "psql",
      "-U",
      "postgres",
      "-c",
      sql,
    ]);
    await page.reload();

    await page.getByRole("button", { name: "Excluir: Casa" }).click();

    await expect(page.getByText("Você ainda não tem endereço salvo.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Meus endereços" })).toBeFocused();
  });
});
