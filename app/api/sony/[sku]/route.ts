import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import { scrapeAndCacheSony } from "@/lib/sonyScraper";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sku = searchParams.get("sku");

    if (!sku) {
      return NextResponse.json({ error: "SKU fehlt" }, { status: 400 });
    }

    // 1️⃣ Cache prüfen
    const { data, error } = await supabase
      .from("sony_product_data")
      .select("*")
      .eq("sku", sku)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (data) return NextResponse.json({ source: "cache", data });

    // 2️⃣ Scrapen & speichern
    const scraped = await scrapeAndCacheSony(sku);
    return NextResponse.json({ source: "scraped", data: scraped });
  } catch (err: any) {
    console.error("❌ Sony API Error:", err);
    return NextResponse.json(
      { error: "Serverfehler", details: err.message },
      { status: 500 }
    );
  }
}
