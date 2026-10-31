import { describe, expect, it } from "vitest";
import { modoSupabase } from "./modo-supabase";

const COM_SUPABASE = { SUPABASE_URL: "http://127.0.0.1:54321", SUPABASE_ANON_KEY: "chave" };

describe("modoSupabase", () => {
  it("roda os cenários quando o Supabase está configurado", () => {
    expect(modoSupabase(COM_SUPABASE)).toBe("rodar");
    expect(modoSupabase({ ...COM_SUPABASE, CI: "1" })).toBe("rodar");
  });

  it("pula os cenários fora do CI quando falta o Supabase", () => {
    expect(modoSupabase({})).toBe("pular");
    expect(modoSupabase({ SUPABASE_URL: "http://127.0.0.1:54321" })).toBe("pular");
  });

  it("falha no CI quando falta o Supabase, em vez de pular", () => {
    expect(modoSupabase({ CI: "1" })).toBe("falhar");
    expect(modoSupabase({ CI: "true", SUPABASE_ANON_KEY: "chave" })).toBe("falhar");
  });

  it("trata CI vazio como fora do CI", () => {
    expect(modoSupabase({ CI: "" })).toBe("pular");
  });
});
