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
    const { type } = await req.json();
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("submissions")
      .select(`
        submission_id,
        created_at,
        typ,
        status,
        dealer_id,
        dealers(login_nr, store_name, company_name),
        submission_items(product_id, menge, preis, products(product_name, ean))
      `)
      .eq("typ", type)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const submissions = (data ?? []) as SubmissionWithDealer[];

    const rows: any[] = [];

    for (const s of submissions) {
      const dealerName =
        s.dealers?.store_name ||
        s.dealers?.company_name ||
        `Dealer ${s.dealer_id ?? "-"}`;
      const loginNr = s.dealers?.login_nr ?? "-";

      if (!s.submission_items || s.submission_items.length === 0) {
        rows.push({
          ID: s.submission_id,
          Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
          Typ: s.typ,
          Status: s.status,
          Händler: dealerName,
          Login: loginNr,
          Produkt: "-",
          EAN: "-",
          Menge: 0,
          Preis_CHF: 0,
          Zwischensumme_CHF: 0,
        });
      } else {
        for (const i of s.submission_items) {
          rows.push({
            ID: s.submission_id,
            Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
            Typ: s.typ,
            Status: s.status,
            Händler: dealerName,
            Login: loginNr,
            Produkt: i.products?.product_name ?? "",
            EAN: i.products?.ean ?? "",
            Menge: Number(i.menge ?? 0),
            Preis_CHF: Number(i.preis ?? 0),
            Zwischensumme_CHF: +(Number(i.menge ?? 0) * Number(i.preis ?? 0)).toFixed(2),
          });
        }
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daten");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_alle.xlsx"`,
      },
    });
  } catch (e: any) {
    console.error("❌ Admin Export Error:", e);
    return NextResponse.json({ error: e?.message ?? "Export failed" }, { status: 500 });
  }
}
