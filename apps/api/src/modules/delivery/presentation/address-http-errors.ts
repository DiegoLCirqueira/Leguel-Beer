import { ConflictException } from "@nestjs/common";
import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import { AddressLimitReachedError, AddressNotLocatedError } from "../domain/address-errors.js";
import { AddressOwnerNotFoundError } from "../domain/address-repository.js";
import { DeliverySettingsNotConfiguredError } from "../domain/delivery-settings-repository.js";
import { MapsUnavailableError } from "../domain/maps.js";

/**
 * Traduz os erros de domínio das rotas de endereço para respostas HTTP. As mensagens são as do
 * cliente: nunca levam stack, SQL, endereço nem coordenadas.
 */
function toHttpError(error: unknown): unknown {
  if (error instanceof DeliverySettingsNotConfiguredError) {
    return new CodedHttpError(
      503,
      "DELIVERY_SETTINGS_MISSING",
      "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
    );
  }
  if (error instanceof MapsUnavailableError) {
    return new CodedHttpError(
      503,
      "MAPS_UNAVAILABLE",
      "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
    );
  }
  if (error instanceof AddressLimitReachedError) {
    return new CodedHttpError(422, "ADDRESS_LIMIT_REACHED", error.message);
  }
  if (error instanceof AddressNotLocatedError) {
    return new CodedHttpError(422, "ADDRESS_NOT_LOCATED", error.message);
  }
  if (error instanceof AddressOwnerNotFoundError) return new ConflictException();
  return error;
}

export async function withAddressErrors<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toHttpError(error);
  }
}
