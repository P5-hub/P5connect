import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";
import { calcCampaignPrice } from "@/lib/helpers/campaignPricing";

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
    .from("v_dealer_campaign_price_list")
    .select("*")
    .eq("dealer_id", dealerId)
    .order("sony_article", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Keine aktive Kampagne vorhanden." },
      { status: 404 }
    );
  }

  const rows = data.map((p: any) => {
    const pricing = calcCampaignPrice({
      upe_brutto: Number(p.retail_price ?? 0),
      dealer_invoice_price: null,
      vrg_amount: Number(p.vrg ?? 0),
      mwst_rate: 8.1,
      mode:
        p.pricing_mode === "display"
          ? "display"
          : p.pricing_mode === "messe"
          ? "messe"
          : "standard",
      messe_price_netto: p.messe_price_netto,
      display_factor_percent: p.display_discount_percent,
    });

    return {
      Kampagne: p.campaign_name,
      Gültig_von: p.start_date,
      Gültig_bis: p.end_date,
      "Sony Artikel": p.sony_article,
      EAN: p.ean,
      Produktname: p.product_name,
      Gruppe: p.gruppe,
      Kategorie: p.category,
      "UPE brutto": p.retail_price,
      VRG: p.vrg,
      "Messepreis netto": p.messe_price_netto,
      "Displaypreis netto": pricing.display_price_netto,
      Modus: p.pricing_mode,
      "Display Menge": p.display_qty,
      "Max. Display": p.max_display_qty_per_dealer,
      "Max. Messe": p.max_messe_qty_per_dealer,
      "Max. Total": p.max_total_qty_per_dealer,
    };
  });

  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    ws["!cols"] = [
      { wch: 34 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 16 },
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Kampagnen Preisliste");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
      cellStyles: true,
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="kampagnen-preisliste.xlsx"`,
      },
    });
  }

  const headers = Object.keys(rows[0]);
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
      "Content-Disposition": `attachment; filename="kampagnen-preisliste.csv"`,
    },
  });
}