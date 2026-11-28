import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { ConfirmationEmailData, ConfirmationEmailSource } from "../domain/order-email.js";

export class PrismaConfirmationEmailSource implements ConfirmationEmailSource {
  constructor(private readonly prisma: PrismaService) {}

  async find(orderId: string): Promise<ConfirmationEmailData | null> {
    void this.prisma;
    void orderId;
    return null;
  }

  async markSent(orderId: string, at: Date): Promise<void> {
    void orderId;
    void at;
  }
}
