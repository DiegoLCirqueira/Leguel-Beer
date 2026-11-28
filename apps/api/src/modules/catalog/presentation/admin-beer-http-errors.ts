import { CodedHttpError } from "../../../common/errors/coded-http-error.js";
import {
  BeerNameTakenError,
  CategoryFullError,
  CategoryNotFoundError,
} from "../domain/admin-beer.js";
import { InvalidPhotoError, PhotoPathInvalidError } from "../domain/beer-photo.js";

/** Traduz os erros do cadastro de cervejas para status e códigos; as mensagens são as do admin. */
function toHttpError(error: unknown): unknown {
  if (error instanceof CategoryFullError) {
    return new CodedHttpError(409, "CATEGORY_FULL", error.message);
  }
  if (error instanceof BeerNameTakenError) {
    return new CodedHttpError(409, "BEER_NAME_TAKEN", error.message);
  }
  if (error instanceof CategoryNotFoundError) {
    return new CodedHttpError(422, "CATEGORY_NOT_FOUND", error.message);
  }
  if (error instanceof PhotoPathInvalidError) {
    return new CodedHttpError(422, "PHOTO_PATH_INVALID", error.message);
  }
  if (error instanceof InvalidPhotoError) {
    return new CodedHttpError(422, "INVALID_PHOTO", error.message);
  }
  return error;
}

export async function withAdminBeerErrors<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toHttpError(error);
  }
}
