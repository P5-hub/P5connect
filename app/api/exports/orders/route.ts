// app/api/exports/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

import type { FormType, SubmissionType } from "@/types/formTypes";

export const runtime = "nodejs";

/**
 * MAIN ROUTE
 * Entscheidet automatisch: submissions oder sofortrabatt
 */
export async function POST(req: NextRequest) {
  try {
    const { dealerId, last, type }: { dealerId: number; last: number; type: FormType } =
      await req.json();

    if (!dealerId) {
      return NextResponse.json({ error: "dealerId required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "type required" }, { status: 400 });
    }

    // Sofortrabatt → eigene Tabelle → eigener Export
    if (type === "sofortrabatt") {
      return exportSofortRabatt(dealerId, last);
    }

    // Alle anderen Formulare → submissions Tabelle
    return exportSubmissions(dealerId, last, type as SubmissionType);
  } catch (e: any) {
    console.error("❌ Excel Export Error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Export failed" },
      { status: 500 }
    );
  }
}

/**
 * EXPORT 1: Bestellungen, Verkäufe, Projekte, Support
 * → gehen alle über die submissions Tabelle
 */
async function exportSubmissions(
  dealerId: number,
  last: number,
  type: SubmissionType
) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("submissions")
    .select(`
      submission_id,
      created_at,
      status,
      distributor,
      dealer_reference,
      requested_delivery,
      requested_delivery_date,
      customer_number,
      customer_contact,
      customer_phone,
      submission_items(
        product_id,
        menge,
        preis,
        products(product_name, ean)
      )
    `)
    .eq("dealer_id", dealerId)
    .eq("typ", type)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const submissions = data ?? [];

  const take = Number.isFinite(+last) && +last > 0 ? +last : submissions.length;

  const rows: any[] = [];

  submissions.slice(0, take).forEach((s: any) => {
    const items = s.submission_items || [];

    if (items.length === 0) {
      rows.push({
        ID: s.submission_id,
        Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
        Status: s.status,
        Produkt: "-",
        EAN: "-",
        Menge: 0,
        Preis_CHF: 0,
        Zwischensumme_CHF: 0,
      });
    } else {
      items.forEach((it: any) => {
        rows.push({
          ID: s.submission_id,
          Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
          Status: s.status,
          Produkt: it.products?.product_name || "",
          EAN: it.products?.ean || "",
          Menge: Number(it.menge || 0),
          Preis_CHF: Number(it.preis || 0),
          Zwischensumme_CHF: +(
            Number(it.menge || 0) * Number(it.preis || 0)
          ).toFixed(2),
        });
      });
    }
  });

  // Excel generieren
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Verlauf");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}-verlauf.xlsx"`,
    },
  });
}

/**
 * EXPORT 2: Sofortrabatt (eigene Tabelle!)
 */
async function exportSofortRabatt(dealerId: number, last: number) {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase
    .from("sofortrabatt_claims")
    .select(`
      claim_id,
      submission_date,
      status,
      rabatt_level,
      rabatt_betrag,
      products,
      invoice_file_url,
      updated_at
    `)
    .eq("dealer_id", dealerId)
    .order("submission_date", { ascending: false });

  if (error) throw error;

  const claims = data ?? [];

  const take = Number.isFinite(+last) && +last > 0 ? +last : claims.length;

  const rows: any[] = [];

  claims.slice(0, take).forEach((c: any) => {
    const productList = Array.isArray(c.products) ? c.products : [];

    if (productList.length === 0) {
      rows.push({
        ID: c.claim_id,
        Datum: new Date(c.submission_date).toLocaleString("de-CH"),
        Status: c.status,
        RabattLevel: c.rabatt_level,
        RabattBetrag_CHF: c.rabatt_betrag,
        Produkt: "-",
        EAN: "-",
        Menge: "-",
      });
    } else {
      productList.forEach((p: any) => {
        rows.push({
          ID: c.claim_id,
          Datum: new Date(c.submission_date).toLocaleString("de-CH"),
          Status: c.status,
          RabattLevel: c.rabatt_level,
          RabattBetrag_CHF: c.rabatt_betrag,
          Produkt: p.product_name || "",
          EAN: p.ean || "",
          Menge: p.qty || "",
        });
      });
    }
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sofort-Rabatt");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sofortrabatt-verlauf.xlsx"`,
    },
  });
}
