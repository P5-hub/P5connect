import { JSDOM } from "jsdom";

export async function fetchHTML(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "de-CH,de;q=0.9",
    },
    cache: "no-store",
  });

  if (!resp.ok) throw new Error("HTTP " + resp.status);
  return resp.text();
}

// --------------------------------------------------
// Extract Price
// --------------------------------------------------

export function extractPrice(html: string): number | null {
  const jsonld = extractJSONLD(html);

  // JSON-LD first
  if (jsonld?.price) return parse(jsonld.price);
  if (jsonld?.offers?.price) return parse(jsonld.offers.price);
  if (jsonld?.offers?.lowPrice) return parse(jsonld.offers.lowPrice);

  // Fallback regex
  let m = html.match(/"price":\s*"?([\d.,]+)"?/);
  if (m) return parse(m[1]);

  m = html.match(/itemprop="price" content="([\d.,]+)"/);
  if (m) return parse(m[1]);

  return null;
}

function parse(v: any): number {
  return parseFloat(String(v).replace(",", "."));
}

// --------------------------------------------------
// Extract EAN / GTIN
// --------------------------------------------------

export function extractEAN(html: string): string | null {
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  // JSON-LD candidates
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent || "{}");

      const candidates = [
        json.gtin,
        json.gtin13,
        json.ean,
        json.offers?.itemOffered?.gtin,
        json.productID,
      ];

      for (const c of candidates) {
        if (c && /^\d{8,14}$/.test(String(c))) return String(c);
      }
    } catch {}
  }

  // HTML fallback
  let m = html.match(/EAN[:\s]*([0-9]{8,14})/i);
  if (m) return m[1];

  m = html.match(/GTIN[:\s]*([0-9]{8,14})/i);
  if (m) return m[1];

  return null;
}

// --------------------------------------------------
// JSON-LD parser
// --------------------------------------------------

function extractJSONLD(html: string): any | null {
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  for (const script of scripts) {
    try {
      return JSON.parse(script.textContent || "{}");
    } catch {}
  }

  return null;
}
