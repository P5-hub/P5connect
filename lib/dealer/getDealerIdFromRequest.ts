import { NextRequest } from "next/server";

/**
 * Ermittelt die dealer_id serverseitig
 *
 * Priorität:
 * 1️⃣ dealer_id aus URL (?dealer_id=123)
 * 2️⃣ dealer_id aus Body (body.dealer_id)
 * 3️⃣ dealer_id aus Body-Objekt (body.dealer.dealer_id)
 */
export async function getDealerIdFromRequest(
  req: NextRequest
): Promise<number | null> {
  // --------------------------------------------------
  // 1️⃣ dealer_id aus URL
  // --------------------------------------------------
  const url = new URL(req.url);
  const fromUrl = url.searchParams.get("dealer_id");

  if (fromUrl && !isNaN(Number(fromUrl))) {
    return Number(fromUrl);
  }

  // --------------------------------------------------
  // 2️⃣ dealer_id aus Body
  // --------------------------------------------------
  try {
    const contentType = req.headers.get("content-type") || "";

    let body: any = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const payload = form.get("payload");
      if (typeof payload === "string") {
        body = JSON.parse(payload);
      }
    } else if (contentType.includes("application/json")) {
      body = await req.json();
    }

    const fromBody =
      body?.dealer_id ??
      body?.dealer?.dealer_id ??
      null;

    if (fromBody && !isNaN(Number(fromBody))) {
      return Number(fromBody);
    }
  } catch {
    // bewusst leer – wir fallen einfach durch
  }

  return null;
}
