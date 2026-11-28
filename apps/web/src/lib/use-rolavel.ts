"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Diz se o conteúdo do elemento passa da altura visível. Mede de novo quando a caixa muda de tamanho
 * e quando `chave` muda (o conteúdo pode mudar sem mudar a caixa: esqueleto → moldura).
 */
export function useRolavel<T extends HTMLElement>(chave?: unknown) {
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
  }, [chave]);
  return [ref, rolavel] as const;
}
