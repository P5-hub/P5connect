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

  // Für Sell-in / Konditionsart
  pricing_mode: string | null;
  is_display_item: boolean | null;
  item_status: string | null;

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

  // Bestellinformationen
  distributor: string | null;
  dealer_reference: string | null;
  customer_number: string | null;
  order_number: string | null;

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
// 🧾 Konditions-Helfer
// -----------------------
function getSellinMode(item: SubmissionItem) {
  if (item.pricing_mode === "messe") {
    return "messe";
  }

  if (
    item.pricing_mode === "display" ||
    item.is_display_item === true
  ) {
    return "display";
  }

  return "standard";
}

function getSellinModeLabel(mode: string) {
  if (mode === "messe") {
    return "Messe";
  }

  if (mode === "display") {
    return "Display";
  }

  return "Standard";
}

// -----------------------
// 🧾 Excel Empty Row Helper
// -----------------------
function buildEmptyRow(
  isVerkauf: boolean,
  isBestellung: boolean
) {
  const base: Record<string, any> = {
    ID: "",
  };

  // Nur Bestellungen:
  // eindeutige Positions-ID + Konditionsart
  if (isBestellung) {
    base.Positions_ID = "";
    base.Kondition = "";
    base.Kondition_Code = "";
  }

  base.Datum = "";
  base.Typ = "";
  base.Status = "";
  base.Kommentar = "";
  base.Bestellweg = "";
  base.Lieferdatum_gewuenscht = "";
  base.Project_ID = "";

  if (isBestellung) {
    base.Bestellnummer = "";
    base.Händlerreferenz = "";
    base.Kundennummer = "";
    base.Distributor = "";
  }

  base.Händler = "";
  base["Händler-Nr"] = "";
  base.Kontaktperson = "";
  base.Mail = "";
  base.Strasse = "";
  base.PLZ = "";
  base.Ort = "";
  base.Land = "";

  base.Produkt = "";
  base.EAN = "";
  base.Brand = "";
  base.Gruppe = "";
  base.Kategorie = "";
  base.Menge = "";

  if (isVerkauf) {
    base.Lagerbestand = "";
    base.Lagerdatum = "";
  }

  base.Preis = "";
  base.Zwischensumme = "";
  base.Netto_Retail = "";
  base.Invest = "";
  base.Total_Invest = "";
  base.Marge_Neu = "";
  base.POI_Neu = "";

  if (!isVerkauf) {
    base.Seriennummer = "";
  }

  base.Kommentar_Item = "";

  return base;
}

// -----------------------
// 🔎 Suchfilter
// -----------------------
function buildSubmissionSearchFilter(searchKey: string) {
  const value = searchKey.trim();

  if (!value) return "";

  const filters = [
    `display_id.ilike.%${value}%`,
    `dealer_name.ilike.%${value}%`,
    `product_names.ilike.%${value}%`,
  ];

  if (/^\d+$/.test(value)) {
    filters.push(`submission_id.eq.${Number(value)}`);
  }

  return filters.join(",");
}

