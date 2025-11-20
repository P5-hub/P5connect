export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

type SubmissionItem = {
  product_id: number | null;
  menge: number | null;
  preis: number | null;
  products?: {
    product_name: string | null;
    ean: string | null;
  } | null;
};

type SubmissionWithDealer = {
  submission_id: number;
  created_at: string | null;
  typ: string | null;
  status: string | null;
  dealer_id: number | null;
  dealers?: {
    login_nr: string | null;
    store_name: string | null;
    company_name: string | null;
  } | null;
  submission_items?: SubmissionItem[] | null;
};

export async function POST(req: NextRequest) {
  try {
    const { type, from, to, search } = await req.json();
    const supabase = await getSupabaseServer();

    // -------------------------------
    // 🔍 FILTER: Typ, Zeitraum, Suchbegriff
    // -------------------------------
    const query = supabase
      .from("submissions")
      .select(`
        submission_id,
        created_at,
        typ,
        status,
        dealer_id,
        dealers(*),
        submission_items(
          product_id,
          menge,
          preis,
          products(product_name, ean)
        )
      `)
      .eq("typ", type)
      .order("created_at", { ascending: false });

    if (from) query.gte("created_at", `${from}T00:00:00`);
    if (to) query.lte("created_at", `${to}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    let submissions = (data ?? []) as SubmissionWithDealer[];

    // -------------------------------
    // 🔎 Suche im Speicher
    // -------------------------------
    if (search && search.trim() !== "") {
      const s = search.toLowerCase();

      submissions = submissions.filter((sb) => {
        const dealerName =
          sb.dealers?.store_name ||
          sb.dealers?.company_name ||
          "";

        const matchesDealer = dealerName.toLowerCase().includes(s);

        const matchesItem = sb.submission_items?.some((i) =>
          (i.products?.product_name ?? "").toLowerCase().includes(s)
        );

        return matchesDealer || matchesItem;
      });
    }

    // -------------------------------
    // 🔄 Excel-Rows erstellen
    // -------------------------------
    const rows: any[] = [];

    for (const s of submissions) {
      const dealerName =
        s.dealers?.store_name ||
        s.dealers?.company_name ||
        `Dealer ${s.dealer_id ?? "-"}`;

      const loginNr = s.dealers?.login_nr ?? "-";

      const excelDate = s.created_at
        ? new Date(s.created_at)
        : new Date();

      if (!s.submission_items || s.submission_items.length === 0) {
        rows.push({
          ID: s.submission_id,
          Datum: excelDate,
          Typ: s.typ,
          Status: s.status,
          Händler: dealerName,
          Login: loginNr,
          Produkt: "",
          EAN: "",
          Menge: 0,
          Preis_CHF: 0,
          Zwischensumme_CHF: 0,
        });
      } else {
        for (const item of s.submission_items) {
          const qty = Number(item.menge ?? 0);
          const price = Number(item.preis ?? 0);

          rows.push({
            ID: s.submission_id,
            Datum: excelDate,
            Typ: s.typ,
            Status: s.status,
            Händler: dealerName,
            Login: loginNr,
            Produkt: item.products?.product_name ?? "",
            EAN: item.products?.ean ?? "",
            Menge: qty,
            Preis_CHF: price,
            Zwischensumme_CHF: +(qty * price).toFixed(2),
          });
        }
      }
    }

    // -------------------------------
    // 📘 Excel erstellen — *Next.js 14/15 kompatibel*
    // -------------------------------
    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-Spaltenbreite
    if (rows.length > 0) {
      const colWidths = Object.keys(rows[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...rows.map((r) => String(r[key] ?? "").length)
        ) + 2,
      }));
      ws["!cols"] = colWidths;
    }

    // Excel-Date-Format
    rows.forEach((r, i) => {
      const cell = ws[`B${i + 2}`]; // Spalte B = Datum
      if (cell && cell.v instanceof Date) {
        cell.t = "d";
        cell.z = "dd.mm.yyyy hh:mm";
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export");

    // -------------------------------
    // 🔥 Der funktionierende Export!
    // -------------------------------
    const arrayBuffer = XLSX.write(wb, {
      type: "array",     // ← WICHTIG! (statt "buffer")
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
