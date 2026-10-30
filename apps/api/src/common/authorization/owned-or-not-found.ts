import { NotFoundError } from "../errors/not-found-error.js";

/** Posse por objeto: o recurso de outra conta responde como se não existisse (404 igual ao de id inexistente). */
export function ownedOrNotFound<T extends { ownerId: string }>(
  resource: T | null | undefined,
  userId: string,
): T {
  if (!resource || resource.ownerId !== userId) throw new NotFoundError();
  return resource;
}
