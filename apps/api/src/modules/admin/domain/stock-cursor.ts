/** Posição no histórico do estoque: do mais recente ao mais antigo, desempatando pelo id. */
export interface StockCursor {
  createdAt: Date;
  id: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cursor opaco: "data|id" em base64url. */
export function encodeStockCursor(cursor: StockCursor): string {
  return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`).toString("base64url");
}

/** `null` quando o texto não é um cursor que a API gerou. */
export function decodeStockCursor(value: string): StockCursor | null {
  const [createdAt = "", id = "", ...rest] = Buffer.from(value, "base64url").toString().split("|");
  const date = new Date(createdAt);
  if (rest.length > 0 || !UUID.test(id) || Number.isNaN(date.getTime())) return null;
  if (date.toISOString() !== createdAt) return null;
  return { createdAt: date, id };
}
