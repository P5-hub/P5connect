import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";
import type { FormType, SubmissionType } from "@/types/formTypes";

export const runtime = "nodejs";

/**
 * MAIN ROUTE
 */
export async function POST(req: NextRequest) {
  try {
    const { dealerId, last, type }: {
      dealerId: number;
      last: number;
      type: FormType;
    } = await req.json();

    if (!dealerId) {
      return NextResponse.json({ error: "dealerId required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "type required" }, { status: 400 });
    }

    if (type === "sofortrabatt") {
      return exportSofortRabatt(dealerId, last);
    }

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
 * EXPORT: Submissions (Bestellung / Verkauf / Projekt / Support)
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
      typ,
      status,
      kommentar,
      order_comment,
      bestellweg,
      requested_delivery_date,
      project_id,
      dealers(
        login_nr,
        name,
        store_name,
        contact_person,
        email,
        street,
        plz,
        city,
        country
      ),
      submission_items(
        menge,
        preis,
        netto_retail,
        invest,
        marge_neu,
        calc_price_on_invoice,
        serial,
        comment,
        products(
          product_name,
          ean,
          brand,
          gruppe,
          category
        )
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
    const dealer = s.dealers ?? {};

    const header = {
      ID: s.submission_id,
      Datum: new Date(s.created_at),
      Typ: s.typ ?? "",
      Status: s.status ?? "",
      Kommentar: s.kommentar ?? s.order_comment ?? "",
      Bestellweg: s.bestellweg ?? "",
      Lieferdatum_gewuenscht: s.requested_delivery_date ?? "",
      Project_ID: s.project_id ?? "",

      Händler: dealer.store_name || dealer.name || "",
      Login: dealer.login_nr ?? "",
      Kontaktperson: dealer.contact_person ?? "",
      Mail: dealer.email ?? "",
      Strasse: dealer.street ?? "",
      PLZ: dealer.plz ?? "",
      Ort: dealer.city ?? "",
      Land: dealer.country ?? "",
    };

    const items = s.submission_items ?? [];

    if (items.length === 0) {
      rows.push({
        ...header,
        Produkt: "",
        EAN: "",
        Brand: "",
        Gruppe: "",
        Kategorie: "",
        Menge: 0,
        Preis: 0,
        Zwischensumme: 0,
        Netto_Retail: "",
        Invest: "",
        Marge_Neu: "",
        POI_Neu: "",
        Seriennummer: "",
        Kommentar_Item: "",
      });
      return;
    }

    items.forEach((it: any) => {
      const p = it.products ?? {};
      const qty = Number(it.menge ?? 0);
      const price = Number(it.preis ?? 0);

      rows.push({
        ...header,
        Produkt: p.product_name ?? "",
        EAN: p.ean ?? "",
        Brand: p.brand ?? "",
        Gruppe: p.gruppe ?? "",
        Kategorie: p.category ?? "",
        Menge: qty,
        Preis: price,
        Zwischensumme: +(qty * price).toFixed(2),
        Netto_Retail: it.netto_retail ?? "",
        Invest: it.invest ?? "",
        Marge_Neu: it.marge_neu ?? "",
        POI_Neu: it.calc_price_on_invoice ?? "",
        Seriennummer: it.serial ?? "",
        Kommentar_Item: it.comment ?? "",
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  if (rows.length > 0) {
    ws["!cols"] = Object.keys(rows[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...rows.map((r) => String(r[key] ?? "").length)
        ) + 2,
    }));
  }

  rows.forEach((_, i) => {
    const cell = ws[`B${i + 2}`];
    if (cell && cell.v instanceof Date) {
      cell.t = "d";
      cell.z = "dd.mm.yyyy hh:mm";
    }
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}-export.xlsx"`,
    },
  });
}

/**
 * EXPORT: Sofortrabatt
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
      products
    `)
    .eq("dealer_id", dealerId)
    .order("submission_date", { ascending: false });

  if (error) throw error;

  const claims = data ?? [];
  const take = Number.isFinite(+last) && +last > 0 ? +last : claims.length;

  const rows: any[] = [];

  claims.slice(0, take).forEach((c: any) => {
    const list = Array.isArray(c.products) ? c.products : [];

    if (list.length === 0) {
      rows.push({
        ID: c.claim_id,
        Datum: new Date(c.submission_date),
        Status: c.status,
        RabattLevel: c.rabatt_level,
        RabattBetrag_CHF: c.rabatt_betrag,
        Produkt: "-",
        EAN: "-",
        Menge: "-",
      });
      return;
    }

    list.forEach((p: any) => {
      rows.push({
        ID: c.claim_id,
        Datum: new Date(c.submission_date),
        Status: c.status,
        RabattLevel: c.rabatt_level,
        RabattBetrag_CHF: c.rabatt_betrag,
        Produkt: p.product_name ?? "",
        EAN: p.ean ?? "",
        Menge: p.qty ?? "",
      });
    });
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sofort-Rabatt");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="sofortrabatt-export.xlsx"`,
    },
  });
}
