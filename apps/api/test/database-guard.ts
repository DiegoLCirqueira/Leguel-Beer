function identity(url: string): string {
  const { hostname, port, pathname } = new URL(url);
  return `${hostname}:${port || "5432"}${pathname}`;
}

/** Protege o banco de desenvolvimento: o banco de teste termina em _test e nunca é o das variáveis da aplicação. */
export function assertTestDatabase(testUrl: string, developmentUrls: (string | undefined)[]): void {
  const database = new URL(testUrl).pathname.slice(1);
  if (!database.endsWith("_test"))
    throw new Error(`O banco de teste deve terminar em _test, veio "${database}"`);

  for (const url of developmentUrls) {
    if (url && identity(url) === identity(testUrl))
      throw new Error(
        "TEST_DATABASE_URL aponta para o mesmo banco de DATABASE_URL; use um banco separado, como leguele_test",
      );
  }
}
