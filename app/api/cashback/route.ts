import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer"; // ✅ richtige Importquelle
import { getISOWeek } from "@/utils/date";

export async function POST(req: Request) {
  try {
    const {
      dealer_id,
      cashback_type,
      cashback_betrag,
      seriennummer,
      seriennummer_sb,
      soundbar_ean,
    } = await req.json();

    // ðŸ§  1. Eingabevalidierung
    if (!dealer_id || !cashback_type || !cashback_betrag || !seriennummer) {
      return NextResponse.json(
        { error: "Ungültiger Cashback-Antrag" },
        { status: 400 }
      );
    }

    const now = new Date();
    const supabase = getSupabaseServer();

    // ✅ 2. Submission-Eintrag
    // ✅ 2. Submission-Eintrag
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

    // ✅ 3. Cashback-Claim-Eintrag
    // ✅ 3. Cashback-Claim-Eintrag
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
          created_at: now.toISOString(), // ðŸ”¹ konsistentes Logging
        },
      ]);

    if (claimError) throw claimError;

    // ✅ 4. Erfolgsmeldung
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Cashback API Error:", err);
    return NextResponse.json(
      { error: "Serverfehler", details: err.message },
      { status: 500 }
    );
  }
}

