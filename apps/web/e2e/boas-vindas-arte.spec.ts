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

async function expectCheckboxInDrawnRow(page: Page) {
  const stage = await stageBox(page);
  const scale = stage.width / ART.width;
  const box = await page.getByRole("checkbox", { name: "Manter-me conectado" }).boundingBox();
  if (!box) throw new Error("checkbox não encontrado");
  const expectedCenterY =
    stage.y + (CONTROLS.checkbox.y + CONTROLS.checkbox.h / 2 - ART.y0) * scale;
  expect(Math.abs(box.y + box.height / 2 - expectedCenterY)).toBeLessThanOrEqual(TOLERANCE);
  expect(box.x).toBeGreaterThanOrEqual(stage.x + (200 - ART.x0) * scale - TOLERANCE);
  expect(box.x + box.width).toBeLessThanOrEqual(stage.x + (650 - ART.x0) * scale + TOLERANCE);
}

const ALL_CONTROLS = (page: Page) => [
  page.getByRole("link", { name: "Entrar" }),
  page.getByRole("link", { name: "Criar conta" }),
  page.getByRole("link", { name: "Continuar como convidado" }),
  page.getByRole("checkbox", { name: "Manter-me conectado" }),
  page.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" }),
];

const LOW_VIEWPORTS = [
  { width: 390, height: 700 },
  { width: 390, height: 740 },
  { width: 412, height: 840 },
  { width: 360, height: 640 },
];

for (const viewport of LOW_VIEWPORTS) {
  test.describe(`boas-vindas baixa ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("todos os controles ficam dentro da tela, sem rolagem", async ({ page }) => {
      await page.goto("/boas-vindas");

      for (const control of ALL_CONTROLS(page)) {
        const box = await control.boundingBox();
        if (!box) throw new Error("controle não encontrado");
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
      }
      const overflow = await page.evaluate(() => ({
        x: document.documentElement.scrollWidth - window.innerWidth,
        y: document.documentElement.scrollHeight - window.innerHeight,
      }));
      expect(overflow.x).toBeLessThanOrEqual(0);
      expect(overflow.y).toBeLessThanOrEqual(0);
    });
  });
}

async function readableFontSizes(page: Page) {
  const size = (locator: Locator) =>
    locator.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  return {
    enter: await size(page.getByRole("link", { name: "Entrar" })),
    signUp: await size(page.getByRole("link", { name: "Criar conta" })),
    guest: await size(page.getByRole("link", { name: "Continuar como convidado" })),
    label: await size(
      page.getByRole("checkbox", { name: "Manter-me conectado" }).locator("xpath=ancestor::label"),
    ),
  };
}

for (const viewport of [
  { width: 360, height: 780 },
  { width: 360, height: 640 },
  { width: 844, height: 390 },
  { width: 180, height: 390 },
]) {
  test.describe(`texto legível ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("fontes com piso legível (botões 14 px, convidado e rótulo 12 px)", async ({ page }) => {
      await page.goto("/boas-vindas");

      const sizes = await readableFontSizes(page);

      expect(sizes.enter).toBeGreaterThanOrEqual(14);
      expect(sizes.signUp).toBeGreaterThanOrEqual(14);
      expect(sizes.guest).toBeGreaterThanOrEqual(12);
      expect(sizes.label).toBeGreaterThanOrEqual(12);
    });
  });
}

test.describe("paisagem 844x390", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("tem layout utilizável: coluna central, sem rolagem horizontal e controles alcançáveis", async ({
    page,
  }) => {
    await page.goto("/boas-vindas");

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflowX).toBeLessThanOrEqual(0);
    const checkbox = page.getByRole("checkbox", { name: "Manter-me conectado" });
    await checkbox.scrollIntoViewIfNeeded();
    const box = await checkbox.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(390);
    const stage = await stageBox(page);
    expect(stage.width).toBeGreaterThanOrEqual(300);
    expect(Math.abs(stage.x + stage.width / 2 - 422)).toBeLessThanOrEqual(2);
  });
});

test.describe("zoom de 200% (viewport de 180x390 px CSS)", () => {
  test.use({ viewport: { width: 180, height: 390 } });

  test("os controles continuam alcançáveis e a dica abre", async ({ page }) => {
    await page.goto("/boas-vindas");

    const info = page.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
    await info.scrollIntoViewIfNeeded();
    await info.click();

    await expect(page.getByText(/Sua sessão continua ativa/)).toBeVisible();
  });
});

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
      await expectCheckboxInDrawnRow(page);

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
        const expected =
          (
            (await control.evaluate((el) => (el.closest("label") ?? el).textContent)) ?? ""
          ).trim() || "(i)";
        const probe = (dy: number) =>
          page.evaluate(
            ({ x, y }) =>
              document.elementFromPoint(x, y)?.closest("a,button,label")?.textContent ?? "",
            { x: centerX, y: centerY + dy },
          );
        let top = 0;
        while (top > -60 && ((await probe(top - 1)).trim() || "(i)") === expected) top--;
        let bottom = 0;
        while (bottom < 60 && ((await probe(bottom + 1)).trim() || "(i)") === expected) bottom++;

        expect(bottom - top + 1).toBeGreaterThanOrEqual(43);

        if (expected === "(i)") {
          const probeX = (dx: number) =>
            page.evaluate(
              ({ x, y }) =>
                document.elementFromPoint(x, y)?.closest("a,button,label")?.textContent ?? "",
              { x: centerX + dx, y: centerY },
            );
          let left = 0;
          while (left > -40 && ((await probeX(left - 1)).trim() || "(i)") === expected) left--;
          let right = 0;
          while (right < 40 && ((await probeX(right + 1)).trim() || "(i)") === expected) right++;
          expect(right - left + 1).toBeGreaterThanOrEqual(43);
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
