// app/api/exports/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import * as XLSX from "xlsx";

// 🔹 Typdefinitionen
type SubmissionItem = {
  product_id: number | null;
  menge: number | null;
  preis: number | null;
  products?: {
    product_name: string | null;
    ean: string | null;
  } | null;
};

type SubmissionWithItems = {
  submission_id: number;
  created_at: string | null;
  status: string | null;
  distributor: string | null;
  dealer_reference: string | null;
  requested_delivery: string | null;
  requested_delivery_date: string | null;
  customer_number: string | null;
  customer_contact: string | null;
  customer_phone: string | null;
  submission_items?: SubmissionItem[] | null;
};

export async function POST(req: NextRequest) {
  try {
    const { dealerId, last, type } = await req.json();

    if (!dealerId) {
      return NextResponse.json({ error: "dealerId required" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "type required" }, { status: 400 });
    }

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
      .eq("type", type) // 🔹 jetzt dynamisch: bestellung, verkauf, projekt, etc.
      .order("created_at", { ascending: false });

    if (error) throw error;

    const submissions = (data ?? []) as SubmissionWithItems[];

    const take =
      Number.isFinite(+last) && +last > 0
        ? +last
        : submissions.length || 0;

    const rows: any[] = [];

    submissions.slice(0, take).forEach((s) => {
      const items = (s.submission_items || []) as SubmissionItem[];

      if (items.length === 0) {
        rows.push({
          ID: s.submission_id,
          Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
          Status: s.status,
          Distributor: (s.distributor || "").toUpperCase(),
          Referenz: s.dealer_reference || "",
          Lieferung: s.requested_delivery || "",
          Lieferdatum: s.requested_delivery_date || "",
          KdNr: s.customer_number || "",
          Ansprechpartner: s.customer_contact || "",
          Telefon: s.customer_phone || "",
          Produkt: "-",
          EAN: "-",
          Menge: 0,
          Preis_CHF: 0,
          Zwischensumme_CHF: 0,
        });
      } else {
        items.forEach((it) => {
          const name = it.products?.product_name || "";
          const ean = it.products?.ean || "";
          const menge = Number(it.menge || 0);
          const preis = Number(it.preis || 0);
          rows.push({
            ID: s.submission_id,
            Datum: new Date(s.created_at || "").toLocaleString("de-CH"),
            Status: s.status,
            Distributor: (s.distributor || "").toUpperCase(),
            Referenz: s.dealer_reference || "",
            Lieferung: s.requested_delivery || "",
            Lieferdatum: s.requested_delivery_date || "",
            KdNr: s.customer_number || "",
            Ansprechpartner: s.customer_contact || "",
            Telefon: s.customer_phone || "",
            Produkt: name,
            EAN: ean,
            Menge: menge,
            Preis_CHF: preis,
            Zwischensumme_CHF: +(menge * preis).toFixed(2),
          });
        });
      }
    });

    // 🔹 Excel erzeugen
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Verlauf");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}-verlauf.xlsx"`, // 🔹 dynamischer Dateiname
      },
    });
  } catch (e: any) {
    console.error("❌ Export Error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Export failed" },
      { status: 500 }
    );
  }
}
