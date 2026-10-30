import { expect, test as base } from "@playwright/test";

// Mesmo nome e formato do cookie da confirmação de maioridade: a data da confirmação em ms.
export const MAIORIDADE_COOKIE = "leguele_maioridade";

// `test` das telas que vêm depois da pergunta: abre o navegador com a maioridade já confirmada.
export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await context.addCookies([
      {
        name: MAIORIDADE_COOKIE,
        value: String(Date.now()),
        url: baseURL ?? "http://localhost:3000",
      },
    ]);
    await use(context);
  },
});

export { expect };
