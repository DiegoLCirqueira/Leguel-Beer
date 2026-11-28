import type { ResumoDoAdmin } from "@leguele/shared";
import type { AdminSummaryReader } from "../domain/admin-summary-reader.js";

/** Os alertas do início do admin. */
export class GetAdminSummary {
  constructor(
    private readonly reader: AdminSummaryReader,
    private readonly now: () => Date,
  ) {}

  async execute(): Promise<ResumoDoAdmin> {
    const summary = await this.reader.read(this.now());
    return {
      cervejasComEstoqueBaixo: summary.lowStockBeers,
      pedidosPagosAguardandoPreparo: summary.paidOrdersAwaitingPreparation,
    };
  }
}
