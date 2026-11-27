export const DEFAULT_WEB_ORIGIN = "http://localhost:3000";

export function resolveWebOrigin(_env: Record<string, string | undefined>): string {
  return DEFAULT_WEB_ORIGIN;
}
