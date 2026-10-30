type HomeState = { hasSession: boolean; isGuest: boolean };

export function resolveHomeRoute({ hasSession, isGuest }: HomeState): "/" | "/boas-vindas" {
  return hasSession || isGuest ? "/" : "/boas-vindas";
}
