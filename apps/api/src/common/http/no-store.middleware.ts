import type { NextFunction, Request, Response } from "express";

/** O navegador nunca reaproveita uma resposta do admin (contadores, estoque e pedidos mudam o tempo todo). */
export function noStoreMiddleware(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Cache-Control", "no-store");
  next();
}
