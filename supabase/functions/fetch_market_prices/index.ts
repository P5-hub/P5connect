// @ts-nocheck
// supabase/functions/fetch_market_prices/index.ts
import { fetchHTML, extractEAN, extractPrice } from "./scraper.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SHOPS: Record<string, string> = {
  digitec: "https://www.digitec.ch/de/product/",
  mediamarkt: "https://www.mediamarkt.ch/de/product/_",
  interdiscount: "https://www.interdiscount.ch/de/product/",
  fnac: "https://www.fnac.ch/a",
  brack: "https://www.brack.ch/",
  fust: "https://www.fust.ch/de/p/",
};

Deno.serve(async () => {
  console.log("Starting full market price refresh…");

  // 1) Alle Produkte holen, die eine EAN haben
  const { data: products } = await supabase
    .from("products")
    .select("product_id, product_name, ean")
    .not("ean", "is", null);

  if (!products || products.length === 0)
    return new Response("No products with EAN found");

  let updatedCount = 0;

  // 2) Für jedes Produkt → alle Shops durchscrapen
  for (const p of products) {
    const ean = p.ean?.toString();

    for (const [shop, base] of Object.entries(SHOPS)) {
      try {
        const productUrl =
          shop === "mediamarkt" ? `${base}${ean}.html` : `${base}${ean}`;

        const html = await fetchHTML(productUrl);
        const price = extractPrice(html) ?? null;

        await supabase.from("market_prices").insert({
          shop,
          product_id: p.product_id,
          product_ean: ean,
          price,
          currency: "CHF",
          source_url: productUrl,
        });

        updatedCount++;
      } catch (e) {
        console.warn(`Failed for ${shop} / ${ean}`, e);
      }
    }
  }

  return new Response(`Market price refresh completed: ${updatedCount} entries`);
});
