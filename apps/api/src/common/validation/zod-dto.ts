import type { ZodType } from "zod";

export interface ZodDtoClass<T = unknown> {
  new (): T;
  readonly schema: ZodType<T>;
}

/** Cria uma classe de DTO ligada a um schema Zod; o ZodValidationPipe global valida pelo schema. */
export function zodDto<T>(schema: ZodType<T>): ZodDtoClass<T> {
  class ZodDto {
    static readonly schema = schema;
  }
  return ZodDto as unknown as ZodDtoClass<T>;
}

export function isZodDto(metatype: unknown): metatype is ZodDtoClass {
  return typeof metatype === "function" && "schema" in metatype;
}
