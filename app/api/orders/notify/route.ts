import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { SubmissionRow } from "@/types/supabase-tables";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const body = await req.json();
    const { submissionId, newStatus } = body;

    if (!submissionId || !newStatus) {
      return NextResponse.json(
        { error: "submissionId oder newStatus fehlt" },
        { status: 400 }
      );
    }

    // 💡 Wir tippen das Update-Objekt manuell, um TS zu entlasten:
    const updateData = { status: newStatus } as Record<string, any>;


    // ✅ Saubere Update-Abfrage ohne Generics-Fehler
    const { error } = await supabase
      .from("submissions")
      .update(updateData)
      .eq("submission_id", Number(submissionId))
      .eq("typ", "bestellung");

    if (error) {
      console.error("❌ Supabase Update Error:", error);
      return NextResponse.json(
        { error: "Fehler beim Aktualisieren des Status", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Bestellung ${submissionId} → Status auf '${newStatus}' gesetzt.`);

    return NextResponse.json({
      success: true,
      message: `Status auf '${newStatus}' aktualisiert.`,
    });
  } catch (err: any) {
    console.error("❌ API Fehler:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Serverfehler" },
      { status: 500 }
    );
  }
}
