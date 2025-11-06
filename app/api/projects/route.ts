// @ts-nocheck
import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";
import { getISOWeek } from "@/utils/date";
import { Database } from "@/types/supabase";

// POST /api/projects
export async function POST(req: Request) {
  try {
    const { dealer_id, items, kommentar } = await req.json();

    if (!dealer_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Ungültige Projektanfrage" },
        { status: 400 }
      );
    }

    const now = new Date();

    // ✅ Supabase-Client direkt verwenden
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert([
        {
          dealer_id,
          typ: "projekt",
          datum: now.toISOString().slice(0, 10),
          kw: getISOWeek(now),
          kommentar: kommentar || null,
          bestellweg: "online",
          created_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (submissionError) throw submissionError;

    const itemsToInsert = items.map(
      (item: any): Database["public"]["Tables"]["submission_items"]["Insert"] => ({
        submission_id: (submission as any).submission_id,
        product_id: item.product_id,
        ean: item.ean,
        menge: item.quantity,
        preis: item.price,
        created_at: now.toISOString(),
      })
    );

    const { error: itemsError } = await supabase
      .from("submission_items")
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Project API Error:", err);
    return NextResponse.json(
      { error: "Serverfehler", details: err.message },
      { status: 500 }
    );
  }
}
