import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";

type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];
type SubmissionItemInsert = Database["public"]["Tables"]["submission_items"]["Insert"];

// 🧩 Hilfsfunktion: Start- und Enddatum einer Kalenderwoche bestimmen
function getWeekDateRange(year: number, week: number) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = new Date(simple);
  if (dow <= 4)
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  const ISOweekEnd = new Date(ISOweekStart);
  ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
  return { start: ISOweekStart, end: ISOweekEnd };
}

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();

  try {
    const body = await req.json();
    const { dealer_id, items, sony_share, kommentar, calendar_week } = body;

    if (!dealer_id) {
      return NextResponse.json({ error: "dealer_id fehlt" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keine Verkaufsdaten erhalten" }, { status: 400 });
    }

    // 📅 Kalenderwoche zu Datumsbereich konvertieren
    const now = new Date();
    const year = now.getFullYear();
    const kw =
      calendar_week ||
      Math.ceil(
        ((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 +
          new Date(year, 0, 1).getDay() +
          1) / 7
      );
    const { start, end } = getWeekDateRange(year, kw);
    const week_start = start.toISOString().slice(0, 10);
    const week_end = end.toISOString().slice(0, 10);

    console.log(`📆 KW ${kw} (${week_start} – ${week_end}) | Dealer ${dealer_id}`);

    // 1️⃣ Submission anlegen
    const submissionInsert: SubmissionInsert = {
      dealer_id,
      typ: "order", // 👈 laut Supabase Enum (z. B. "verkauf", "order", etc.)
      kommentar: kommentar || null,
      sony_share: sony_share ?? 100,
      calendar_week: kw,
      week_start,
      week_end,
      created_at: new Date().toISOString(),
    };

    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .insert([submissionInsert])
      .select("submission_id")
      .single();

    if (subErr) {
      console.error("❌ Fehler beim Erstellen der Submission:", subErr);
      return NextResponse.json(
        { error: "Fehler beim Erstellen der Submission", details: subErr.message },
        { status: 500 }
      );
    }

    const submission_id = submission?.submission_id;
    console.log(`✅ Submission ${submission_id} erstellt.`);

    // 2️⃣ Items vorbereiten
    const cleanedItems: SubmissionItemInsert[] = items.map((item: any) => ({
      submission_id,
      ean: item.ean || item.barcode || null,
      product_name: item.product_name || null,
      sony_article: item.sony_article || null,
      menge: parseInt(item.menge || item.quantity || 1, 10),
      preis: parseFloat(item.price || 0),
      serial: item.serial || null,
      datum: item.date || new Date().toISOString().split("T")[0],
      comment: item.comment || null,
      created_at: new Date().toISOString(),
    }));

    // 3️⃣ Items speichern
    const { data, error } = await supabase
      .from("submission_items")
      .insert(cleanedItems)
      .select("item_id");

    if (error) {
      console.error("❌ Fehler beim Speichern der Verkaufsdaten:", error);
      return NextResponse.json(
        { error: "Fehler beim Speichern der Verkaufsdaten", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${data.length} Verkaufszeilen erfolgreich gespeichert.`);

    return NextResponse.json({
      success: true,
      inserted: data.length,
      submission_id,
      calendar_week: kw,
      week_start,
      week_end,
      message: `${data.length} Verkaufszeilen gespeichert.`,
    });
  } catch (err: any) {
    console.error("❌ API Fehler:", err);
    return NextResponse.json(
      { error: err?.message || "Unbekannter Serverfehler" },
      { status: 500 }
    );
  }
}
