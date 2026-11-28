import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import type { PhotoStorage } from "../domain/beer-photo.js";

const unavailable = () =>
  new CodedHttpError(
    503,
    "STORAGE_UNAVAILABLE",
    "Não conseguimos enviar a foto agora. Tente de novo em instantes.",
  );

/** Sem `SUPABASE_URL` e `SUPABASE_ANON_KEY` o envio de foto fica indisponível (o resto do admin segue). */
export class UnconfiguredPhotoStorage implements PhotoStorage {
  async readUpload(): Promise<Uint8Array | null> {
    throw unavailable();
  }

  async deleteUpload(): Promise<void> {
    throw unavailable();
  }

  async publish(): Promise<string> {
    throw unavailable();
  }
}
