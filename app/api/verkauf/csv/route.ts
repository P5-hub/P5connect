// app/api/verkauf/csv/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import type { Database } from "@/types/supabase";

type SubmissionInsert =
  Database["public"]["Tables"]["submissions"]["Insert"];
type SubmissionItemInsert =
  Database["public"]["Tables"]["submission_items"]["Insert"];

export async function POST(req: Request) {
  const supabase = await getSupabaseServer();

  // --------------------------------------------------
  // 🔐 AUTH
  // --------------------------------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  // --------------------------------------------------
  // 📥 BODY
  // --------------------------------------------------
  const body = await req.json();

  const dealer_id = Number(
    body.dealer_id ??
    body.dealerId ??
    body.dealer?.dealer_id
  );

  const rows = body.rows ?? [];

  const calendar_week =
    Number.isInteger(body.calendar_week) && body.calendar_week > 0
      ? body.calendar_week
      : null;

  if (
    !Number.isInteger(dealer_id) ||
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return NextResponse.json(
      { error: "Ungültige CSV-Daten." },
      { status: 400 }
    );
  }

  // --------------------------------------------------
  // 1️⃣ SUBMISSION (CSV = sofort approved)
  // --------------------------------------------------
  const submissionInsert: SubmissionInsert = {
    dealer_id,
    typ: "verkauf",
    status: "approved", // ✅ CSV braucht KEINE Freigabe
    source: "csv",

    calendar_week,
    sony_share_qty: Number(body.inhouse_share_qty ?? 0),
    sony_share_revenue: Number(body.inhouse_share_revenue ?? 0),
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
  // 2️⃣ ITEMS
  // --------------------------------------------------
  const nowIso = new Date().toISOString();

  const items: SubmissionItemInsert[] = rows.map((r: any) => ({
    submission_id: submission.submission_id,
    ean: String(r.ean ?? ""),
    product_name: String(r.product_name ?? ""),
    menge: Number(r.quantity ?? 0),
    preis: Number(r.price ?? 0),
    serial: r.seriennummer ?? null,
    datum: r.date ?? null,
    comment: r.comment ?? null,
    created_at: nowIso,
  }));

  const { error: itemErr } = await supabase
    .from("submission_items")
    .insert(items);

  if (itemErr) {
    return NextResponse.json(
      { error: itemErr.message ?? "Positionen konnten nicht gespeichert werden." },
      { status: 500 }
    );
  }

  // --------------------------------------------------
  // ✅ SUCCESS
  // --------------------------------------------------
  return NextResponse.json({
    success: true,
    submission_id: submission.submission_id,
    inserted: items.length,
  });
}
