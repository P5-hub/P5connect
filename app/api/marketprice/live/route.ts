import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ean = searchParams.get("ean");

  if (!ean) {
    return NextResponse.json({ error: "EAN missing" }, { status: 400 });
  }

  const url =
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}` +
    `/rest/v1/market_prices?product_ean=eq.${ean}`;

  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
    cache: "no-store",
  });

  const rows = await res.json();

  const shops: any = {};

  for (const r of rows) {
    shops[r.shop] = {
      price: r.price,
      sourceUrl: r.source_url,
      lastChecked: r.fetched_at,
    };
  }

  return NextResponse.json({ shops });
}
