import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";

/**
 * POST /api/verkauf/csv
 * Sony Sell-out Meldung via CSV Upload
 */
export async function POST(req: Request) {
  const supabase = await getSupabaseServer();

  /* --------------------------------------------------
     🔐 AUTH
  -------------------------------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Nicht eingeloggt." },
      { status: 401 }
    );
  }

  /* --------------------------------------------------
     📥 BODY
  -------------------------------------------------- */
  const body = await req.json();

  const {
    calendar_week,
    inhouse_share_qty,
    inhouse_share_revenue,
    sony_qty,
    sony_revenue,
    total_qty,
    total_revenue,
    rows,
  } = body ?? {};

  /* --------------------------------------------------
     🛑 VALIDIERUNG
  -------------------------------------------------- */
  if (
    !calendar_week ||
    !Array.isArray(rows) ||
    rows.length === 0 ||
    typeof inhouse_share_qty !== "number" ||
    typeof inhouse_share_revenue !== "number" ||
    inhouse_share_qty <= 0 ||
    inhouse_share_revenue <= 0
  ) {
    return NextResponse.json(
      { error: "Ungültige Verkaufsdaten." },
      { status: 400 }
    );
  }

  /* --------------------------------------------------
     👤 DEALER SERVERSEITIG ERMITTELN
     (kein URL-Trick möglich)
  -------------------------------------------------- */
  const { data: dealer, error: dealerError } = await supabase
    .from("dealers")
    .select("dealer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (dealerError || !dealer) {
    return NextResponse.json(
      { error: "Händler nicht gefunden." },
      { status: 403 }
    );
  }

  /* --------------------------------------------------
     🧾 HEADER: verkauf_csv_meldungen
  -------------------------------------------------- */
  const { data: header, error: headerError } = await supabase
    .from("verkauf_csv_meldungen")
    .insert({
      dealer_id: dealer.dealer_id,
      calendar_week,
      inhouse_share_qty,
      inhouse_share_revenue,
      sony_qty,
      sony_revenue,
      total_qty,
      total_revenue,
    })
    .select("id")
    .single();

  if (headerError || !header) {
    console.error("HEADER ERROR:", headerError);
    return NextResponse.json(
      { error: "Fehler beim Speichern der Verkaufsmeldung." },
      { status: 500 }
    );
  }

  /* --------------------------------------------------
     📦 DETAILZEILEN: verkauf_csv_items
  -------------------------------------------------- */
  const detailRows = rows.map((r: any) => ({
    meldung_id: header.id,
    ean: String(r.ean),
    product_name: String(r.product_name),
    quantity: Number(r.quantity),
    price: Number(r.price),
    revenue: Number(r.quantity) * Number(r.price),
    datum: r.date || null,
    seriennummer: r.seriennummer || null,
    kommentar: r.comment || null,
  }));

  const { error: itemsError } = await supabase
    .from("verkauf_csv_items")
    .insert(detailRows);

  if (itemsError) {
    console.error("ITEM ERROR:", itemsError);
    return NextResponse.json(
      { error: "Fehler beim Speichern der Verkaufspositionen." },
      { status: 500 }
    );
  }

  /* --------------------------------------------------
     ✅ SUCCESS
  -------------------------------------------------- */
  return NextResponse.json({ success: true });
}
