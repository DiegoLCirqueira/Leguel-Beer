import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { ConfirmationEmailData, ConfirmationEmailSource } from "../domain/order-email.js";

export class PrismaConfirmationEmailSource implements ConfirmationEmailSource {
  constructor(private readonly prisma: PrismaService) {}

  async find(orderId: string): Promise<ConfirmationEmailData | null> {
    const row = await this.prisma.order.findUnique({
      where: { id: orderId },
      // Só o que o corpo do e-mail usa: telefone, nascimento e id do cliente nem são lidos.
      select: {
        number: true,
        paymentMethod: true,
        installments: true,
        subtotalCents: true,
        shippingCents: true,
        totalCents: true,
        customerName: true,
        shipZip: true,
        shipStreet: true,
        shipNumber: true,
        shipComplement: true,
        shipDistrict: true,
        shipCity: true,
        shipState: true,
        createdAt: true,
        profile: { select: { email: true } },
        items: {
          select: { name: true, unitPriceCents: true, quantity: true },
          orderBy: [{ name: "asc" }, { id: "asc" }],
        },
      },
    });
    if (!row) return null;
    return {
      to: row.profile.email,
      customerName: row.customerName,
      number: row.number,
      createdAt: row.createdAt,
      items: row.items.map((item) => ({
        name: item.name,
        priceCents: item.unitPriceCents,
        quantity: item.quantity,
      })),
      subtotalCents: row.subtotalCents,
      shippingCents: row.shippingCents,
      totalCents: row.totalCents,
      payment:
        row.paymentMethod === "CARD"
          ? { tipo: "cartao", parcelas: row.installments ?? 1 }
          : { tipo: "pix" },
      shipTo: {
        zip: row.shipZip,
        street: row.shipStreet,
        number: row.shipNumber,
        complement: row.shipComplement,
        district: row.shipDistrict,
        city: row.shipCity,
        state: row.shipState,
      },
    };
  }

  async markSent(orderId: string, at: Date): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { confirmationEmailSentAt: at },
    });
  }
}
