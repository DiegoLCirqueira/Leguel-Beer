import { expect, test } from "./support/maior-de-idade";

test("a home sem sessão leva para a boas-vindas e mostra os caminhos de acesso", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/boas-vindas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Criar conta" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar como convidado" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Manter-me conectado" })).toBeChecked();
});

test("a boas-vindas não tem rolagem horizontal em 360 px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/boas-vindas");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
});

test("continuar como convidado leva à home e a boas-vindas não volta na mesma sessão", async ({
  page,
}) => {
  await page.goto("/boas-vindas");

  await page.getByRole("link", { name: "Continuar como convidado" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeVisible();

  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
});

test("Entrar leva a escolha de Manter-me conectado para a tela de entrar", async ({ page }) => {
  await page.goto("/boas-vindas");
  await page.getByRole("checkbox", { name: "Manter-me conectado" }).uncheck();

  await page.getByRole("link", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/entrar\?manter-conectado=0$/);
});

test("Criar conta leva para /criar-conta", async ({ page }) => {
  await page.goto("/boas-vindas");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/criar-conta$/);
});

for (const { width, height } of [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
]) {
  test(`a boas-vindas cabe em ${width}x${height} sem rolagem`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/boas-vindas");

    const overflow = await page.evaluate(() => {
      const main = document.querySelector("main")!;
      return {
        x: document.documentElement.scrollWidth - window.innerWidth,
        // Primeira tela: a arte (main) cabe na altura; o rodapé fica abaixo da dobra.
        y: main.getBoundingClientRect().height - window.innerHeight,
      };
    });

    expect(overflow.x).toBeLessThanOrEqual(0);
    expect(overflow.y).toBeLessThanOrEqual(0);
  });
}
