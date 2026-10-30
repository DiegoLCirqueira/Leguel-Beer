import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { EmailConfirmation } from "../domain/email-confirmation.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Lê `auth.users.email_confirmed_at` do Supabase Auth pelo id da conta: prova que vem do servidor,
 * não do token (o `user_metadata` do token o usuário edita). Só leitura, query parametrizada.
 * O papel do DATABASE_URL precisa de SELECT em auth.users (o `postgres` do Supabase tem).
 */
@Injectable()
export class PrismaEmailConfirmation implements EmailConfirmation {
  constructor(private readonly prisma: PrismaService) {}

  async isConfirmed(userId: string): Promise<boolean> {
    if (!UUID.test(userId)) return false;
    const rows = await this.prisma.$queryRaw<{ confirmed: boolean }[]>`
      SELECT (email_confirmed_at IS NOT NULL) AS confirmed
      FROM auth.users
      WHERE id = ${userId}::uuid`;
    return rows[0]?.confirmed === true;
  }
}
