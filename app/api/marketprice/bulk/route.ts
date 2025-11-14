import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SHOPS = ["digitec", "mediamarkt", "interdiscount", "fnac", "brack", "fust"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ean = searchParams.get("ean");

  if (!ean) {
    return NextResponse.json({ error: "Missing EAN" });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Hole ALLE Preise für diese EAN
  const { data, error } = await supabase
    .from("market_prices")
    .select("*")
    .eq("product_ean", ean);

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  // Für jeden Shop den neusten Datensatz finden
  const shops: Record<
    string,
    { price: number | null; sourceUrl: string | null; lastChecked: string | null; error?: string }
  > = {};

  for (const shop of SHOPS) {
    const entries = data
      .filter((row) => row.shop === shop)
      .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime());

    if (entries.length > 0) {
      const row = entries[0];

      shops[shop] = {
        price: row.price,
        sourceUrl: row.source_url,
        lastChecked: row.fetched_at,
      };
    } else {
      shops[shop] = {
        price: null,
        sourceUrl: null,
        lastChecked: null,
        error: "Keine Daten",
      };
    }
  }

  return NextResponse.json({
    ean,
    shops,
  });
}
