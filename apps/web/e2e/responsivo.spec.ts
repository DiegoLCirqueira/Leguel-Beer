import type { Page } from "@playwright/test";
import { test as semConfirmacao } from "@playwright/test";
import { expect, test } from "./support/maior-de-idade";

type Formato = { w: number; h: number };

// Celulares em pé: de 320 px (iPhone SE de 1ª geração) a 480 px, com alturas baixas e altas.
const EM_PE: Formato[] = [
  { w: 320, h: 568 },
  { w: 320, h: 640 },
  { w: 360, h: 568 },
  { w: 360, h: 640 },
  { w: 360, h: 780 },
  { w: 375, h: 667 },
  { w: 390, h: 844 },
  { w: 393, h: 852 },
  { w: 412, h: 915 },
  { w: 412, h: 932 },
  { w: 414, h: 896 },
  { w: 430, h: 932 },
  { w: 480, h: 800 },
];
// Celulares deitados: a largura é grande e a altura é pequena.
const DEITADO: Formato[] = [
  { w: 667, h: 375 },
  { w: 740, h: 360 },
  { w: 844, h: 390 },
];
// Do tablet em diante vale a versão de desktop, que vem depois: aqui o site só não pode quebrar.
const TABLET_E_DESKTOP: Formato[] = [
  { w: 768, h: 1024 },
  { w: 1024, h: 768 },
  { w: 1280, h: 800 },
];

type Pagina = {
  nome: string;
  caminho: string;
  // Páginas feitas para caber na altura da tela, sem rolagem vertical (celular em pé).
  semRolagemVertical?: boolean;
  precisaMaioridade?: boolean;
  abrir?: (page: Page) => Promise<void>;
};

const PAGINAS: Pagina[] = [
  { nome: "maioridade", caminho: "/maioridade", semRolagemVertical: true },
  {
    nome: "acesso negado",
    caminho: "/maioridade",
    semRolagemVertical: true,
    abrir: async (page) => {
      await page.getByRole("button", { name: "Não" }).click();
    },
  },
  {
    nome: "boas-vindas",
    caminho: "/boas-vindas",
    semRolagemVertical: true,
    precisaMaioridade: true,
  },
  { nome: "criar conta", caminho: "/criar-conta", precisaMaioridade: true },
  { nome: "entrar", caminho: "/entrar", precisaMaioridade: true },
  { nome: "termos", caminho: "/termos" },
  { nome: "privacidade", caminho: "/privacidade" },
  { nome: "entregas", caminho: "/entregas", precisaMaioridade: true },
];

// Mede tudo o que o leitor vê e toca: sem rolagem horizontal, nada fora da tela, nada por cima.
async function medir(page: Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const raiz = document.documentElement;
    const interativos = Array.from(document.querySelectorAll("a, button, input")).filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !e.closest(".sr-only");
    });
    const nome = (e: Element) =>
      (e.getAttribute("aria-label") || e.textContent || e.getAttribute("name") || e.tagName)
        .trim()
        .slice(0, 30);
    const foraDaLargura = interativos
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.left < -1 || r.right > vw + 1;
      })
      .map(nome);
    const abaixoDaTela = interativos
      .filter((e) => e.getBoundingClientRect().bottom > vh + 1)
      .map(nome);
    // Só caixas de bloco: um link no meio de uma frase que quebra em duas linhas tem caixa em L.
    const sobrepostos: string[] = [];
    const caixas = interativos.filter((e) => getComputedStyle(e).display !== "inline");
    for (let i = 0; i < caixas.length; i++) {
      for (let j = i + 1; j < caixas.length; j++) {
        const a = caixas[i]!;
        const b = caixas[j]!;
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const largura = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const altura = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (largura > 3 && altura > 3) sobrepostos.push(`${nome(a)} x ${nome(b)}`);
      }
    }
    return {
      excessoX: raiz.scrollWidth - vw,
      excessoY: raiz.scrollHeight - vh,
      foraDaLargura,
      abaixoDaTela,
      sobrepostos,
    };
  });
}

function cobrir(formatos: Formato[], rotulo: string, { vertical }: { vertical: boolean }) {
  for (const pagina of PAGINAS) {
    for (const { w, h } of formatos) {
      const teste =
        pagina.precisaMaioridade || pagina.nome === "termos" || pagina.nome === "privacidade"
          ? test
          : semConfirmacao;
      teste(`${pagina.nome} em ${w}x${h} (${rotulo})`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(pagina.caminho);
        await pagina.abrir?.(page);
        await page.waitForTimeout(150);

        const medidas = await medir(page);

        expect(medidas.excessoX, "rolagem horizontal").toBeLessThanOrEqual(0);
        expect(medidas.foraDaLargura, "controles fora da largura da tela").toEqual([]);
        expect(medidas.sobrepostos, "controles um por cima do outro").toEqual([]);
        // Sem rolagem vertical só em retrato de ~640 px de altura para cima; abaixo disso (ou deitado,
        // ou com zoom alto) pode rolar, para os controles seguirem alcançáveis (WCAG 1.4.10).
        if (vertical && h >= 640 && pagina.semRolagemVertical) {
          expect(medidas.excessoY, "rolagem vertical").toBeLessThanOrEqual(0);
          expect(medidas.abaixoDaTela, "controles abaixo da tela").toEqual([]);
        }
      });
    }
  }
}

cobrir(EM_PE, "celular em pé", { vertical: true });
cobrir(DEITADO, "celular deitado", { vertical: false });
cobrir(TABLET_E_DESKTOP, "tablet e desktop: não pode quebrar", { vertical: false });
