// Medidas da arte da tela de boas-vindas (Imagens/figma/telas/01-login-original-850x1850.png, 850 x 1850),
// recortada em X0/Y0 para tirar a barra de status e os cantos do mockup. Valores em px da arte original.
export const ART = { x0: 16, y0: 80, width: 818, height: 1765 } as const;

export type ArtRect = { x: number; y: number; w: number; h: number };

// Controles desenhados no Figma (a arte do site vai sem eles; os reais ficam por cima, nestas posições).
export const CONTROLS = {
  enter: { x: 92, y: 1407, w: 667, h: 87 },
  signUp: { x: 92, y: 1515, w: 667, h: 84 },
  guest: { x: 205, y: 1664, w: 441, h: 60 },
  checkbox: { x: 305, y: 1757, w: 26, h: 25 },
} satisfies Record<string, ArtRect>;

export const OR_ROW = {
  centerY: 1631,
  left: { x: 205, w: 190 },
  right: { x: 457, w: 188 },
} as const;

export const pctX = (x: number) => `${(((x - ART.x0) / ART.width) * 100).toFixed(3)}%`;
export const pctY = (y: number) => `${(((y - ART.y0) / ART.height) * 100).toFixed(3)}%`;
export const pctW = (w: number) => `${((w / ART.width) * 100).toFixed(3)}%`;
export const pctH = (h: number) => `${((h / ART.height) * 100).toFixed(3)}%`;
// Unidade proporcional à largura do palco (container query): escala fontes e ícones com a arte.
export const cq = (px: number) => `${((px / ART.width) * 100).toFixed(3)}cqw`;

export function rectStyle(rect: ArtRect) {
  return { left: pctX(rect.x), top: pctY(rect.y), width: pctW(rect.w), height: pctH(rect.h) };
}
