import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getISOWeek } from "@/utils/date";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiDealerContext(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { ctx } = auth;

    if (!ctx.effectiveDealerId) {
      return NextResponse.json(
        { error: "No effective dealer context found" },
        { status: 403 }
      );
    }

    const dealer_id = ctx.effectiveDealerId;

    const {
      cashback_type,
      cashback_betrag,
      seriennummer,
      seriennummer_sb,
      soundbar_ean,
    } = await req.json();

    if (!cashback_type || !cashback_betrag || !seriennummer) {
      return NextResponse.json(
        { error: "Ungültiger Cashback-Antrag" },
        { status: 400 }
      );
    }

    const now = new Date();
    const supabase = getSupabaseServer();

    const { data: submission, error: submissionError } = await (supabase as any)
      .from("submissions")
      .insert([
        {
          dealer_id,
          typ: "cashback",
          datum: now.toISOString().slice(0, 10),
          kw: getISOWeek(now),
          created_at: now.toISOString(),
        },
      ])
      .select()
      .single();

    if (submissionError) throw submissionError;

    const { error: claimError } = await (supabase as any)
      .from("cashback_claims")
      .insert([
        {
          submission_id: submission.submission_id,
          cashback_type,
          cashback_betrag,
          seriennummer,
          seriennummer_sb: seriennummer_sb || null,
          soundbar_ean: soundbar_ean || null,
          created_at: now.toISOString(),
        },
      ]);

    if (claimError) throw claimError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Cashback API Error:", err);
    return NextResponse.json(
      { error: "Serverfehler", details: err.message },
      { status: 500 }
    );
  }
}