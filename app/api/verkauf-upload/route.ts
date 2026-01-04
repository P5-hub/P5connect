  import { NextResponse } from "next/server";
  import { getSupabaseServer } from "@/utils/supabase/server";
  import type { Database } from "@/types/supabase";

  type SubmissionInsert =
    Database["public"]["Tables"]["submissions"]["Insert"];
  type SubmissionItemInsert =
    Database["public"]["Tables"]["submission_items"]["Insert"];

  // 🧩 Hilfsfunktion: Start- und Enddatum einer Kalenderwoche bestimmen
  function normalizeEAN(value: any): string | null {
    if (value === null || value === undefined) return null;

    // Zahl (Excel → Scientific Notation)
    if (typeof value === "number") {
      return value.toFixed(0);
    }

    let s = String(value).trim();

    // "4.54874E+12"
    if (s.includes("e") || s.includes("E")) {
      const n = Number(s);
      if (!isNaN(n)) return n.toFixed(0);
    }

    // ".0" entfernen
    if (s.endsWith(".0")) {
      s = s.slice(0, -2);
    }

    // Nur Ziffern behalten
    s = s.replace(/\D/g, "");

    return s || null;
  }


  function getWeekDateRange(year: number, week: number) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = new Date(simple);

    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

    return { start: ISOweekStart, end: ISOweekEnd };
  }

  export async function POST(req: Request) {
    const supabase = await getSupabaseServer();

    try {
      const body = await req.json();
  console.log("📥 RAW PAYLOAD");
  console.log(JSON.stringify(body, null, 2));

      // =====================================================
      // ✅ ROBUSTES MAPPING (ALT + NEU)
      // =====================================================

      const dealer_id =
        body.dealer_id ??
        body.dealer?.dealer_id ??
        null;

      const items = body.items ?? [];

      const calendar_week =
        body.calendar_week ??
        body.extra?.calendarWeek ??
        null;

      // 🔥 NEU: getrennte SONY-Anteile
      const sony_share_qty =
        body.sony_share_qty ??
        body.extra?.sonyShareQty ??
        body.extra?.inhouseQtyShare ??
        null;

      const sony_share_revenue =
        body.sony_share_revenue ??
        body.extra?.sonyShareRevenue ??
        body.extra?.inhouseRevenueShare ??
        null;

      const kommentar =
        body.kommentar ??
        body.comment ??
        null;

      // =====================================================
      // ❌ VALIDIERUNG
      // =====================================================

      if (!dealer_id) {
        return NextResponse.json(
          { error: "dealer_id fehlt" },
          { status: 400 }
        );
      }

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: "Keine Verkaufsdaten erhalten" },
          { status: 400 }
        );
      }

      // =====================================================
      // 📅 KALENDERWOCHE BERECHNEN
      // =====================================================

      const now = new Date();
      const year = now.getFullYear();

      const kw =
        calendar_week ??
        Math.ceil(
          ((now.getTime() - new Date(year, 0, 1).getTime()) /
            86400000 +
            new Date(year, 0, 1).getDay() +
            1) / 7
        );

      const { start, end } = getWeekDateRange(year, kw);

      const week_start = start.toISOString().slice(0, 10);
      const week_end = end.toISOString().slice(0, 10);

      // =====================================================
      // 1️⃣ SUBMISSION SPEICHERN
      // =====================================================

      const submissionInsert: SubmissionInsert = {
        dealer_id,
        typ: "verkauf",
        kommentar,
        calendar_week: kw,
        week_start,
        week_end,

        // 🔥 ENTSCHEIDEND
        sony_share_qty,
        sony_share_revenue,

        status: "approved", // ✅ CSV → direkt freigegeben

        created_at: new Date().toISOString(),
      };

      const { data: submission, error: subErr } = await supabase
        .from("submissions")
        .insert(submissionInsert)
        .select("submission_id")
        .single();

      if (subErr || !submission) {
        console.error("❌ Submission-Fehler:", subErr);
        return NextResponse.json(
          { error: "Fehler beim Erstellen der Submission" },
          { status: 500 }
        );
      }

      const submission_id = submission.submission_id;

      // =====================================================
      // 2️⃣ ITEMS SPEICHERN
      // =====================================================

      const cleanedItems: SubmissionItemInsert[] = items.map(
        (item: any) => ({
          submission_id,
          ean: normalizeEAN(item.ean),
          product_name: item.product_name ?? null,
          sony_article: item.sony_article ?? null,
          menge: Number(item.quantity ?? item.menge ?? 1),
          preis: item.price ?? item.preis ?? null,
          serial: item.serial ?? item.seriennummer ?? null,
          datum:
            item.date ??
            new Date().toISOString().slice(0, 10),
          comment: item.comment ?? null,
          created_at: new Date().toISOString(),
        })
      );


      const { error: itemErr } = await supabase
        .from("submission_items")
        .insert(cleanedItems);

      if (itemErr) {
        console.error("❌ Item-Fehler:", itemErr);
        return NextResponse.json(
          { error: "Fehler beim Speichern der Verkaufspositionen" },
          { status: 500 }
        );
      }

      // =====================================================
      // ✅ ERFOLG
      // =====================================================

      return NextResponse.json({
        success: true,
        submission_id,
        inserted: cleanedItems.length,
      });
    } catch (err: any) {
      console.error("❌ Verkauf Upload Fehler:", err);
      return NextResponse.json(
        { error: err?.message || "Serverfehler" },
        { status: 500 }
      );
    }
  }
