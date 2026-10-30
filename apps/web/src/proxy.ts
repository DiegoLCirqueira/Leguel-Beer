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

// Páginas do site: ficam de fora a API (/api/), os arquivos do Next (/_next/) e os estáticos, que
// terminam em extensão com letra (.webp, .ico), para não pegar páginas como /produto/v1.0.
export const config = { matcher: ["/((?!api/|_next/|.*\\.[a-z][a-z0-9]*$).*)"] };