// -----------------------
// 📤 POST Handler
// -----------------------
export async function POST(req: NextRequest) {
  try {
    const { type, from, to, search } = await req.json();
    const supabase = await getSupabaseServer();

    const exportType =
      typeof type === "string" ? type : "";

    const isVerkauf =
      exportType === "verkauf";

    const isBestellung =
      exportType === "bestellung";

    const searchKey =
      typeof search === "string"
        ? search.trim()
        : "";

    // ------------------------------------------
    // 1) Header-Filter (identisch zur UI)
    // ------------------------------------------
    let headerQuery = supabase
      .from("v_submission_history_header")
      .select(
        "submission_id, source, created_at, display_id"
      )
      .eq("typ", exportType);

    if (isBestellung) {
      headerQuery =
        headerQuery.eq("status", "approved");
    }

    if (from) {
      headerQuery = headerQuery.gte(
        "created_at",
        `${from}T00:00:00`
      );
    }

    if (to) {
      headerQuery = headerQuery.lte(
        "created_at",
        `${to}T23:59:59`
      );
    }

    if (searchKey) {
      const searchFilter =
        buildSubmissionSearchFilter(searchKey);

      if (searchFilter) {
        headerQuery =
          headerQuery.or(searchFilter);
      }
    }

    headerQuery = headerQuery.order(
      "created_at",
      { ascending: false }
    );

    const {
      data: headerRows,
      error: headerError,
    } = await headerQuery;

    if (headerError) {
      throw headerError;
    }

    // ------------------------------------------
    // 2) Nur echte Submissions exportieren
    // ------------------------------------------
    const submissionIds: number[] =
      (headerRows ?? [])
        .filter(
          (r: any) =>
            r?.source === "submission"
        )
        .map((r: any) =>
          Number(r.submission_id)
        )
        .filter(
          (n): n is number =>
            Number.isFinite(n)
        );

    // ------------------------------------------
    // 3) Leerer Export
    // ------------------------------------------
    if (submissionIds.length === 0) {
      const ws =
        XLSX.utils.json_to_sheet([
          buildEmptyRow(
            isVerkauf,
            isBestellung
          ),
        ]);

      const wb =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Export"
      );

      const buffer = Buffer.from(
        XLSX.write(wb, {
          type: "array",
          bookType: "xlsx",
        })
      );

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          "Content-Disposition":
            `attachment; filename="${exportType}_export.xlsx"`,
        },
      });
    }

    // ------------------------------------------
    // 4) Detail-Daten laden
    // ------------------------------------------
    const { data, error } =
      await supabase
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

          distributor,
          dealer_reference,
          customer_number,
          order_number,

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

            pricing_mode,
            is_display_item,
            item_status,

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
        .in(
          "submission_id",
          submissionIds
        )
        .order(
          "created_at",
          { ascending: false }
        );

    if (error) {
      throw error;
    }

    const submissions =
      (data ?? []) as Submission[];

    // ------------------------------------------
    // 5) Excel-Zeilen bauen
    //    Eine Zeile = eine Position
    // ------------------------------------------
    const rows: any[] = [];

    for (const s of submissions) {
      const dealer =
        s.dealers ?? emptyDealer;

      const dealerName =
        dealer.store_name ||
        dealer.name ||
        `Händler ${s.dealer_id ?? "-"}`;

      const header: Record<
        string,
        any
      > = {
        ID: s.submission_id,
      };

      // Nur bei Bestellungen
      // direkt nach Bestell-ID einordnen
      if (isBestellung) {
        // Positions_ID wird unten
        // pro Item ergänzt.
        // Hier absichtlich noch nicht.
      }

      header.Datum =
        s.created_at
          ? new Date(s.created_at)
          : "";

      header.Typ =
        s.typ ?? "";

      header.Status =
        s.status ?? "";

      header.Kommentar =
        s.kommentar ??
        s.order_comment ??
        "";

      header.Bestellweg =
        s.bestellweg ?? "";

      header.Lieferdatum_gewuenscht =
        s.requested_delivery_date ??
        "";

      header.Project_ID =
        s.project_id ?? "";

      if (isBestellung) {
        header.Bestellnummer =
          s.order_number ?? "";

        header.Händlerreferenz =
          s.dealer_reference ?? "";

        header.Kundennummer =
          s.customer_number ?? "";

        header.Distributor =
          s.distributor ?? "";
      }

      header.Händler =
        dealerName;

      header["Händler-Nr"] =
        dealer.login_nr ?? "";

      header.Kontaktperson =
        dealer.contact_person ?? "";

      header.Mail =
        dealer.email ?? "";

      header.Strasse =
        dealer.street ?? "";

      header.PLZ =
        dealer.plz ?? "";

      header.Ort =
        dealer.city ?? "";

      header.Land =
        dealer.country ?? "";

      // ------------------------------------------
      // Stornierte Positionen bei Bestellungen
      // ausschliessen.
      //
      // Entspricht:
      // coalesce(item_status,'active')
      // <> 'cancelled'
      // ------------------------------------------
      const items =
        (s.submission_items ?? []).filter(
          (item) => {
            if (!isBestellung) {
              return true;
            }

            return (
              (item.item_status ??
                "active") !==
              "cancelled"
            );
          }
        );

      // ------------------------------------------
      // Submission ohne Positionen
      // ------------------------------------------
      if (items.length === 0) {
        const row:
          Record<string, any> = {
          ...header,
        };

        if (isBestellung) {
          row.Positions_ID = "";
          row.Kondition = "";
          row.Kondition_Code = "";
        }

        row.Produkt = "";
        row.EAN = "";
        row.Brand = "";
        row.Gruppe = "";
        row.Kategorie = "";
        row.Menge = 0;

        if (isVerkauf) {
          row.Lagerbestand = "";
          row.Lagerdatum = "";
        }

        row.Preis = 0;
        row.Zwischensumme = 0;
        row.Netto_Retail = "";
        row.Invest = "";
        row.Total_Invest = "";
        row.Marge_Neu = "";
        row.POI_Neu = "";

        if (!isVerkauf) {
          row.Seriennummer = "";
        }

        row.Kommentar_Item = "";

        rows.push(row);

        continue;
      }

      // ------------------------------------------
      // Eine Excel-Zeile pro Position
      // ------------------------------------------
      for (const item of items) {
        const p =
          item.products ??
          emptyProduct;

        const qty =
          Number(
            item.menge ?? 0
          );

        const price =
          Number(
            item.preis ?? 0
          );

        const invest =
          Number(
            item.invest ?? 0
          );

        const totalInvest =
          qty * invest;

        const productName =
          item.product_name ??
          item.sony_article ??
          p.product_name ??
          "";

        const ean =
          item.ean ??
          p.ean ??
          "";

        // --------------------------------------
        // Konditionslogik
        //
        // identisch zu
        // get_sellin_order_details
        // --------------------------------------
        const sellinMode =
          getSellinMode(item);

        const sellinModeLabel =
          getSellinModeLabel(
            sellinMode
          );

        const row:
          Record<string, any> = {
          ...header,
        };

        // --------------------------------------
        // Bestell-spezifische Positionsdaten
        // --------------------------------------
        if (isBestellung) {
          row.Positions_ID =
            item.item_id ?? "";

          row.Kondition =
            sellinModeLabel;

          row.Kondition_Code =
            sellinMode;
        }

        row.Produkt =
          productName;

        row.EAN =
          ean;

        row.Brand =
          p.brand ?? "";

        row.Gruppe =
          p.gruppe ?? "";

        row.Kategorie =
          p.category ?? "";

        row.Menge =
          qty;

        if (isVerkauf) {
          row.Lagerbestand =
            item.stock_quantity ??
            "";

          row.Lagerdatum =
            item.stock_date ??
            "";
        }

        row.Preis =
          price;

        row.Zwischensumme =
          +(
            qty *
            price
          ).toFixed(2);

        row.Netto_Retail =
          item.netto_retail ??
          "";

        row.Invest =
          item.invest ?? "";

        row.Total_Invest =
          +totalInvest.toFixed(2);

        row.Marge_Neu =
          item.marge_neu ?? "";

        row.POI_Neu =
          item.calc_price_on_invoice ??
          "";

        if (!isVerkauf) {
          row.Seriennummer =
            item.serial ?? "";
        }

        row.Kommentar_Item =
          item.comment ?? "";

        rows.push(row);
      }
    }

    // ------------------------------------------
    // 6) Excel bauen
    // ------------------------------------------
    const ws =
      XLSX.utils.json_to_sheet(
        rows.length
          ? rows
          : [
              buildEmptyRow(
                isVerkauf,
                isBestellung
              ),
            ]
      );

    // ------------------------------------------
    // Optional:
    // sinnvolle Spaltenbreiten
    // ------------------------------------------
    ws["!cols"] = [
      { wch: 10 }, // ID

      ...(isBestellung
        ? [
            { wch: 12 }, // Positions_ID
            { wch: 12 }, // Kondition
            { wch: 16 }, // Kondition_Code
          ]
        : []),

      { wch: 20 }, // Datum
      { wch: 14 }, // Typ
      { wch: 14 }, // Status
      { wch: 30 }, // Kommentar
      { wch: 14 }, // Bestellweg
      { wch: 20 }, // Lieferdatum
      { wch: 15 }, // Project_ID

      ...(isBestellung
        ? [
            { wch: 20 }, // Bestellnummer
            { wch: 22 }, // Händlerreferenz
            { wch: 18 }, // Kundennummer
            { wch: 15 }, // Distributor
          ]
        : []),

      { wch: 30 }, // Händler
      { wch: 15 }, // Händler-Nr
      { wch: 25 }, // Kontaktperson
      { wch: 30 }, // Mail
      { wch: 25 }, // Strasse
      { wch: 10 }, // PLZ
      { wch: 20 }, // Ort
      { wch: 10 }, // Land
      { wch: 25 }, // Produkt
      { wch: 18 }, // EAN
      { wch: 12 }, // Brand
      { wch: 15 }, // Gruppe
      { wch: 18 }, // Kategorie
      { wch: 10 }, // Menge

      ...(isVerkauf
        ? [
            { wch: 14 }, // Lagerbestand
            { wch: 14 }, // Lagerdatum
          ]
        : []),

      { wch: 14 }, // Preis
      { wch: 16 }, // Zwischensumme
      { wch: 14 }, // Netto Retail
      { wch: 14 }, // Invest
      { wch: 16 }, // Total Invest
      { wch: 14 }, // Marge Neu
      { wch: 14 }, // POI Neu

      ...(!isVerkauf
        ? [
            { wch: 20 }, // Seriennummer
          ]
        : []),

      { wch: 30 }, // Kommentar Item
    ];

    const wb =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      "Export"
    );

    const buffer = Buffer.from(
      XLSX.write(wb, {
        type: "array",
        bookType: "xlsx",
      })
    );

    return new NextResponse(buffer, {
      status: 200,

      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          `attachment; filename="${exportType}_export.xlsx"`,
      },
    });
  } catch (e: any) {
    console.error(
      "❌ Excel Export Error:",
      e
    );

    return NextResponse.json(
      {
        error:
          e?.message ??
          "Export failed",
      },
      {
        status: 500,
      }
    );
  }
}