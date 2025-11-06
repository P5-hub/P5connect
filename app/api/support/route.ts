// @ts-nocheck
import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import { getISOWeek } from "@/utils/date";

// POST /api/support
export async function POST(req: Request) {
  try {
    const { dealer_id, item, support_amount, kommentar } = await req.json();

    if (!dealer_id || !item || !support_amount) {
      return NextResponse.json(
        { error: "Ungültige Support-Anfrage" },
        { status: 400 }
      );
    }

    const now = new Date();

    const { error: insertError } = await supabase
      .from("support_requests")
      .insert([
        {
          dealer_id,
          product_id: item.product_id ?? null,
          ean: item.ean ?? null,
          betrag: support_amount,
          kommentar: kommentar ?? null,
          datum: now.toISOString().slice(0, 10),
          kw: getISOWeek(now),
          created_at: now.toISOString(),
        },
      ]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Support API Error:", err);
    return NextResponse.json(
      { error: "Serverfehler", details: err.message },
      { status: 500 }
    );
  }
}
