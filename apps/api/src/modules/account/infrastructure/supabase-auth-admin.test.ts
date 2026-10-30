import { describe, expect, it } from "vitest";
import { SupabaseAuthAdmin } from "./supabase-auth-admin.js";

type Call = { url: string; init: RequestInit };

function fakeFetch(responses: { status: number; body: unknown }[]): {
  fetch: typeof fetch;
  calls: Call[];
} {
  const calls: Call[] = [];
  const fetchFake = (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    calls.push({ url: String(input), init });
    const next = responses.shift() ?? { status: 500, body: {} };
    return Promise.resolve(new Response(JSON.stringify(next.body), { status: next.status }));
  };
  return { fetch: fetchFake as typeof fetch, calls };
}

const URL_BASE = "http://127.0.0.1:54321";
const KEY = "chave-de-servico-local";

describe("SupabaseAuthAdmin", () => {
  it("encontra o usuário pelo e-mail, sem diferenciar maiúsculas", async () => {
    const { fetch, calls } = fakeFetch([
      { status: 200, body: { users: [{ id: "u1", email: "Admin@Leguele.test" }] } },
    ]);

    const user = await new SupabaseAuthAdmin(URL_BASE, KEY, fetch).findByEmail(
      "admin@leguele.test",
    );

    expect(user).toEqual({ id: "u1", email: "admin@leguele.test" });
    expect(calls[0]?.url).toBe(`${URL_BASE}/auth/v1/admin/users?page=1&per_page=200`);
    expect(calls[0]?.init.headers).toMatchObject({ apikey: KEY, Authorization: `Bearer ${KEY}` });
  });

  it("devolve null quando não há usuário com o e-mail, percorrendo as páginas", async () => {
    const full = Array.from({ length: 200 }, (_, i) => ({
      id: `u${i}`,
      email: `x${i}@leguele.test`,
    }));
    const { fetch, calls } = fakeFetch([
      { status: 200, body: { users: full } },
      { status: 200, body: { users: [] } },
    ]);

    const user = await new SupabaseAuthAdmin(URL_BASE, KEY, fetch).findByEmail(
      "admin@leguele.test",
    );

    expect(user).toBeNull();
    expect(calls.map((c) => c.url)).toEqual([
      `${URL_BASE}/auth/v1/admin/users?page=1&per_page=200`,
      `${URL_BASE}/auth/v1/admin/users?page=2&per_page=200`,
    ]);
  });

  it("cria o usuário já confirmado", async () => {
    const { fetch, calls } = fakeFetch([
      { status: 200, body: { id: "u9", email: "admin@leguele.test" } },
    ]);

    const user = await new SupabaseAuthAdmin(URL_BASE, KEY, fetch).createConfirmedUser(
      "admin@leguele.test",
      "senha-forte-123456",
    );

    expect(user).toEqual({ id: "u9", email: "admin@leguele.test" });
    expect(calls[0]?.url).toBe(`${URL_BASE}/auth/v1/admin/users`);
    expect(calls[0]?.init.method).toBe("POST");
    expect(JSON.parse(String(calls[0]?.init.body))).toEqual({
      email: "admin@leguele.test",
      password: "senha-forte-123456",
      email_confirm: true,
    });
  });

  it("falha sem vazar a senha nem a chave na mensagem", async () => {
    const { fetch } = fakeFetch([{ status: 422, body: { msg: "senha fraca" } }]);

    const attempt = new SupabaseAuthAdmin(URL_BASE, KEY, fetch).createConfirmedUser(
      "admin@leguele.test",
      "senha-forte-123456",
    );

    await expect(attempt).rejects.toThrow(/422/);
    await expect(attempt).rejects.not.toThrow(/senha-forte-123456|chave-de-servico-local/);
  });
});
