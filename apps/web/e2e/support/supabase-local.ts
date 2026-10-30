import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Lê apps/web/.env.local (fora do git), como o servidor do site; o que já está no ambiente vale mais.
const arquivo = resolve(process.cwd(), ".env.local");
if (existsSync(arquivo)) {
  for (const linha of readFileSync(arquivo, "utf8").split("\n")) {
    const posicao = linha.indexOf("=");
    if (posicao < 1 || linha.trim().startsWith("#")) continue;
    const nome = linha.slice(0, posicao).trim();
    const valor = linha
      .slice(posicao + 1)
      .trim()
      .replace(/^"|"$/g, "");
    process.env[nome] ??= valor;
  }
}

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EMAILS_URL = process.env.SUPABASE_EMAILS_URL ?? "http://127.0.0.1:54324";

/** Os cenários com o Supabase local só rodam onde ele existe (o CI não tem). */
export const supabaseDisponivel = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const emailUnico = (prefixo = "ana") =>
  `${prefixo}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@exemplo.com`;

interface EmailRecebido {
  assunto: string;
  html: string;
}

/** Espera o e-mail chegar no visualizador de e-mails do Supabase local (Mailpit). */
export async function esperarEmail(para: string, depoisDe = 0): Promise<EmailRecebido> {
  const limite = Date.now() + 15_000;
  while (Date.now() < limite) {
    const busca = await fetch(
      `${EMAILS_URL}/api/v1/search?query=${encodeURIComponent(`to:${para}`)}`,
    );
    const { messages } = (await busca.json()) as {
      messages: { ID: string; Subject: string; Created: string }[];
    };
    const novo = messages.find((m) => Date.parse(m.Created) >= depoisDe);
    if (novo) {
      const corpo = await fetch(`${EMAILS_URL}/api/v1/message/${novo.ID}`);
      const { HTML } = (await corpo.json()) as { HTML: string };
      return { assunto: novo.Subject, html: HTML };
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`nenhum e-mail para ${para} no visualizador`);
}

/**
 * Caminho e parâmetros do botão "Confirmar minha conta" do e-mail. A origem do e-mail é a do
 * `site_url` do Supabase (localhost:3000); o teste abre o mesmo caminho no site que está testando.
 */
export function linkDeConfirmacao(html: string): string {
  const achado = html.match(/href="([^"]*\/auth\/confirmar\?[^"]*)"/);
  if (!achado?.[1]) throw new Error("link de confirmação não encontrado no e-mail");
  const url = new URL(achado[1].replaceAll("&amp;", "&"));
  return `${url.pathname}${url.search}`;
}

const cabecalhos = { apikey: SUPABASE_ANON_KEY ?? "", "Content-Type": "application/json" };

/** Cria uma conta já confirmada, direto no Supabase local, sem passar pelo site. */
export async function criarContaConfirmada(email: string, senha: string) {
  const antes = Date.now() - 2000;
  await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: cabecalhos,
    body: JSON.stringify({
      email,
      password: senha,
      data: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
    }),
  });
  const { html } = await esperarEmail(email, antes);
  const tokenHash = new URL(linkDeConfirmacao(html), "http://x").searchParams.get("token_hash");
  await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
    method: "POST",
    headers: cabecalhos,
    body: JSON.stringify({ type: "signup", token_hash: tokenHash }),
  });
}
