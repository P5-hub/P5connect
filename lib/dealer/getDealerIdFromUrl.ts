import { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Ermittelt die effektive dealer_id
 * Priorität:
 * 1️⃣ dealer_id aus URL (?dealer_id=123)
 * 2️⃣ dealer_id aus DealerContext
 */
export function getDealerIdFromUrl(
  searchParams: ReadonlyURLSearchParams | null,
  fallbackDealerId?: number | null
): number | null {
  if (searchParams) {
    const fromUrl = searchParams.get("dealer_id");
    if (fromUrl && !isNaN(Number(fromUrl))) {
      return Number(fromUrl);
    }
  }

  if (fallbackDealerId && !isNaN(Number(fallbackDealerId))) {
    return Number(fallbackDealerId);
  }

  return null;
}
