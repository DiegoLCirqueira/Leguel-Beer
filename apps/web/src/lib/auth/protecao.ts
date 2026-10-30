type Papel = "cliente" | "admin";

type Pedido = { caminho: string; busca: string; temSessao: boolean; papel?: Papel };

export type DecisaoProtecao =
  | { tipo: "seguir" }
  | { tipo: "entrar"; retorno: string }
  | { tipo: "nao-encontrada" }
  | { tipo: "consultar-papel" };

const PAGINAS_DE_CLIENTE = ["/conta", "/checkout"];
const PAGINAS_DE_ADMIN = ["/admin"];

// "/conta" e "/conta/pedidos" valem; "/contato" não.
const dentroDe = (caminho: string, base: string) =>
  caminho === base || caminho.startsWith(`${base}/`);

/**
 * Páginas protegidas do site (guards-api): `/conta`, `/checkout` e `/admin` exigem sessão; sem ela,
 * a pessoa vai para a tela de entrar e volta depois. `/admin` ainda exige o papel admin: para quem
 * não é, a página some como "não encontrada".
 */
export function decidirProtecao({ caminho, busca, temSessao, papel }: Pedido): DecisaoProtecao {
  const ehAdmin = PAGINAS_DE_ADMIN.some((base) => dentroDe(caminho, base));
  const ehCliente = PAGINAS_DE_CLIENTE.some((base) => dentroDe(caminho, base));
  if (!ehAdmin && !ehCliente) return { tipo: "seguir" };

  if (!temSessao) return { tipo: "entrar", retorno: `${caminho}${busca}` };
  if (!ehAdmin) return { tipo: "seguir" };
  if (!papel) return { tipo: "consultar-papel" };
  return papel === "admin" ? { tipo: "seguir" } : { tipo: "nao-encontrada" };
}
