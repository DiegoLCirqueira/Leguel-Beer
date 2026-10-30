import { expect, test, type Locator, type Page } from "@playwright/test";
import { ART, CONTROLS, type ArtRect } from "../src/lib/arte-login";

const VIEWPORTS = [
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
];
const TOLERANCE = 3;

async function stageBox(page: Page) {
  const box = await page.getByTestId("palco-arte").boundingBox();
  if (!box) throw new Error("palco da arte não encontrado");
  return box;
}

async function expectInsideDrawn(page: Page, control: Locator, rect: ArtRect) {
  const stage = await stageBox(page);
  const scale = stage.width / ART.width;
  const box = await control.boundingBox();
  if (!box) throw new Error("controle não encontrado");
  const expected = {
    x: stage.x + (rect.x - ART.x0) * scale,
    y: stage.y + (rect.y - ART.y0) * scale,
    w: rect.w * scale,
    h: rect.h * scale,
  };
  expect(Math.abs(box.x - expected.x)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(box.y - expected.y)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(box.width - expected.w)).toBeLessThanOrEqual(TOLERANCE);
  expect(Math.abs(box.height - expected.h)).toBeLessThanOrEqual(TOLERANCE);
}

for (const viewport of VIEWPORTS) {
  const label = `${viewport.width}x${viewport.height}`;

  test.describe(`boas-vindas ${label}`, () => {
    test.use({ viewport });

    test("cada controle real cai sobre o desenhado no Figma, sem rolagem", async ({ page }) => {
      await page.goto("/boas-vindas");

      await expectInsideDrawn(page, page.getByRole("link", { name: "Entrar" }), CONTROLS.enter);
      await expectInsideDrawn(
        page,
        page.getByRole("link", { name: "Criar conta" }),
        CONTROLS.signUp,
      );
      await expectInsideDrawn(
        page,
        page.getByRole("link", { name: "Continuar como convidado" }),
        CONTROLS.guest,
      );
      await expectInsideDrawn(
        page,
        page.getByRole("checkbox", { name: "Manter-me conectado" }),
        CONTROLS.checkbox,
      );

      const overflow = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth - window.innerWidth,
        y: document.documentElement.scrollHeight - window.innerHeight,
      }));
      expect(overflow.x).toBeLessThanOrEqual(0);
      expect(overflow.y).toBeLessThanOrEqual(0);
    });

    test("a área de toque de cada controle tem pelo menos 44 px de altura", async ({ page }) => {
      await page.goto("/boas-vindas");
      const controls = [
        page.getByRole("link", { name: "Entrar" }),
        page.getByRole("link", { name: "Criar conta" }),
        page.getByRole("link", { name: "Continuar como convidado" }),
        page.getByRole("checkbox", { name: "Manter-me conectado" }),
        page.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" }),
      ];

      for (const control of controls) {
        const box = await control.boundingBox();
        if (!box) throw new Error("controle não encontrado");
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        for (const dy of [-21, 21]) {
          const hit = await page.evaluate(
            ({ x, y }) =>
              document.elementFromPoint(x, y)?.closest("a,button,label")?.textContent ?? "",
            { x: centerX, y: centerY + dy },
          );
          const expected =
            (await control.evaluate((el) => (el.closest("label") ?? el).textContent)) ?? "";
          expect(hit.trim() || "(i)").toBe(expected.trim() || "(i)");
        }
      }
    });

    test("a dica do (i) não cobre nenhum controle e o segundo toque no (i) a fecha", async ({
      page,
    }) => {
      await page.goto("/boas-vindas");
      const info = page.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
      const hintText = page.getByText(/Sua sessão continua ativa/);

      await info.click();
      const hint = await hintText.boundingBox();
      expect(hint).not.toBeNull();
      const controls = [
        page.getByRole("link", { name: "Entrar" }),
        page.getByRole("link", { name: "Criar conta" }),
        page.getByRole("link", { name: "Continuar como convidado" }),
        page.getByRole("checkbox", { name: "Manter-me conectado" }),
        info,
      ];
      for (const control of controls) {
        const box = await control.boundingBox();
        if (!box) throw new Error("controle não encontrado");
        const separated =
          hint!.y + hint!.height <= box.y ||
          box.y + box.height <= hint!.y ||
          hint!.x + hint!.width <= box.x ||
          box.x + box.width <= hint!.x;
        expect(separated).toBe(true);
      }

      await page.getByRole("checkbox", { name: "Manter-me conectado" }).uncheck();
      await expect(hintText).toBeHidden();
      await info.click();
      await expect(hintText).toBeVisible();
      await info.click();
      await expect(hintText).toBeHidden();
    });
  });
}
