/** Fora da área: sem rota até a cervejaria ou além do raio máximo (o raio é inclusive). */
export function isOutsideDeliveryArea(
  distanceMeters: number | null,
  maxRadiusMeters: number,
): boolean {
  return distanceMeters === null || distanceMeters > maxRadiusMeters;
}
