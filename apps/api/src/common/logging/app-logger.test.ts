import { afterEach, describe, expect, it, vi } from "vitest";
import { AppLogger } from "./app-logger.js";

describe("AppLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("escreve uma linha JSON com nível, mensagem e contexto", () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);

    new AppLogger().info("servidor no ar", { port: 3333 });

    const line = JSON.parse(String(write.mock.calls[0]?.[0]));
    expect(line).toMatchObject({ level: "info", message: "servidor no ar", port: 3333 });
    expect(typeof line.time).toBe("string");
  });

  it("escreve erros no stderr", () => {
    const write = vi.spyOn(process.stderr, "write").mockReturnValue(true);

    new AppLogger().error("falhou", { requestId: "abc" });

    expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toMatchObject({
      level: "error",
      requestId: "abc",
    });
  });

  it("atende a interface de logger do Nest (log e warn viram info)", () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    const logger = new AppLogger();

    logger.log("a", "Contexto");
    logger.warn("b");

    expect(JSON.parse(String(write.mock.calls[0]?.[0]))).toMatchObject({
      level: "info",
      message: "a",
      context: "Contexto",
    });
    expect(write).toHaveBeenCalledTimes(2);
  });
});
