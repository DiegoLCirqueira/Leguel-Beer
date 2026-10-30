import { NextResponse, type NextRequest } from "next/server";
import { decidirAcesso } from "@/lib/acesso-maioridade";
import {
  COOKIE_ACESSO,
  COOKIE_MANTER,
  COOKIE_RENOVACAO,
  opcoesCookieSessao,
} from "@/lib/auth/cookies";
import { precisaRenovar } from "@/lib/auth/expiracao";
import { createGoTrue, type Sessao } from "@/lib/auth/gotrue";
import { decidirProtecao } from "@/lib/auth/protecao";
import { MAIORIDADE_COOKIE } from "@/lib/maioridade";

type EstadoDaSessao = {
  temSessao: boolean;
  acesso?: string;
  renovacao?: string;
  manter: boolean;
  /** Sessão recusada na renovação: os cookies precisam sumir. */
  encerrada: boolean;
};

/** Papel da conta, consultado na API só para `/admin`; qualquer falha fecha a porta (cliente). */
async function consultarPapel(token: string): Promise<"cliente" | "admin"> {
  const base = process.env.API_URL ?? "http://localhost:3333";
  try {
    const resposta = await fetch(`${base}/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resposta.ok) return "cliente";
    const { papel } = (await resposta.json()) as { papel?: string };
    return papel === "admin" ? "admin" : "cliente";
  } catch {
    return "cliente";
  }
}

/** Lê a sessão dos cookies e renova o token de acesso quando está perto de vencer. */
async function prepararSessao(request: NextRequest): Promise<EstadoDaSessao> {
  const acesso = request.cookies.get(COOKIE_ACESSO)?.value;
  const renovacao = request.cookies.get(COOKIE_RENOVACAO)?.value;
  const manter = request.cookies.get(COOKIE_MANTER)?.value === "1";
  if (!acesso && !renovacao) return { temSessao: false, manter, encerrada: false };

  if (!precisaRenovar(acesso, Date.now())) {
    return { temSessao: true, acesso, renovacao, manter, encerrada: false };
  }

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const nova: Sessao | null =
    renovacao && url && anonKey ? await createGoTrue({ url, anonKey }).refresh(renovacao) : null;
  if (!nova) return { temSessao: false, manter, encerrada: true };

  return {
    temSessao: true,
    acesso: nova.accessToken,
    renovacao: nova.refreshToken,
    manter,
    encerrada: false,
  };
}

function gravarCookies(resposta: NextResponse, sessao: EstadoDaSessao) {
  if (sessao.encerrada) {
    for (const nome of [COOKIE_ACESSO, COOKIE_RENOVACAO, COOKIE_MANTER]) {
      resposta.cookies.delete(nome);
    }
    return;
  }
  if (!sessao.temSessao || !sessao.acesso || !sessao.renovacao) return;
  // A cada requisição os cookies ganham mais 30 dias (Manter-me conectado); sem a opção, seguem de sessão.
  const opcoes = opcoesCookieSessao({
    manterConectado: sessao.manter,
    producao: process.env.NODE_ENV === "production",
  });
  resposta.cookies.set(COOKIE_ACESSO, sessao.acesso, opcoes);
  resposta.cookies.set(COOKIE_RENOVACAO, sessao.renovacao, opcoes);
  resposta.cookies.set(COOKIE_MANTER, sessao.manter ? "1" : "0", opcoes);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const maioridade = decidirAcesso({
    caminho: pathname,
    busca: search,
    cookie: request.cookies.get(MAIORIDADE_COOKIE)?.value,
    userAgent: request.headers.get("user-agent") ?? "",
    agora: Date.now(),
  });
  if (maioridade.tipo === "perguntar") {
    const destino = new URL("/maioridade", request.url);
    destino.searchParams.set("retorno", maioridade.retorno);
    return NextResponse.redirect(destino);
  }

  const sessao = await prepararSessao(request);
  let decisao = decidirProtecao({ caminho: pathname, busca: search, temSessao: sessao.temSessao });
  if (decisao.tipo === "consultar-papel" && sessao.acesso) {
    decisao = decidirProtecao({
      caminho: pathname,
      busca: search,
      temSessao: true,
      papel: await consultarPapel(sessao.acesso),
    });
  }

  let resposta: NextResponse;
  if (decisao.tipo === "entrar") {
    const destino = new URL("/entrar", request.url);
    destino.searchParams.set("retorno", decisao.retorno);
    resposta = NextResponse.redirect(destino);
  } else if (decisao.tipo === "nao-encontrada" || decisao.tipo === "consultar-papel") {
    // Sem permissão a área some: a página não existe, então o Next responde 404.
    resposta = NextResponse.rewrite(new URL("/nao-encontrada", request.url));
  } else {
    // Os cookies renovados valem já nesta requisição, para as páginas do servidor.
    if (sessao.temSessao && sessao.acesso && sessao.renovacao) {
      request.cookies.set(COOKIE_ACESSO, sessao.acesso);
      request.cookies.set(COOKIE_RENOVACAO, sessao.renovacao);
    }
    resposta = NextResponse.next({ request });
  }
  gravarCookies(resposta, sessao);
  return resposta;
}

// Páginas do site: ficam de fora a API (/api/), os arquivos do Next (/_next/) e os estáticos, que
// terminam em extensão com letra (.webp, .ico), para não pegar páginas como /produto/v1.0.
export const config = { matcher: ["/((?!api/|_next/|.*\\.[a-z][a-z0-9]*$).*)"] };
