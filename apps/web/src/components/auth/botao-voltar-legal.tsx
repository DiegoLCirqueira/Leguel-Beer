"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore, type MouseEvent } from "react";
import { destinoDoVoltar, type DestinoDoVoltar } from "@/lib/destino-do-voltar";
import { ESTILO_BOTAO_VOLTAR } from "./botao-voltar";

/**
 * Botão de voltar das páginas legais (termos, privacidade e entregas), no topo da página. Volta na
 * história quando a pessoa veio de outra página do site; numa aba nova (os termos abrem em nova aba
 * a partir do cadastro) o link leva ao /criar-conta, ou à boas-vindas em link direto. Sem JavaScript,
 * o link leva à boas-vindas.
 */
const semAssinatura = () => () => {};
const noServidor = (): DestinoDoVoltar => "/boas-vindas";
// O documento aberto de verdade (carga da página) é o da entrada de navegação; se a página atual tem
// outro caminho, a pessoa chegou por uma navegação dentro do site e o referrer não vale.
function navegouNoSite(): boolean {
  const [carga] = performance.getEntriesByType("navigation");
  return carga ? new URL(carga.name).pathname !== window.location.pathname : false;
}

const noNavegador = (): DestinoDoVoltar =>
  destinoDoVoltar({
    referrer: document.referrer,
    origem: window.location.origin,
    tamanhoDoHistorico: window.history.length,
    navegouNoSite: navegouNoSite(),
  });

export function BotaoVoltarLegal() {
  // O destino depende do navegador (referrer e história): no servidor vale a boas-vindas.
  const destino = useSyncExternalStore(semAssinatura, noNavegador, noServidor);
  const href = destino === "voltar" ? "/boas-vindas" : destino;

  function aoTocar(evento: MouseEvent<HTMLAnchorElement>) {
    if (destino !== "voltar") return;
    evento.preventDefault();
    window.history.back();
  }

  return (
    <Link
      href={href}
      aria-label="Voltar"
      onClick={aoTocar}
      className={`self-start ${ESTILO_BOTAO_VOLTAR}`}
    >
      <ChevronLeft aria-hidden="true" className="size-6" />
    </Link>
  );
}
