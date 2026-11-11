"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { marcarNavegouNoSite } from "@/lib/navegacao";

/** Marca (por aba) que a pessoa navegou dentro do app: o primeiro caminho não conta, as mudanças depois dele contam. */
export function MarcadorDeNavegacao() {
  const caminho = usePathname();
  const primeiro = useRef(caminho);
  useEffect(() => {
    if (caminho !== primeiro.current) marcarNavegouNoSite();
  }, [caminho]);
  return null;
}
