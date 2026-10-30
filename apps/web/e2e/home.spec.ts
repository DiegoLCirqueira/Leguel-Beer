import { expect, test } from "@playwright/test";

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

test("links e botões da boas-vindas têm área de toque de pelo menos 44 × 44 px", async ({
  page,
}) => {
  await page.goto("/boas-vindas");

  const targets = page
    .locator("main")
    .getByRole("link")
    .or(page.locator("main").getByRole("button"));
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const box = await targets.nth(i).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
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
]) {
  test(`a boas-vindas cabe em ${width}x${height} sem rolagem`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/boas-vindas");

    const overflow = await page.evaluate(() => ({
      x: document.documentElement.scrollWidth - window.innerWidth,
      y: document.documentElement.scrollHeight - window.innerHeight,
    }));

    expect(overflow.x).toBeLessThanOrEqual(0);
    expect(overflow.y).toBeLessThanOrEqual(0);
  });
}

for (const { width, height } of [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
]) {
  test(`a dica do (i) fica entre o convidado e o checkbox em ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/boas-vindas");
    const info = page.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
    const hintText = page.getByText(/Sua sessão continua ativa/);

    await info.click();
    const hint = await hintText.boundingBox();
    const guest = await page.getByRole("link", { name: "Continuar como convidado" }).boundingBox();
    const checkbox = await page
      .getByRole("checkbox", { name: "Manter-me conectado" })
      .boundingBox();

    expect(hint).not.toBeNull();
    expect(hint!.y).toBeGreaterThanOrEqual(guest!.y + guest!.height);
    expect(hint!.y + hint!.height).toBeLessThanOrEqual(checkbox!.y);

    await page.getByRole("checkbox", { name: "Manter-me conectado" }).uncheck();
    await expect(page.getByRole("checkbox", { name: "Manter-me conectado" })).not.toBeChecked();
    await expect(hintText).toBeHidden();

    await info.click();
    await expect(hintText).toBeVisible();
    await info.click();
    await expect(hintText).toBeHidden();
  });
}
