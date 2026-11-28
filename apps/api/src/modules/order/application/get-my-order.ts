import type { PedidoDoCliente } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { OrderReader } from "../domain/order-reader.js";
import type { OrderExpirer } from "./expire-due-orders.js";

export interface GetMyOrderInput {
  ownerId: string;
  orderId: string;
}

/** Um pedido do cliente da sessão, com itens, endereço de entrega e histórico de status. */
export class GetMyOrder {
  constructor(
    private readonly reader: OrderReader,
    private readonly expiration: OrderExpirer,
    private readonly now: () => Date,
  ) {}

  async execute(input: GetMyOrderInput): Promise<PedidoDoCliente> {
    const order = await this.reader.findOwned(input.ownerId, input.orderId);
    if (!order) throw new NotFoundError();
    void this.expiration;
    void this.now;
    return {
      id: order.id,
      numero: order.number,
      status: order.status,
      criadoEm: order.createdAt.toISOString(),
      validoAte: order.expiresAt.toISOString(),
      pagamento: order.payment,
      itens: order.items.map((item) => ({
        cervejaId: item.beerId,
        nome: item.name,
        precoCentavos: item.priceCents,
        quantidade: item.quantity,
      })),
      subtotalCentavos: order.subtotalCents,
      freteCentavos: order.shippingCents,
      totalCentavos: order.totalCents,
      enderecoDeEntrega: {
        cep: order.shipTo.zip,
        rua: order.shipTo.street,
        numero: order.shipTo.number,
        ...(order.shipTo.complement ? { complemento: order.shipTo.complement } : {}),
        bairro: order.shipTo.district,
        cidade: order.shipTo.city,
        uf: order.shipTo.state,
      },
      historico: order.history.map((change) => ({
        status: change.status,
        em: change.at.toISOString(),
      })),
    };
  }
}
