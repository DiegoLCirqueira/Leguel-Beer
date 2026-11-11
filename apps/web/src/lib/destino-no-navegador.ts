import { destinoDoVoltar, type DestinoDoVoltar } from "./destino-do-voltar";

/**
 * O documento aberto de verdade (carga da página) é o da entrada de navegação; se a página atual tem
 * outro caminho, a pessoa chegou por uma navegação dentro do site e o `document.referrer` não vale.
 */
function navegouNoSite(): boolean {
  const [carga] = performance.getEntriesByType("navigation");
  return carga ? new URL(carga.name).pathname !== window.location.pathname : false;
}

/** Só no navegador: lê referrer, origem, história e entrada de navegação. Não grava nada. */
export function destinoNoNavegador(reserva?: string): DestinoDoVoltar {
  return destinoDoVoltar({
    referrer: document.referrer,
    origem: window.location.origin,
    tamanhoDoHistorico: window.history.length,
    navegouNoSite: navegouNoSite(),
    reserva,
  });
}

/** Clique simples com o botão principal: Ctrl, Cmd, Shift e o clique do meio ficam com o navegador. */
export function cliqueSimples(evento: {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return (
    evento.button === 0 && !evento.ctrlKey && !evento.metaKey && !evento.shiftKey && !evento.altKey
  );
}
