import { describe, expect, it } from "vitest";
import { SupabasePhotoStorage } from "./supabase-photo-storage.js";

type Call = { url: string; init: RequestInit };

function storageWith(respond: (call: Call) => Response) {
  const calls: Call[] = [];
  const fetchStub = (async (url: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(url), init: init ?? {} };
    calls.push(call);
    return respond(call);
  }) as typeof fetch;
  const storage = new SupabasePhotoStorage("http://supabase.test", "anon-key", fetchStub);
  return { storage, calls };
}

const header = (call: Call, name: string) => (call.init.headers as Record<string, string>)[name];

describe("SupabasePhotoStorage", () => {
  it("lê o envio no bucket privado com o token do admin e a chave pública, nunca uma chave de serviço", async () => {
    const { storage, calls } = storageWith(() => new Response(new Uint8Array([1, 2, 3])));

    const bytes = await storage.readUpload("a.webp", "token-do-admin");

    expect(Array.from(bytes ?? [])).toEqual([1, 2, 3]);
    expect(calls[0]?.url).toBe(
      "http://supabase.test/storage/v1/object/authenticated/cervejas-envio/a.webp",
    );
    expect(header(calls[0] as Call, "Authorization")).toBe("Bearer token-do-admin");
    expect(header(calls[0] as Call, "apikey")).toBe("anon-key");
  });

  it("arquivo que não existe (404 ou 400 do armazenamento) devolve null; outro erro lança", async () => {
    const missing = storageWith(() => new Response("{}", { status: 404 }));
    const broken = storageWith(() => new Response("{}", { status: 500 }));

    expect(await missing.storage.readUpload("a.webp", "t")).toBeNull();
    await expect(broken.storage.readUpload("a.webp", "t")).rejects.toThrow();
  });

  it("apaga o envio no bucket privado", async () => {
    const { storage, calls } = storageWith(() => new Response("{}", { status: 200 }));

    await storage.deleteUpload("a.webp", "t");

    expect(calls[0]?.init.method).toBe("DELETE");
    expect(calls[0]?.url).toBe("http://supabase.test/storage/v1/object/cervejas-envio/a.webp");
  });

  it("publica no bucket público sem sobrescrever e devolve o endereço público", async () => {
    const { storage, calls } = storageWith(() => new Response("{}", { status: 200 }));

    const url = await storage.publish("nova.webp", new Uint8Array([9]), "t");

    expect(url).toBe("http://supabase.test/storage/v1/object/public/cervejas/nova.webp");
    expect(calls[0]?.init.method).toBe("POST");
    expect(calls[0]?.url).toBe("http://supabase.test/storage/v1/object/cervejas/nova.webp");
    expect(header(calls[0] as Call, "Content-Type")).toBe("image/webp");
    expect(header(calls[0] as Call, "x-upsert")).toBe("false");
  });

  it("falha do armazenamento ao publicar lança, sem devolver endereço", async () => {
    const { storage } = storageWith(() => new Response("{}", { status: 409 }));

    await expect(storage.publish("nova.webp", new Uint8Array([9]), "t")).rejects.toThrow();
  });
});
