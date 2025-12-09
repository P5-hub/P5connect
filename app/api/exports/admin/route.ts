export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

// -----------------------
// 🧱 Type Definitions
// -----------------------
type Dealer = {
  login_nr: string | null;
  name: string | null;
  store_name: string | null;
  contact_person: string | null;
  email: string | null;
  street: string | null;
  plz: string | null;
  city: string | null;
  country: string | null;
};

type Product = {
  product_name: string | null;
  ean: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  dealer_invoice_price: number | null;
};

type SubmissionItem = {
  item_id: number | null;
  product_id: number | null;
  menge: number | null;
  preis: number | null;
  invest: number | null;
  netto_retail: number | null;
  marge_alt: number | null;
  marge_neu: number | null;
  calc_price_on_invoice: number | null;
  serial: string | null;
  comment: string | null;
  products: Product | null;
};

type Submission = {
  submission_id: number;
  created_at: string | null;
  typ: string | null;
  status: string | null;
  kommentar: string | null;
  order_comment: string | null;
  bestellweg: string | null;
  requested_delivery_date: string | null;
  project_id: string | null;
  dealer_id: number | null;
  dealers: Dealer | null;
  submission_items: SubmissionItem[] | null;
};

// Fallback empty objects to satisfy TS
const emptyDealer: Dealer = {
  login_nr: null,
  name: null,
  store_name: null,
  contact_person: null,
  email: null,
  street: null,
  plz: null,
  city: null,
  country: null,
};

const emptyProduct: Product = {
  product_name: null,
  ean: null,
  brand: null,
  gruppe: null,
  category: null,
  retail_price: null,
  dealer_invoice_price: null,
};

// -----------------------
// 📤 POST Handler
// -----------------------
export async function POST(req: NextRequest) {
  try {
    const { type, from, to, search } = await req.json();
    const supabase = await getSupabaseServer();

    // -------------------------------
    // 🔍 FILTERS + Query
    // -------------------------------
    const query = supabase
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
        dealer_id,
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
          item_id,
          product_id,
          menge,
          preis,
          invest,
          netto_retail,
          marge_alt,
          marge_neu,
          calc_price_on_invoice,
          serial,
          comment,
          products(
            product_name,
            ean,
            brand,
            gruppe,
            category,
            retail_price,
            dealer_invoice_price
          )
        )
      `)
      .eq("typ", type)
      .order("created_at", { ascending: false });

    if (from) query.gte("created_at", `${from}T00:00:00`);
    if (to) query.lte("created_at", `${to}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    let submissions: Submission[] = data ?? [];

    // -------------------------------
    // 🔍 SEARCH
    // -------------------------------
    if (search && search.trim() !== "") {
      const s = search.toLowerCase();

      submissions = submissions.filter((sb) => {
        const d = sb.dealers ?? emptyDealer;
        const dealerName = d.store_name || d.name || "";

        const matchesDealer = dealerName.toLowerCase().includes(s);

        const matchesItem = sb.submission_items?.some((i) =>
          (i.products?.product_name ?? "").toLowerCase().includes(s)
        );

        return matchesDealer || matchesItem;
      });
    }

    // -------------------------------
    // 🔄 BUILD EXCEL ROWS
    // -------------------------------
    const rows: any[] = [];

    for (const s of submissions) {
      const dealer = s.dealers ?? emptyDealer;
      const dealerName =
        dealer.store_name || dealer.name || `Händler ${s.dealer_id ?? "-"}`;
      const loginNr = dealer.login_nr ?? "-";

      const excelDate = s.created_at ? new Date(s.created_at) : new Date();

      const header = {
        ID: s.submission_id,
        Datum: excelDate,
        Typ: s.typ ?? "",
        Status: s.status ?? "",
        Kommentar: s.kommentar ?? s.order_comment ?? "",
        Bestellweg: s.bestellweg ?? "",
        Lieferdatum_gewuenscht: s.requested_delivery_date ?? "",
        Project_ID: s.project_id ?? "",

        Händler: dealerName,
        Login: loginNr,
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
        continue;
      }

      for (const item of items) {
        const p = item.products ?? emptyProduct;

        const qty = Number(item.menge ?? 0);
        const price = Number(item.preis ?? 0);

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

          Netto_Retail: item.netto_retail ?? "",
          Invest: item.invest ?? "",
          Marge_Neu: item.marge_neu ?? "",
          POI_Neu: item.calc_price_on_invoice ?? "",

          Seriennummer: item.serial ?? "",
          Kommentar_Item: item.comment ?? "",
        });
      }
    }

    // -------------------------------
    // 📘 BUILD EXCEL
    // -------------------------------
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

    rows.forEach((r, i) => {
      const cell = ws[`B${i + 2}`];
      if (cell && cell.v instanceof Date) {
        cell.t = "d";
        cell.z = "dd.mm.yyyy hh:mm";
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    const arrayBuffer = XLSX.write(wb, {
      type: "array",
      bookType: "xlsx",
    });

    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_export.xlsx"`,
      },
    });
  } catch (e: any) {
    console.error("❌ Excel Export Error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Export failed" },
      { status: 500 }
    );
  }
}
