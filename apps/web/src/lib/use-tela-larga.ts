import { useSyncExternalStore } from "react";

const CONSULTA = "(min-width: 1024px)";

function assinar(aoMudar: () => void) {
  const lista = window.matchMedia(CONSULTA);
  lista.addEventListener("change", aoMudar);
  return () => lista.removeEventListener("change", aoMudar);
}

/** `true` a partir de 1024 px (breakpoint `lg`); no servidor e na hidratação, `false`. */
export function useTelaLarga(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  );
}
