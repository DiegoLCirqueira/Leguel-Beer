import { Injectable } from "@nestjs/common";

type LogContext = Record<string, unknown>;

@Injectable()
export class AppLogger {
  info(message: string, context: LogContext = {}): void {
    this.write("info", message, context);
  }

  error(message: string, context: LogContext = {}): void {
    this.write("error", message, context);
  }

  private write(level: "info" | "error", message: string, context: LogContext): void {
    const line = JSON.stringify({ level, time: new Date().toISOString(), message, ...context });
    (level === "error" ? process.stderr : process.stdout).write(`${line}\n`);
  }
}
