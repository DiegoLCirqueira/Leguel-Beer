"use client";

import { useEffect, useRef, useState } from "react";

/** Diz se o conteúdo do elemento passa da altura visível (e acompanha mudanças de tamanho). */
export function useRolavel<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [rolavel, setRolavel] = useState(false);
  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;
    const medir = () => setRolavel(elemento.scrollHeight > elemento.clientHeight);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);
  return [ref, rolavel] as const;
}
