import type { INestApplication } from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";

export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function createServerlessHandler(_create: () => Promise<INestApplication>): RequestHandler {
  return async (_req, res) => {
    res.statusCode = 501;
    res.end();
  };
}
