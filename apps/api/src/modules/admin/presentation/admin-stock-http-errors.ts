import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import { StockBelowReservedError, StockNegativeError } from "../domain/stock.js";

/** Traduz as recusas do ajuste de estoque; as mensagens são as da spec. */
function toHttpError(error: unknown): unknown {
  if (error instanceof StockNegativeError) {
    return new CodedHttpError(422, "STOCK_NEGATIVE", error.message);
  }
  if (error instanceof StockBelowReservedError) {
    return new CodedHttpError(422, "STOCK_BELOW_RESERVED", error.message);
  }
  return error;
}

export async function withStockErrors<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toHttpError(error);
  }
}
