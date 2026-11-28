import type { OrderCursor } from "./order-reader.js";

/** Cursor opaco: "data|id" em base64url. A posição vem do último pedido da página. */
export function encodeOrderCursor(cursor: OrderCursor): string {
  return Buffer.from(`${cursor.createdAt.toISOString()}|${cursor.id}`).toString("base64url");
}

export function decodeOrderCursor(value: string): OrderCursor {
  const [createdAt = "", id = ""] = Buffer.from(value, "base64url").toString().split("|");
  return { createdAt: new Date(createdAt), id };
}
