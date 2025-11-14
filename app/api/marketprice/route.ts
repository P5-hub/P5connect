import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const shop = searchParams.get("shop");

  // 🔥 Akzeptiert alle möglichen Eingaben
  let ean =
    searchParams.get("ean") ||
    searchParams.get("product_ean") ||
    searchParams.get("id") ||
    null;

  if (ean) {
    ean = String(ean).trim();
  }

  if (!shop || !ean) {
    return NextResponse.json({
      price: null,
      sourceUrl: null,
      lastChecked: null,
      error: "Missing parameters",
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 🔥 WICHTIG: Immer String vergleichen
  const { data, error } = await supabase
    .from("market_prices")
    .select("*")
    .eq("shop", shop)
    .eq("product_ean", String(ean))
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({
      price: null,
      sourceUrl: null,
      lastChecked: null,
      error: error.message,
    });
  }

  if (!data) {
    return NextResponse.json({
      price: null,
      sourceUrl: null,
      lastChecked: null,
      error: "Keine Daten",
    });
  }

  return NextResponse.json({
    price: data.price ?? null,
    sourceUrl: data.source_url ?? null,
    lastChecked: data.fetched_at ?? null,
    error: null,
  });
}
