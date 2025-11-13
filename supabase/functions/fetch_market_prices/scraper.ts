// @ts-nocheck
import { JSDOM } from "https://esm.sh/jsdom@24";

export async function fetchHTML(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "de-CH,de;q=0.9",
    },
  });
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  return resp.text();
}

export function extractPrice(html: string): number | null {
  const dom = new JSDOM(html);
  const scripts = dom.window.document.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  for (const s of scripts) {
    try {
      const j = JSON.parse(s.textContent || "{}");
      if (j.offers?.price) return parse(j.offers.price);
      if (j.price) return parse(j.price);
      if (j.offers?.lowPrice) return parse(j.offers.lowPrice);
    } catch {}
  }

  // fallback
  let m = html.match(/"price":\s*"?([\d.,]+)"?/);
  if (m) return parse(m[1]);

  return null;
}

export function extractEAN(html: string): string | null {
  const m = html.match(/EAN[:\s]*([0-9]{8,14})/i);
  if (m) return m[1];
  return null;
}

function parse(v: any) {
  return parseFloat(String(v).replace(",", "."));
}
