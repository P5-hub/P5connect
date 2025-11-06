import { NextResponse } from "next/server";

const DIGITEC_API = "https://www.digitec.ch/api/v4/products/";
const MEDIAMARKT_PRODUCT_BASE = "https://www.mediamarkt.ch/de/product/_";
const INTERDISCOUNT_BASE = "https://www.interdiscount.ch/de/product/";
const FNAC_PRODUCT_BASE = "https://www.fnac.ch/a";
const BRACK_BASE = "https://www.brack.ch/";
const FUST_BASE = "https://www.fust.ch/de/p/";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const id = searchParams.get("id");

  if (!shop || !id) {
    return NextResponse.json({ error: "Missing shop or id" }, { status: 400 });
  }

  try {
    let price: number | null = null;
    let currency = "CHF";
    let sourceUrl = "";

    if (shop === "digitec") {
      const resp = await fetch(`${DIGITEC_API}${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 21600 }, // 6h Cache
      });
      if (resp.ok) {
        const json = await resp.json();
        price = json?.price?.amount ?? null;
      }
      sourceUrl = `https://www.digitec.ch/de/product/${id}`;
    }

    else if (shop === "mediamarkt") {
      const resp = await fetch(`${MEDIAMARKT_PRODUCT_BASE}${id}.html`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 43200 },
      });
      const html = await resp.text();
      const m = html.match(/"price":\s*"([\d.]+)"/);
      if (m) price = parseFloat(m[1]);
      sourceUrl = `${MEDIAMARKT_PRODUCT_BASE}${id}.html`;
    }

    else if (shop === "interdiscount") {
      const resp = await fetch(`${INTERDISCOUNT_BASE}${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 43200 },
      });
      const html = await resp.text();
      const m = html.match(/itemprop="price" content="([\d.]+)"/)
             || html.match(/"price":\s*"([\d.]+)"/);
      if (m) price = parseFloat(m[1]);
      sourceUrl = `${INTERDISCOUNT_BASE}${id}`;
    }

    else if (shop === "fnac") {
      const resp = await fetch(`${FNAC_PRODUCT_BASE}${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 43200 },
      });
      const html = await resp.text();
      const m = html.match(/"price":\s*([\d.,]+)/) || html.match(/"offerPrice":\s*"([\d.,]+)"/);
      if (m) price = parseFloat(m[1].replace(",", "."));
      sourceUrl = `${FNAC_PRODUCT_BASE}${id}`;
    }

    else if (shop === "brack") {
      const resp = await fetch(`${BRACK_BASE}${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 43200 },
      });
      const html = await resp.text();
      const m = html.match(/itemprop="price" content="([\d.]+)"/)
             || html.match(/"price":\s*"([\d.]+)"/);
      if (m) price = parseFloat(m[1]);
      sourceUrl = `${BRACK_BASE}${id}`;
    }

    else if (shop === "fust") {
      const resp = await fetch(`${FUST_BASE}${id}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 43200 },
      });
      const html = await resp.text();
      const m = html.match(/itemprop="price" content="([\d.]+)"/)
             || html.match(/"price":\s*"([\d.]+)"/);
      if (m) price = parseFloat(m[1]);
      sourceUrl = `${FUST_BASE}${id}`;
    }

    if (!price) {
      return NextResponse.json(
        { shop, id, price: null, note: "Preis nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shop,
      id,
      price,
      currency,
      sourceUrl,
      lastChecked: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Preis-API Fehler:", err);
    return NextResponse.json(
      { shop, id, price: null, error: "Fetch failed" },
      { status: 500 }
    );
  }
}
