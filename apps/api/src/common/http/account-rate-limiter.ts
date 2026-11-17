export interface AccountRateLimitRule {
  /** Quantas chamadas cada conta pode fazer por janela. */
  limit: number;
  windowMs: number;
}

interface Window {
  startedAt: number;
  windowMs: number;
  count: number;
}

/**
 * Limite por conta (não por IP) em janela fixa, na memória da instância. Numa API serverless a
 * contagem vale por instância (mesma ressalva do limite global); protege a cota do serviço de mapas
 * sem criar credencial nem serviço novo.
 */
export class AccountRateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(private readonly now: () => number = Date.now) {}

  get size(): number {
    return this.windows.size;
  }

  /** Zera todas as contagens (usado pelos testes). */
  reset(): void {
    this.windows.clear();
  }

  /** Conta uma chamada e diz se ela pode seguir. Chamada recusada não gasta cota. */
  allow(group: string, accountId: string, rule: AccountRateLimitRule): boolean {
    const now = this.now();
    this.sweep(now);
    const key = `${group}:${accountId}`;
    const current = this.windows.get(key);
    if (!current || now - current.startedAt >= rule.windowMs) {
      this.windows.set(key, { startedAt: now, windowMs: rule.windowMs, count: 1 });
      return true;
    }
    if (current.count >= rule.limit) return false;
    current.count += 1;
    return true;
  }

  private sweep(now: number): void {
    for (const [key, window] of this.windows) {
      if (now - window.startedAt >= window.windowMs) this.windows.delete(key);
    }
  }
}
