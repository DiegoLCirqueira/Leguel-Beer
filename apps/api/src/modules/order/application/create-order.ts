import { createHash } from "node:crypto";
import {
  temMaioridade,
  validoAte,
  type CriarPedidoRequest,
  type PedidoCriado,
} from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type {
  CreateOrderUnit,
  CustomerSource,
  FridgeSource,
  NewOrder,
  OrderCreation,
  PaymentRecord,
  ShippingQuoter,
} from "../domain/create-order-ports.js";
import {
  BirthDateRequiredError,
  EmptyFridgeError,
  IdempotencyKeyReusedError,
  OutOfDeliveryAreaError,
  OutOfStockError,
  PendingOrderError,
  TotalChangedError,
  UnderageError,
} from "../domain/order-errors.js";

export interface CreateOrderDependencies {
  customers: CustomerSource;
  shipping: ShippingQuoter;
  fridge: FridgeSource;
  creation: OrderCreation;
  now: () => Date;
  newId: () => string;
  /** Sorteia o número "#LB" e 6 dígitos; a unicidade fica com o banco. */
  newNumber: () => string;
}

export interface CreateOrderInput {
  /** A conta do token: nunca vem do corpo. */
  ownerId: string;
  /** Valor do cabeçalho `Idempotency-Key`. */
  key: string;
  request: CriarPedidoRequest;
}

export interface CreateOrderResult {
  status: 201;
  body: PedidoCriado;
  /** Verdadeiro quando é a resposta guardada de uma chave já usada: nada foi criado agora. */
  replayed: boolean;
}

/** Hash do corpo sem o token do cartão, que nunca é guardado nem entra na comparação. */
function hashOf(request: CriarPedidoRequest): string {
  const canonical = JSON.stringify({
    enderecoId: request.enderecoId,
    pagamento: toPaymentRecord(request),
    totalVistoCentavos: request.totalVistoCentavos,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

/** Cria o pedido do cliente: tudo numa transação serializada por cliente, nesta ordem (checkout.md). */
export class CreateOrder {
  constructor(private readonly deps: CreateOrderDependencies) {}

  execute(input: CreateOrderInput): Promise<CreateOrderResult> {
    return this.deps.creation.run(input.ownerId, (unit) => this.create(unit, input));
  }

  private async create(unit: CreateOrderUnit, input: CreateOrderInput): Promise<CreateOrderResult> {
    const { ownerId, key, request } = input;
    const now = this.deps.now();

    // 1. Maioridade.
    const customer = await this.deps.customers.find(ownerId);
    if (!customer) throw new NotFoundError();
    if (customer.dataNascimento === null) throw new BirthDateRequiredError();
    if (!temMaioridade(customer.dataNascimento, now)) throw new UnderageError();

    // 2. Idempotência: a mesma chave e o mesmo corpo repetem a resposta; outro corpo é recusado.
    const hash = hashOf(request);
    const stored = await unit.findStoredResponse(key, now);
    if (stored) {
      if (stored.requestHash !== hash) throw new IdempotencyKeyReusedError();
      return { status: 201, body: stored.body, replayed: true };
    }

    // 3. Pedido pendente dentro da validade.
    const pendingId = await unit.findPendingOrderId(now);
    if (pendingId) throw new PendingOrderError(pendingId);

    // 4. Endereço do cliente e área de entrega (a área não depende do subtotal).
    const area = await this.deps.shipping.quote(ownerId, request.enderecoId, 0);
    if (!area.quote.naArea) throw new OutOfDeliveryAreaError();

    // 5. Geladeira revalidada.
    const { lines, adjustments } = await this.deps.fridge.revalidated(ownerId);
    if (lines.length === 0) throw new EmptyFridgeError();

    // 6. Totais com a regra compartilhada de frete; o total visto tem que bater.
    const subtotalCents = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
    const { shipTo, quote } = await this.deps.shipping.quote(
      ownerId,
      request.enderecoId,
      subtotalCents,
    );
    if (!quote.naArea) throw new OutOfDeliveryAreaError();
    const totalCents = subtotalCents + quote.freteCentavos;
    if (totalCents !== request.totalVistoCentavos) {
      throw new TotalChangedError(adjustments, totalCents);
    }

    // 7. Trava as cervejas em ordem fixa e confere a quantidade disponível de cada uma.
    const beerIds = lines.map((line) => line.beerId).sort();
    const available = await unit.lockAvailability(beerIds, now);
    const missing = lines.filter((line) => (available.get(line.beerId) ?? 0) < line.quantity);
    if (missing.length > 0) {
      throw new OutOfStockError(
        missing.map(({ beerId, name }) => ({ beerId, name })),
        adjustments,
      );
    }

    // 8 e 9. Pedido, cópias, reservas e baixas pendentes, com a chave e a resposta.
    const expiresAt = validoAte(now);
    const order: NewOrder = {
      id: this.deps.newId(),
      number: this.deps.newNumber(),
      ownerId,
      createdAt: now,
      expiresAt,
      payment: toPaymentRecord(request),
      customer: { nome: customer.nome, telefone: customer.telefone },
      shipTo,
      lines,
      subtotalCents,
      shippingCents: quote.freteCentavos,
      totalCents,
    };
    const body = toResponse(order);
    await unit.insert(order, { key, hash, response: body });
    return { status: 201, body, replayed: false };
  }
}

function toPaymentRecord(request: CriarPedidoRequest): PaymentRecord {
  const { pagamento } = request;
  return pagamento.tipo === "cartao"
    ? { tipo: "cartao", parcelas: pagamento.parcelas, bandeira: pagamento.bandeira }
    : { tipo: "pix" };
}

function toResponse(order: NewOrder): PedidoCriado {
  return {
    id: order.id,
    numero: order.number,
    status: "aguardando-pagamento",
    criadoEm: order.createdAt.toISOString(),
    validoAte: order.expiresAt.toISOString(),
    pagamento: order.payment,
    itens: order.lines.map((line) => ({
      cervejaId: line.beerId,
      nome: line.name,
      precoCentavos: line.priceCents,
      quantidade: line.quantity,
    })),
    subtotalCentavos: order.subtotalCents,
    freteCentavos: order.shippingCents,
    totalCentavos: order.totalCents,
  };
}
