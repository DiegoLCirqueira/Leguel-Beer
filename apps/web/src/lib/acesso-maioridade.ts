import { MAIORIDADE_VALIDADE_MS } from "./maioridade";

type Pedido = {
  caminho: string;
  busca?: string;
  cookie?: string;
  userAgent?: string;
  agora: number;
};

export type Decisao =
  { tipo: "seguir" } | { tipo: "perguntar"; retorno: string } | { tipo: "liberar-robo" };

const ROBOS_DE_BUSCA = /googlebot|bingbot|duckduckbot|baiduspider|yandexbot|slurp/i;

// O cookie guarda a data da confirmação em ms; vale por 30 dias e não pode estar no futuro.
function confirmacaoValida(cookie: string | undefined, agora: number) {
  if (!cookie || !/^\d+$/.test(cookie)) return false;
  const idade = agora - Number(cookie);
  return idade >= 0 && idade <= MAIORIDADE_VALIDADE_MS;
}

export function decidirAcesso({
  caminho,
  busca = "",
  cookie,
  userAgent = "",
  agora,
}: Pedido): Decisao {
  if (caminho === "/maioridade") return { tipo: "seguir" };
  if (confirmacaoValida(cookie, agora)) return { tipo: "seguir" };
  if (ROBOS_DE_BUSCA.test(userAgent)) return { tipo: "liberar-robo" };
  return { tipo: "perguntar", retorno: `${caminho}${busca}` };
}
