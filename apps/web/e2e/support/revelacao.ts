import { expect, type Page } from "@playwright/test";

/**
 * Espera o conteúdo de um Suspense terminar de ser revelado. O servidor manda esse conteúdo num
 * `<div hidden id="S:n">` e um script o move para o lugar do esqueleto; até o div sumir, o mesmo
 * texto existe duas vezes e o `getByText` falha por "strict mode violation" (que o Playwright não
 * repete). Sem Suspense pendente, passa direto.
 */
export async function aguardarRevelacao(page: Page) {
  await expect(page.locator('div[hidden][id^="S:"]')).toHaveCount(0);
}
