import { expect, test } from "@playwright/test";
import { aguardarRevelacao } from "./support/revelacao";

// O servidor manda o conteúdo de um Suspense num <div hidden id="S:n"> e um script o move para o
// lugar do esqueleto. Enquanto o div não some, o mesmo texto existe duas vezes no DOM e o
// getByText do Playwright falha por "strict mode violation" (flake do produto.spec no CI).
test("aguardarRevelacao espera o div oculto do Suspense sumir, deixando um só 'Esgotado'", async ({
  page,
}) => {
  await page.setContent(`
    <main><span>Esgotado</span></main>
    <div hidden id="S:0"><main><span>Esgotado</span></main></div>
    <script>setTimeout(() => document.getElementById("S:0").remove(), 400)</script>
  `);
  await expect(page.getByText("Esgotado", { exact: true })).toHaveCount(2);

  await aguardarRevelacao(page);

  await expect(page.getByText("Esgotado", { exact: true })).toHaveCount(1);
});

test("aguardarRevelacao passa direto quando não há conteúdo oculto do Suspense", async ({
  page,
}) => {
  await page.setContent("<main><span>Esgotado</span></main>");

  await aguardarRevelacao(page);

  await expect(page.getByText("Esgotado", { exact: true })).toHaveCount(1);
});
