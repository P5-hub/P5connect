import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  let ean = searchParams.get("ean") || searchParams.get("id");

  // ❗ Immer als String erzwingen (wichtig!)
  if (ean) ean = String(ean).trim();

  if (!shop || !ean) {
    return NextResponse.json({
      price: null,
      sourceUrl: null,
      lastChecked: null,
      error: "Missing parameters",
    });
  }

  const { data, error } = await supabase
    .from("market_prices")
    .select("*")
    .eq("shop", shop)
    .eq("product_ean", ean) // EAN ist String → Matching funktioniert jetzt
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
