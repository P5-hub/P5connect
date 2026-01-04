import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TDealer } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const toCHF = (n: number) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("de-CH") : "-";

/* -------------------------------------------------------
   ROUTE
------------------------------------------------------- */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    /* ---------------------------------------------------
       SUBMISSION
    --------------------------------------------------- */

    const { data: submission } = await supabase
      .from("submissions")
      .select(`
        submission_id,
        dealer_id,
        created_at,
        status,
        dealer_reference,
        calendar_week,
        sony_share_qty,
        sony_share_revenue
      `)
      .eq("submission_id", id)
      .maybeSingle();

    if (!submission) {
      return new NextResponse("submission not found", { status: 404 });
    }

    /* ---------------------------------------------------
       DEALER
    --------------------------------------------------- */

    const { data: dealer } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", submission.dealer_id ?? 0)
      .maybeSingle();

    /* ---------------------------------------------------
       ITEMS
    --------------------------------------------------- */

    type Item = {
      menge: number | null;
      preis: number | null;
      product_name: string | null;
      ean: string | null;
    };

    const { data: itemsRaw } = await supabase
      .from("submission_items")
      .select("menge, preis, product_name, ean")
      .eq("submission_id", id);

    const items: Item[] = itemsRaw ?? [];

    /* ---------------------------------------------------
       BERECHNUNGEN
    --------------------------------------------------- */

    const sonyQty = items.reduce(
      (s, i) => s + (Number(i.menge) || 0),
      0
    );

    const sonyRevenue = items.reduce(
      (s, i) =>
        s + (Number(i.menge) || 0) * (Number(i.preis) || 0),
      0
    );

    const shareQty = submission.sony_share_qty ?? 0;
    const shareRevenue = submission.sony_share_revenue ?? 0;

    const totalQty =
      shareQty > 0 ? Math.round(sonyQty / (shareQty / 100)) : sonyQty;

    const totalRevenue =
      shareRevenue > 0
        ? sonyRevenue / (shareRevenue / 100)
        : sonyRevenue;

    /* ---------------------------------------------------
       PDF SETUP
    --------------------------------------------------- */

    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    const pageWidth = doc.page.width - 84;

    /* ---------------------------------------------------
       HEADER
    --------------------------------------------------- */

    doc.font(bold).fontSize(18).fillColor("#000");
    doc.text(`Verkaufsmeldung #${submission.submission_id}`);

    doc.moveDown(0.4);
    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Datum: ${formatDate(submission.created_at)}`);
    doc.text(`Status: ${submission.status ?? "-"}`);
    doc.text(`Referenz: ${submission.dealer_reference ?? "-"}`);

    /* ===================================================
       🔁 HÄNDLER (JETZT ZUERST)
    =================================================== */

    doc.moveDown(0.8);
    doc.font(bold).fontSize(11).fillColor("#000");
    doc.text("Händler");

    if (dealer) {
      doc.moveDown(0.2);
      doc.font(font).fontSize(10).fillColor("#333");

      doc.text(dealer.store_name ?? "-");

      const addr = [dealer.street, dealer.zip, dealer.city]
        .filter(Boolean)
        .join(" ");

      if (addr) doc.text(addr);
      if (dealer.login_nr) doc.text(`Kd-Nr.: ${dealer.login_nr}`);
      if (dealer.email) doc.text(`E-Mail: ${dealer.email}`);
      if (dealer.phone) doc.text(`Telefon: ${dealer.phone}`);
    }

    /* ===================================================
       🔁 VERKAUFSPARAMETER (JETZT NACH HÄNDLER)
    =================================================== */

    let y = doc.y + 20;

    doc
      .rect(42, y, pageWidth, 120)
      .strokeColor("#ddd")
      .stroke();

    doc.font(bold).fontSize(11).fillColor("#000");
    doc.text("Verkaufsparameter", 50, y + 10);

    doc.font(font).fontSize(10).fillColor("#333");

    const lx = 50;
    const rx = 300;

    doc.text(`Kalenderwoche: ${submission.calendar_week ?? "-"}`, lx, y + 30);
    doc.text(`SONY Anteil Stück: ${shareQty} %`, lx, y + 48);
    doc.text(`SONY Anteil Umsatz: ${shareRevenue} %`, lx, y + 66);

    doc.text(`SONY Stückzahl: ${sonyQty}`, rx, y + 30);
    doc.text(`Händler Gesamtstückzahl: ${totalQty}`, rx, y + 48);
    doc.text(`SONY Umsatz: ${toCHF(sonyRevenue)}`, rx, y + 66);
    doc.text(
      `Händler Gesamtumsatz: ${toCHF(totalRevenue)}`,
      rx,
      y + 84
    );

    doc.y = y + 140;

    /* ---------------------------------------------------
       PRODUKTE
    --------------------------------------------------- */

    doc.moveDown(0.6);
    doc.font(bold).fontSize(11).fillColor("#000");
    doc.text("Produkte");

    const tableTop = doc.y + 10;

    const col = {
      name: 42,
      ean: 260,
      qty: 410,
      price: 480,
    };


    doc.font(font).fontSize(10).fillColor("#555");
    doc.text("Produkt", col.name, tableTop);
    doc.text("EAN", col.ean, tableTop);

    doc.text("Menge", col.qty, tableTop, {
      width: 50,
      align: "right",
    });

    doc.text("Preis (CHF)", col.price, tableTop, {
      width: 70,
      align: "right",
    });


    doc
      .moveTo(42, tableTop + 14)
      .lineTo(553, tableTop + 14)
      .strokeColor("#ddd")
      .stroke();

    let rowY = tableTop + 22;

    items.forEach((i) => {
      doc.font(font).fillColor("#000");

      doc.text(i.product_name ?? "Produkt", col.name, rowY, {
        width: 220,
      });
      doc.text(i.ean ?? "-", col.ean, rowY);
      doc.text(String(i.menge ?? 0), col.qty, rowY, {
        width: 50,
        align: "right",
      });

      doc.text(
        toCHF(Number(i.preis) || 0),
        col.price,
        rowY,
        {
          width: 70,
          align: "right",
        }
      );


      rowY += 20;
    });

    doc.end();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="verkauf_${id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("❌ Verkauf-PDF Fehler:", e);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
