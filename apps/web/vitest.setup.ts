import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// jsdom não tem matchMedia: por padrão nenhuma consulta de mídia vale (movimento normal). Testes em
// ambiente node não têm `window`.
beforeEach(() => {
  if (typeof window === "undefined") return;
  window.matchMedia = (consulta: string) =>
    ({
      matches: false,
      media: consulta,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    }) as MediaQueryList;
});

afterEach(cleanup);
