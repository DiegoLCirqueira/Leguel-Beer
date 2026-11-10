import type { ReactNode } from "react";

/** Altura da barra fixa (sem a área segura): a tela publica este valor em --altura-barra-loja. */
export const ALTURA_BARRA_FIXA_PX = 80;

/** Barra fixa no pé da tela, sempre visível (ex.: o botão "Adicionar à geladeira" da página de produto). */
export function BarraFixa({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-borda bg-fundo/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm">
      <div
        style={{ height: `${ALTURA_BARRA_FIXA_PX}px` }}
        className="mx-auto flex max-w-md items-center px-4"
      >
        {children}
      </div>
    </div>
  );
}
