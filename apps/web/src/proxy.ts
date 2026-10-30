import { NextResponse, type NextRequest } from "next/server";
import { decidirAcesso } from "@/lib/acesso-maioridade";
import { MAIORIDADE_COOKIE } from "@/lib/maioridade";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decisao = decidirAcesso({
    caminho: pathname,
    busca: search,
    cookie: request.cookies.get(MAIORIDADE_COOKIE)?.value,
    userAgent: request.headers.get("user-agent") ?? "",
    agora: Date.now(),
  });
  if (decisao.tipo !== "perguntar") return NextResponse.next();

  const destino = new URL("/maioridade", request.url);
  destino.searchParams.set("retorno", decisao.retorno);
  return NextResponse.redirect(destino);
}

// Páginas do site: ficam de fora a API, os arquivos do Next e os estáticos (qualquer caminho com extensão).
export const config = { matcher: ["/((?!api|_next|.*[.].*).*)"] };
