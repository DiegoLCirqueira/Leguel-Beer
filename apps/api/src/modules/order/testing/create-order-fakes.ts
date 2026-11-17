import type { AjusteDaGeladeira, CotacaoDeFrete } from "@leguele/shared";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type {
  CreateOrderUnit,
  CustomerSource,
  FridgeLine,
  FridgeSource,
  NewOrder,
  OrderCreation,
  OrderCustomer,
  ShipTo,
  ShippingQuoter,
  StoredResponse,
} from "../domain/create-order-ports.js";

export const ANA = "ana-id";

export const SHIP_TO: ShipTo = {
  zip: "57035000",
  street: "Rua do Sol",
  number: "100",
  complement: null,
  district: "Farol",
  city: "Maceió",
  state: "AL",
};

export class FakeCustomers implements CustomerSource {
  readonly customers = new Map<string, OrderCustomer>([
    [ANA, { nome: "Ana Souza", telefone: "82912345678", dataNascimento: "1992-03-15" }],
  ]);

  find(ownerId: string): Promise<OrderCustomer | null> {
    return Promise.resolve(this.customers.get(ownerId) ?? null);
  }
}

/** Frete fixo por endereço; `null` marca o endereço fora da área. Endereço desconhecido é de outro cliente. */
export class FakeShipping implements ShippingQuoter {
  readonly addresses = new Map<string, { shipTo: ShipTo; shippingCents: number | null }>([
    ["casa", { shipTo: SHIP_TO, shippingCents: 1_300 }],
    ["longe", { shipTo: SHIP_TO, shippingCents: null }],
  ]);
  freeFromCents = 15_000;
  constructor(private readonly customers: ReadonlyMap<string, unknown>) {}

  quote(ownerId: string, addressId: string, subtotalCents: number) {
    const address = this.addresses.get(addressId);
    if (!address || !this.customers.has(ownerId)) return Promise.reject(new NotFoundError());
    const quote: CotacaoDeFrete =
      address.shippingCents === null
        ? { naArea: false }
        : subtotalCents >= this.freeFromCents
          ? { naArea: true, freteCentavos: 0, gratis: true }
          : { naArea: true, freteCentavos: address.shippingCents, gratis: false };
    return Promise.resolve({ shipTo: address.shipTo, quote });
  }
}

export class FakeFridge implements FridgeSource {
  lines: FridgeLine[] = [
    { beerId: "mare-alta", name: "Maré Alta", priceCents: 4_500, quantity: 2 },
  ];
  adjustments: AjusteDaGeladeira[] = [];
  calls = 0;

  revalidated() {
    this.calls += 1;
    return Promise.resolve({ lines: this.lines, adjustments: this.adjustments });
  }
}

interface StoredKey {
  ownerId: string;
  key: string;
  hash: string;
  response: StoredResponse["body"];
  expiresAt: Date;
}

/** Banco em memória com transação por cópia: se o trabalho lançar, nada do que ele gravou fica. */
export class FakeOrderCreation implements OrderCreation {
  orders: NewOrder[] = [];
  keys: StoredKey[] = [];
  /** Quantidade disponível por cerveja; cerveja ausente não existe. */
  available = new Map<string, number>([["mare-alta", 10]]);
  lockedWith: string[][] = [];

  async run<T>(ownerId: string, work: (unit: CreateOrderUnit) => Promise<T>): Promise<T> {
    const snapshot = { orders: [...this.orders], keys: [...this.keys] };
    const unit: CreateOrderUnit = {
      findStoredResponse: (key, at) => {
        const found = this.keys.find(
          (stored) => stored.ownerId === ownerId && stored.key === key && stored.expiresAt > at,
        );
        return Promise.resolve(found ? { requestHash: found.hash, body: found.response } : null);
      },
      findPendingOrderId: (at) =>
        Promise.resolve(
          this.orders.find((order) => order.ownerId === ownerId && order.expiresAt > at)?.id ??
            null,
        ),
      lockAvailability: (beerIds) => {
        this.lockedWith.push([...beerIds]);
        return Promise.resolve(
          new Map(
            beerIds.flatMap((id) => {
              const available = this.available.get(id);
              return available === undefined ? [] : [[id, available] as const];
            }),
          ),
        );
      },
      insert: (order, idempotency) => {
        this.orders.push(order);
        this.keys.push({
          ownerId,
          key: idempotency.key,
          hash: idempotency.hash,
          response: idempotency.response,
          expiresAt: new Date(order.createdAt.getTime() + 24 * 60 * 60_000),
        });
        return Promise.resolve();
      },
    };
    try {
      return await work(unit);
    } catch (error) {
      this.orders = snapshot.orders;
      this.keys = snapshot.keys;
      throw error;
    }
  }
}
