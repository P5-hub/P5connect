import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";
import type { Database } from "@/types/supabase";

type SubmissionInsert =
  Database["public"]["Tables"]["submissions"]["Insert"];

type SubmissionItemInsert =
  Database["public"]["Tables"]["submission_items"]["Insert"];

export async function POST(req: NextRequest) {
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

  const supabase = await getSupabaseServer();

  // --------------------------------------------------
  // 🔐 AUTH
  // --------------------------------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
  }

  // --------------------------------------------------
  // 📥 BODY
  // --------------------------------------------------
  const body = await req.json();

  const rows = Array.isArray(body.rows) ? body.rows : [];

  const calendar_week =
    Number.isInteger(body.calendar_week) && body.calendar_week > 0
      ? body.calendar_week
      : null;

  if (!dealer_id || !calendar_week || rows.length === 0) {
    return NextResponse.json(
      { error: "Ungültige CSV-Daten." },
      { status: 400 }
    );
  }

  // --------------------------------------------------
  // ✅ VALIDIERUNG SONY-ANTEILE (PROZENT)
  // --------------------------------------------------
  const sony_share_qty = Number(body.inhouse_share_qty ?? 0);
  const sony_share_revenue = Number(body.inhouse_share_revenue ?? 0);

  if (sony_share_qty <= 0 || sony_share_qty > 100) {
    return NextResponse.json(
      { error: "Ungültiger SONY Anteil Stück (1–100 %)" },
      { status: 400 }
    );
  }
  if (sony_share_revenue <= 0 || sony_share_revenue > 100) {
    return NextResponse.json(
      { error: "Ungültiger SONY Anteil Umsatz (1–100 %)" },
      { status: 400 }
    );
  }

  // --------------------------------------------------
  // 🧮 AGGREGATION (CSV enthält NUR SONY Sell-out)
  // --------------------------------------------------
  let sony_qty = 0;
  let sony_revenue = 0;

  rows.forEach((r: any) => {
    const qty = Number(r.quantity ?? 0);
    const price = Number(r.price ?? 0);
    sony_qty += qty;
    sony_revenue += qty * price;
  });

  // Händler TOTAL aus SONY-Anteil berechnen (wie im PDF)
  const dealer_total_qty = sony_qty / (sony_share_qty / 100);
  const dealer_total_revenue = sony_revenue / (sony_share_revenue / 100);

  // Optional: Non-Sony Anteil (falls du ihn irgendwo brauchst)
  const inhouse_qty = dealer_total_qty - sony_qty;
  const inhouse_revenue = dealer_total_revenue - sony_revenue;

  // Werte bewusst berechnet, auch wenn sie aktuell nicht direkt gespeichert werden
  void inhouse_qty;
  void inhouse_revenue;

  // --------------------------------------------------
  // 1️⃣ SUBMISSION (Workflow / Dashboard)
  // --------------------------------------------------
  const submissionInsert: SubmissionInsert = {
    dealer_id,
    typ: "verkauf",
    status: "approved",
    source: "csv",
    calendar_week,
    sony_share_qty: sony_share_qty,
    sony_share_revenue: sony_share_revenue,
  };

  const { data: submission, error: subErr } = await supabase
    .from("submissions")
    .insert(submissionInsert)
    .select("submission_id")
    .single();

  if (subErr || !submission) {
    return NextResponse.json(
      { error: subErr?.message ?? "Submission konnte nicht erstellt werden." },
      { status: 500 }
    );
  }

  // --------------------------------------------------
  // 2️⃣ SUBMISSION ITEMS (❗ zentral für bestehende Logik)
  // --------------------------------------------------
  const submissionItems: SubmissionItemInsert[] = rows.map((r: any) => ({
    submission_id: submission.submission_id,
    ean: String(r.ean ?? ""),
    product_name: String(r.product_name ?? ""),
    menge: Number(r.quantity ?? 0),
    preis: Number(r.price ?? 0),
    serial: r.seriennummer ?? null,
    datum: r.date ?? null,
    comment: r.comment ?? null,
    source: "csv",
  }));

  const { error: subItemErr } = await supabase
    .from("submission_items")
    .insert(submissionItems);

  if (subItemErr) {
    return NextResponse.json(
      { error: subItemErr.message ?? "submission_items fehlgeschlagen." },
      { status: 500 }
    );
  }

  // --------------------------------------------------
  // 3️⃣ CSV MELDUNG (Aggregation / Reporting)
  // --------------------------------------------------
  const { data: meldung, error: meldungErr } = await supabase
    .from("verkauf_csv_meldungen")
    .insert({
      dealer_id,
      calendar_week,

      // (Spaltennamen sind bei dir unglücklich, aber Inhalt = Prozent)
      inhouse_share_qty: sony_share_qty,
      inhouse_share_revenue: sony_share_revenue,

      // SONY absolute Werte aus CSV
      sony_qty,
      sony_revenue,

      // Händler TOTAL (wie im PDF)
      total_qty: dealer_total_qty,
      total_revenue: dealer_total_revenue,
    })
    .select("id")
    .single();

  if (meldungErr || !meldung) {
    return NextResponse.json(
      { error: meldungErr?.message ?? "CSV-Meldung fehlgeschlagen." },
      { status: 500 }
    );
  }

  // --------------------------------------------------
  // 4️⃣ CSV ITEMS (Audit / Rohdaten)
  // --------------------------------------------------
  const csvItems = rows.map((r: any) => {
    const qty = Number(r.quantity ?? 0);
    const price = Number(r.price ?? 0);

    return {
      meldung_id: meldung.id,
      ean: String(r.ean ?? ""),
      product_name: String(r.product_name ?? ""),
      quantity: qty,
      price,
      revenue: qty * price,
      datum: r.date ?? null,
      seriennummer: r.seriennummer ?? null,
      kommentar: r.comment ?? null,
    };
  });

  const { error: csvItemErr } = await supabase
    .from("verkauf_csv_items")
    .insert(csvItems);

  if (csvItemErr) {
    return NextResponse.json(
      { error: csvItemErr.message ?? "verkauf_csv_items fehlgeschlagen." },
      { status: 500 }
    );
  }

  // --------------------------------------------------
  // ✅ SUCCESS
  // --------------------------------------------------
  return NextResponse.json({
    success: true,
    submission_id: submission.submission_id,
    csv_meldung_id: meldung.id,
    submission_items: submissionItems.length,
    csv_items: csvItems.length,
  });
}