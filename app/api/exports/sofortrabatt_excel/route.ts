import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DealerRow = {
  store_name?: string | null;
  street?: string | null;
  plz?: string | null;
  city?: string | null;
};

export async function POST(req: Request) {
  try {
    const { dealerId, last = 100 } = await req.json();

    if (!dealerId) {
      return new NextResponse("dealerId missing", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // --------------------------------------------------
    // 1. Sofortrabatt Claims laden
    // --------------------------------------------------
    const { data: claims, error: claimsError } = await supabase
      .from("sofortrabatt_claims")
      .select(`
        claim_id,
        dealer_id,
        submission_date,
        status,
        rabatt_level,
        rabatt_betrag,
        comment,
        products
      `)
      .eq("dealer_id", dealerId)
      .order("submission_date", { ascending: false })
      .limit(last);

    if (claimsError) throw claimsError;

    // --------------------------------------------------
    // 2. Händler laden (ECHTE DB-SPALTEN!)
    // --------------------------------------------------
    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select(`
        store_name,
        street,
        plz,
        city
      `)
      .eq("dealer_id", dealerId)
      .maybeSingle<DealerRow>();

    if (dealerError) throw dealerError;

    // --------------------------------------------------
    // 3. Excel-Zeilen aufbauen
    // --------------------------------------------------
    const rows: any[] = [];

    (claims ?? []).forEach((c: any) => {
      const products = Array.isArray(c.products) ? c.products : [];

      if (products.length === 0) {
        rows.push({
          Antrag_ID: c.claim_id,
          Datum: c.submission_date ? new Date(c.submission_date) : "",
          Status: c.status ?? "",
          Händler: dealer?.store_name ?? "",
          Strasse: dealer?.street ?? "",
          PLZ: dealer?.plz ?? "",
          Ort: dealer?.city ?? "",
          Produkt: "",
          Kategorie: "",
          EAN: "",
          Menge: "",
          Rabatt_Level: c.rabatt_level ?? "",
          Rabatt_CHF: c.rabatt_betrag ?? "",
          Kommentar: c.comment ?? "",
        });
        return;
      }

      products.forEach((p: any) => {
        rows.push({
          Antrag_ID: c.claim_id,
          Datum: c.submission_date ? new Date(c.submission_date) : "",
          Status: c.status ?? "",
          Händler: dealer?.store_name ?? "",
          Strasse: dealer?.street ?? "",
          PLZ: dealer?.plz ?? "",
          Ort: dealer?.city ?? "",
          Produkt: p.product_name ?? "",
          Kategorie: p.category ?? "",
          EAN: p.ean ?? "",
          Menge: p.qty ?? "",
          Rabatt_Level: c.rabatt_level ?? "",
          Rabatt_CHF: c.rabatt_betrag ?? "",
          Kommentar: c.comment ?? "",
        });
      });
    });

    // --------------------------------------------------
    // 4. Excel erzeugen
    // --------------------------------------------------
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Datum formatieren (Spalte B)
    rows.forEach((_, i) => {
      const cell = ws[`B${i + 2}`];
      if (cell && cell.v instanceof Date) {
        cell.t = "d";
        cell.z = "dd.mm.yyyy hh:mm";
      }
    });

    // Spaltenbreiten automatisch
    if (rows.length > 0) {
      ws["!cols"] = Object.keys(rows[0]).map((key) => ({
        wch:
          Math.max(
            key.length,
            ...rows.map((r) => String(r[key] ?? "").length)
          ) + 2,
      }));
    }

    XLSX.utils.book_append_sheet(wb, ws, "Sofortrabatte");

    const xlsxArray = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    return new NextResponse(new Uint8Array(xlsxArray), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="sofortrabatte.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt Excel Fehler:", e);
    return new NextResponse(
      e?.message ?? "excel generation failed",
      { status: 500 }
    );
  }
}
