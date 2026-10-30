import { Injectable, type ArgumentMetadata, type PipeTransform } from "@nestjs/common";
import { z } from "zod";
import { ValidationError } from "../errors/validation-error.js";
import { isZodDto } from "./zod-dto.js";

// Mensagens de validação em pt-BR para o contrato de erro da API.
z.config(z.locales.ptBR());

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (!isZodDto(metadata.metatype)) return value;

    const result = metadata.metatype.schema.safeParse(value);
    if (result.success) return result.data;

    throw new ValidationError(
      result.error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })),
    );
  }
}
