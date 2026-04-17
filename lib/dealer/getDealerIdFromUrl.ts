import { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Ermittelt die effektive dealer_id im Client.
 *
 * NEUE LOGIK:
 * 1) dealer_id aus DealerContext / Fallback
 * 2) optional URL nur als Legacy-Fallback
 *
 * Empfehlung:
 * Langfristig dealer_id aus URL komplett entfernen.
 */
export function getDealerIdFromUrl(
  searchParams: ReadonlyURLSearchParams | null,
  fallbackDealerId?: number | null
): number | null {
  if (
    fallbackDealerId !== null &&
    fallbackDealerId !== undefined &&
    !isNaN(Number(fallbackDealerId))
  ) {
    return Number(fallbackDealerId);
  }

  // Legacy-Fallback
  if (searchParams) {
    const fromUrl = searchParams.get("dealer_id");
    if (fromUrl && !isNaN(Number(fromUrl))) {
      return Number(fromUrl);
    }
  }

  return null;
}