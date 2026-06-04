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

  product_name: string | null;
  ean: string | null;
  sony_article: string | null;

  menge: number | null;
  preis: number | null;

  stock_quantity: number | null;
  stock_date: string | null;

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

// -----------------------
// 🧱 Fallback Objects
// -----------------------
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
// 🧾 Excel Empty Row Helper
// -----------------------
function buildEmptyRow(isVerkauf: boolean) {
  const base: Record<string, any> = {
    ID: "",
    Datum: "",
    Typ: "",
    Status: "",
    Kommentar: "",
    Bestellweg: "",
    Lieferdatum_gewuenscht: "",
    Project_ID: "",
    Händler: "",
    Login: "",
    Kontaktperson: "",
    Mail: "",
    Strasse: "",
    PLZ: "",
    Ort: "",
    Land: "",
    Produkt: "",
    EAN: "",
    Brand: "",
    Gruppe: "",
    Kategorie: "",
    Menge: "",
  };

  if (isVerkauf) {
    base.Lagerbestand = "";
    base.Lagerdatum = "";
  }

  base.Preis = "";
  base.Zwischensumme = "";
  base.Netto_Retail = "";
  base.Invest = "";
  base.Marge_Neu = "";
  base.POI_Neu = "";

  if (!isVerkauf) {
    base.Seriennummer = "";
  }

  base.Kommentar_Item = "";

  return base;
}

// -----------------------
// 📤 POST Handler
// -----------------------
export async function POST(req: NextRequest) {
  try {
    const { type, from, to, search } = await req.json();
    const supabase = await getSupabaseServer();

    const exportType = typeof type === "string" ? type : "";
    const isVerkauf = exportType === "verkauf";

    const searchKey = typeof search === "string" ? search.trim() : "";

    // ------------------------------------------
    // 1) Header-Filter (identisch zur UI)
    // ------------------------------------------
    let headerQuery = supabase
      .from("v_submission_history_header")
      .select("submission_id, source, created_at, display_id")
      .eq("typ", exportType);

    if (from) {
      headerQuery = headerQuery.gte("created_at", `${from}T00:00:00`);
    }

    if (to) {
      headerQuery = headerQuery.lte("created_at", `${to}T23:59:59`);
    }

    if (searchKey) {
      headerQuery = headerQuery.or(
        `display_id.ilike.%${searchKey}%,dealer_name.ilike.%${searchKey}%,product_names.ilike.%${searchKey}%`
      );
    }

    headerQuery = headerQuery.order("created_at", { ascending: false });

    const { data: headerRows, error: headerError } = await headerQuery;

    if (headerError) throw headerError;

    // ------------------------------------------
    // 2) Nur echte Submissions exportieren
    // ------------------------------------------
    const submissionIds: number[] = (headerRows ?? [])
      .filter((r: any) => r?.source === "submission")
      .map((r: any) => Number(r.submission_id))
      .filter((n): n is number => Number.isFinite(n));

    // ------------------------------------------
    // 3) Leerer Export → leere Excel-Struktur
    // ------------------------------------------
    if (submissionIds.length === 0) {
      const ws = XLSX.utils.json_to_sheet([buildEmptyRow(isVerkauf)]);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, "Export");

      const buffer = Buffer.from(
        XLSX.write(wb, { type: "array", bookType: "xlsx" })
      );

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${exportType}_export.xlsx"`,
        },
      });
    }

    // ------------------------------------------
    // 4) Detail-Daten laden
    // ------------------------------------------
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
          product_name,
          ean,
          sony_article,
          menge,
          preis,
          stock_quantity,
          stock_date,
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
      .in("submission_id", submissionIds)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const submissions = (data ?? []) as Submission[];

    // ------------------------------------------
    // 5) Excel-Zeilen bauen (Item-flat)
    // ------------------------------------------
    const rows: any[] = [];

    for (const s of submissions) {
      const dealer = s.dealers ?? emptyDealer;

      const dealerName =
        dealer.store_name || dealer.name || `Händler ${s.dealer_id ?? "-"}`;

      const header = {
        ID: s.submission_id,
        Datum: s.created_at ? new Date(s.created_at) : "",
        Typ: s.typ ?? "",
        Status: s.status ?? "",
        Kommentar: s.kommentar ?? s.order_comment ?? "",
        Bestellweg: s.bestellweg ?? "",
        Lieferdatum_gewuenscht: s.requested_delivery_date ?? "",
        Project_ID: s.project_id ?? "",

        Händler: dealerName,
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
        const row: Record<string, any> = {
          ...header,
          Produkt: "",
          EAN: "",
          Brand: "",
          Gruppe: "",
          Kategorie: "",
          Menge: 0,
        };

        if (isVerkauf) {
          row.Lagerbestand = "";
          row.Lagerdatum = "";
        }

        row.Preis = 0;
        row.Zwischensumme = 0;
        row.Netto_Retail = "";
        row.Invest = "";
        row.Marge_Neu = "";
        row.POI_Neu = "";

        if (!isVerkauf) {
          row.Seriennummer = "";
        }

        row.Kommentar_Item = "";

        rows.push(row);
        continue;
      }

      for (const item of items) {
        const p = item.products ?? emptyProduct;

        const qty = Number(item.menge ?? 0);
        const price = Number(item.preis ?? 0);

        const productName =
          item.product_name ??
          item.sony_article ??
          p.product_name ??
          "";

        const ean =
          item.ean ??
          p.ean ??
          "";

        const row: Record<string, any> = {
          ...header,
          Produkt: productName,
          EAN: ean,
          Brand: p.brand ?? "",
          Gruppe: p.gruppe ?? "",
          Kategorie: p.category ?? "",
          Menge: qty,
        };

        if (isVerkauf) {
          row.Lagerbestand = item.stock_quantity ?? "";
          row.Lagerdatum = item.stock_date ?? "";
        }

        row.Preis = price;
        row.Zwischensumme = +(qty * price).toFixed(2);
        row.Netto_Retail = item.netto_retail ?? "";
        row.Invest = item.invest ?? "";
        row.Marge_Neu = item.marge_neu ?? "";
        row.POI_Neu = item.calc_price_on_invoice ?? "";

        if (!isVerkauf) {
          row.Seriennummer = item.serial ?? "";
        }

        row.Kommentar_Item = item.comment ?? "";

        rows.push(row);
      }
    }

    // ------------------------------------------
    // 6) Excel bauen
    // ------------------------------------------
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Export");

    const buffer = Buffer.from(
      XLSX.write(wb, { type: "array", bookType: "xlsx" })
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${exportType}_export.xlsx"`,
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