import { NextResponse } from "next/server";

/**
 * Simple HTML check:
 * - loads only text (no JS, no images, no CSS)
 * - searches for typical "no results" patterns
 * - extremely fast and stable
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ found: false, error: "Missing URL" });
    }

    // Fetch settings (HTML only)
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
        "Accept": "text/html",
      },
      cache: "no-store",
      redirect: "follow",
    });

    const html = await res.text();
    const lower = html.toLowerCase();

    /* ---------------------------------------------------
       HEURISTIC: "Produkt wurde gefunden?"
       Wir suchen nach typisch eindeutigen Treffern:
       - Preisformat: CHF xx.xx
       - Price JSON (Digitec/Galaxus)
       - typische Produkt-Elemente
    ---------------------------------------------------- */

    const foundPatterns = [
      "chf",            // Preisangabe
      "fr.",            // Preis
      "product",        // generische Product-Class
      "price",          // Preisfeld
      `"price"`,        // JSON
      `"offers"`,       // JSON-LD
    ];

    let found = false;

    for (const p of foundPatterns) {
      if (lower.includes(p)) {
        found = true;
        break;
      }
    }

    /* ---------------------------------------------------
       NEGATIVE TREFFER (explizit kein Produkt gefunden)
    ---------------------------------------------------- */
    const noResultPatterns = [
      "keine produkte gefunden",
      "kein produkt gefunden",
      "0 ergebnisse",
      "no results",
      "no product",
      "did not match any products",
      "es wurden keine artikel gefunden",
    ];

    for (const p of noResultPatterns) {
      if (lower.includes(p)) {
        found = false;
      }
    }

    return NextResponse.json({
      found,
      checkedUrl: targetUrl,
    });
  } catch (err: any) {
    return NextResponse.json({
      found: false,
      error: err?.message ?? "unknown error",
    });
  }
}
