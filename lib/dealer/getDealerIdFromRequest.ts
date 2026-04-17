import { NextRequest } from "next/server";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

/**
 * Ermittelt die effektive dealer_id serverseitig
 * ausschließlich über den zentralen DealerContext.
 *
 * Verwende für neue APIs am besten direkt getApiDealerContext(req).
 */
export async function getDealerIdFromRequest(
  req: NextRequest
): Promise<number | null> {
  const auth = await getApiDealerContext(req);

  if (!auth.ok) {
    return null;
  }

  return auth.ctx.effectiveDealerId ?? null;
}