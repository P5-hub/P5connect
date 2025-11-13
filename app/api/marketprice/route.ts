import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { fetchHTML, extractPrice, extractEAN } from "./fetcher";

const SHOPS: Record<string, string> = {
  digitec: "https://www.digitec.ch/de/product/",
  mediamarkt: "https://www.mediamarkt.ch/de/product/_",
  interdiscount: "https://www.interdiscount.ch/de/product/",
  fnac: "https://www.fnac.ch/a",
  brack: "https://www.brack.ch/",
  fust: "https://www.fust.ch/de/p/",
};

export async function GET(req: Request) {
  try {
    const urlParams = new URL(req.url);
    const shop = urlParams.searchParams.get("shop");
    const externalId = urlParams.searchParams.get("id");

    if (!shop || !externalId) {
      return NextResponse.json({ error: "Missing shop or id" }, { status: 400 });
    }

    const base = SHOPS[shop];
    if (!base) {
      return NextResponse.json({ error: "Unknown shop" }, { status: 400 });
    }

    // Build full product URL
    const productUrl =
      shop === "mediamarkt"
        ? `${base}${externalId}.html`
        : `${base}${externalId}`;

    // Load server-side supabase
    const supabase = await getSupabaseServer();

    // -----------------------------------------
    // 1) First, try cache
    // -----------------------------------------
    const SIX_HOURS = 1000 * 60 * 60 * 6;

    const { data: cached } = await supabase
      .from("market_prices")
      .select("*")
      .eq("shop", shop)
      .eq("source_url", productUrl)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached?.fetched_at) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < SIX_HOURS) {
        return NextResponse.json({
          shop,
          externalId,
          price: cached.price,
          currency: cached.currency,
          product_id: cached.product_id,
          sourceUrl: cached.source_url,
          lastChecked: cached.fetched_at,
          fromCache: true,
        });
      }
    }

    // -----------------------------------------
    // 2) Download HTML & extract data
    // -----------------------------------------
    const html = await fetchHTML(productUrl);

    const price = extractPrice(html);
    const ean = extractEAN(html);

    if (!ean) {
      return NextResponse.json(
        {
          shop,
          externalId,
          price: null,
          ean: null,
          error: "EAN not found on page",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 3) Match product in your products table
    // -----------------------------------------
    const { data: product } = await supabase
      .from("products")
      .select("product_id, product_name")
      .eq("ean", ean)
      .maybeSingle();

    let internalProductId = product?.product_id ?? null;

    // -----------------------------------------
    // (optional) auto-create products if desired
    // if (!internalProductId) {
    //   const { data: newProd } = await supabase
    //     .from("products")
    //     .insert({ ean, product_name: "Auto-imported product" })
    //     .select("product_id")
    //     .maybeSingle();
    //
    //   internalProductId = newProd?.product_id;
    // }
    // -----------------------------------------

    // Save cache entry
    await supabase.from("market_prices").upsert(
      {
        shop,
        product_id: internalProductId ? String(internalProductId) : ean, // immer string
        product_ean: ean,
        price,
        source_url: productUrl,
        fetched_at: new Date().toISOString(),
      },
      {
        onConflict: "shop,product_ean",
      }
    );



    return NextResponse.json({
      shop,
      externalId,
      price,
      currency: "CHF",
      ean,
      product_id: internalProductId,
      product_name: product?.product_name ?? null,
      sourceUrl: productUrl,
      lastChecked: new Date().toISOString(),
      fromCache: false,
    });
  } catch (err) {
    console.error("marketprice-error", err);
    return NextResponse.json(
      { error: "Internal error", detail: String(err) },
      { status: 500 }
    );
  }
}
