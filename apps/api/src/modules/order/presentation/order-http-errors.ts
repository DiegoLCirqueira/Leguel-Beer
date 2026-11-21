import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import { DeliverySettingsNotConfiguredError } from "../../delivery/domain/delivery-settings-repository.js";
import { MapsUnavailableError } from "../../delivery/domain/maps.js";
import {
  BirthDateRequiredError,
  EmptyFridgeError,
  IdempotencyKeyReusedError,
  OutOfDeliveryAreaError,
  OutOfStockError,
  PaymentNotConfirmableError,
  PendingOrderError,
  TotalChangedError,
  UnderageError,
} from "../domain/order-errors.js";

const FREIGHT_UNAVAILABLE = "Não conseguimos calcular o frete agora. Tente de novo em instantes.";

/**
 * Traduz os erros da criação do pedido para os códigos do contrato (`erroDoPedidoSchema`). As
 * mensagens são as do cliente: nunca levam stack, SQL, endereço nem data de nascimento.
 */
function toHttpError(error: unknown): unknown {
  if (error instanceof UnderageError) return new CodedHttpError(422, "UNDERAGE", error.message);
  if (error instanceof BirthDateRequiredError) {
    return new CodedHttpError(422, "BIRTH_DATE_REQUIRED", error.message);
  }
  if (error instanceof OutOfDeliveryAreaError) {
    return new CodedHttpError(422, "OUT_OF_DELIVERY_AREA", error.message);
  }
  if (error instanceof EmptyFridgeError) {
    return new CodedHttpError(422, "EMPTY_FRIDGE", error.message);
  }
  if (error instanceof IdempotencyKeyReusedError) {
    return new CodedHttpError(422, "IDEMPOTENCY_KEY_REUSED", error.message);
  }
  if (error instanceof PaymentNotConfirmableError) {
    return new CodedHttpError(409, "CONFLICT", error.message);
  }
  if (error instanceof PendingOrderError) {
    return new CodedHttpError(409, "PENDING_ORDER", error.message, { pedidoId: error.orderId });
  }
  if (error instanceof TotalChangedError) {
    return new CodedHttpError(409, "TOTAL_CHANGED", error.message, {
      ajustes: error.adjustments,
      totalAtualCentavos: error.currentTotalCents,
    });
  }
  if (error instanceof OutOfStockError) {
    return new CodedHttpError(409, "OUT_OF_STOCK", error.message, {
      cervejas: error.beers.map(({ beerId, name }) => ({ cervejaId: beerId, nome: name })),
      ajustes: error.adjustments,
    });
  }
  if (error instanceof DeliverySettingsNotConfiguredError) {
    return new CodedHttpError(503, "DELIVERY_SETTINGS_MISSING", FREIGHT_UNAVAILABLE);
  }
  if (error instanceof MapsUnavailableError) {
    return new CodedHttpError(503, "MAPS_UNAVAILABLE", FREIGHT_UNAVAILABLE);
  }
  return error;
}

export async function withOrderErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toHttpError(error);
  }
}
