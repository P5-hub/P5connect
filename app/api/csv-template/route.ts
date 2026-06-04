// app/api/csv-template/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";

// Hilfsfunktion für CSV-Zeilen
function toCSVRow(fields: (string | number | null | undefined)[]) {
  return fields
    .map((v) => {
      if (v === null || v === undefined) return "";
      const s = String(v).replace(/\r?\n|\r/g, " ").trim();
      if (/[;""]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    })
    .join(";");
}

// Typdefinition für Datensätze aus product_view
type ProductRow = {
  ean: string | null;
  product_name: string | null;
  brand: string | null;
  retail_price: number | null;
};

export async function GET() {
  try {
    const supabase = await getSupabaseServer();

    const { data, error } = await supabase
      .from("product_view")
      .select("ean, product_name, brand, retail_price")
      .limit(3);

    if (error) throw error;

    const products = (data ?? []) as ProductRow[];

    const header = [
      "EAN",
      "Produktname",
      "Menge",
      "Lagerbestand",
      "Verkaufspreis",
      "Seriennummer",
      "Datum",
      "Lagerdatum",
      "Kommentar",
    ];

    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);

    const rows = products.map((p) =>
      toCSVRow([
        p.ean ?? "",
        `${p.brand ?? ""} ${p.product_name ?? ""}`.trim(),

        0, // Menge verkauft
        1, // Lagerbestand

        p.retail_price ?? "",

        (p.ean || "")
          .replace(/\D/g, "")
          .slice(-7)
          .padStart(7, "0"),

        dateStr, // Verkaufsdatum
        dateStr, // Lagerdatum

        "",
      ])
    );

    const csv = [toCSVRow(header), ...rows].join("\r\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="verkauf_template_${dateStr}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("CSV Template Error:", err);

    return NextResponse.json(
      {
        error: err.message || "Server error",
      },
      {
        status: 500,
      }
    );
  }
}