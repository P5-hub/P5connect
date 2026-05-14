import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

function formatCsvValue(value: any) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\|/g, " ").replace(/\r?\n/g, " ");
}

export async function GET(req: NextRequest) {
  const auth = await getApiDealerContext(req);

  if (!auth.ok) return auth.response;

  const dealerId = auth.ctx.effectiveDealerId;
  const format = req.nextUrl.searchParams.get("format") || "csv";

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("v_dealer_standard_price_list")
    .select("*")
    .eq("dealer_id", dealerId)
    .order("sony_article", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []).map((p: any) => ({
    "Sony Artikel": p.sony_article,
    EAN: p.ean,
    Produktname: p.product_name,    
    Gruppe: p.gruppe,
    Kategorie: p.category,
    "UPE brutto": p.retail_price,
    VRG: p.vrg,
    "Händlerpreis": p.dealer_price, 
    TP: p.toppreise_allowed ? "Ja" : "Nein",
  }));

if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

    for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
        cell.s = {
            font: { bold: true },
            alignment: { horizontal: "center" },
        };
        }
    }

    ws["!cols"] = [
    { wch: 18 }, // Sony Artikel
    { wch: 16 }, // EAN
    { wch: 28 }, // Produktname
    { wch: 18 }, // Gruppe
    { wch: 18 }, // Kategorie
    { wch: 12 }, // UPE brutto
    { wch: 10 }, // VRG
    { wch: 14 }, // Händlerpreis
    { wch: 8 },  // TP
    ];

    ws["!freeze"] = { xSplit: 0, ySplit: 1 };

    XLSX.utils.book_append_sheet(wb, ws, "Standard Preisliste");

    const buffer = XLSX.write(wb, {
        type: "buffer",
        bookType: "xlsx",
        cellStyles: true,
    });

    return new NextResponse(buffer, {
        headers: {
        "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="standard-preisliste.xlsx"`,
        },
    });
    }

  const headers = Object.keys(rows[0] || {
    "Sony Artikel": "",
    EAN: "",
    Produktname: "",
    Gruppe: "",
    Kategorie: "",
    "UPE brutto": "",
    VRG: "",
    "Händlerpreis": "",        
    TP: "",
  });

  const csvBody = [
    headers.join("|"),
    ...rows.map((row: any) =>
      headers.map((h) => formatCsvValue(row[h])).join("|")
    ),
  ].join("\r\n");

    const csv = "\uFEFF" + csvBody;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="standard-preisliste.csv"`,
    },
  });
}