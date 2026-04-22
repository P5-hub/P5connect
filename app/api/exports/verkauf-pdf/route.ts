import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TDealer } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Item = {
  menge: number | null;
  preis: number | null;
  product_name: string | null;
  ean: string | null;
};

const toCHF = (n: number) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("de-CH") : "-";

const safeText = (value: unknown): string => {
  if (value === null || value === undefined) return "-";
  return String(value)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
};

function renderVerkaufPDFBuffer(args: {
  submission: any;
  dealer: TDealer | null;
  items: Item[];
  sonyQty: number;
  sonyRevenue: number;
  shareQty: number;
  shareRevenue: number;
  totalQty: number;
  totalRevenue: number;
}): Promise<Buffer> {
  const {
    submission,
    dealer,
    items,
    sonyQty,
    sonyRevenue,
    shareQty,
    shareRevenue,
    totalQty,
    totalRevenue,
  } = args;

  return new Promise((resolve, reject) => {
    try {
      const { doc, useFallback } = createPDFDocument({ margin: 42 });
      const font = useFallback ? "Helvetica" : "Body";
      const bold = useFallback ? "Helvetica-Bold" : "BodyBold";

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - 84;

      /* ===============================
         HEADER
      =============================== */
      doc.font(bold).fontSize(18).fillColor("#000");
      doc.text(`Verkaufsmeldung #${submission.submission_id}`);

      doc.moveDown(0.4);
      doc.font(font).fontSize(10).fillColor("#555");
      doc.text(`Datum: ${formatDate(submission.created_at)}`);
      doc.text(`Status: ${safeText(submission.status)}`);
      doc.text(`Referenz: ${safeText(submission.dealer_reference)}`);

      /* ===============================
         HÄNDLER
      =============================== */
      doc.moveDown(0.8);
      doc.font(bold).fontSize(11).fillColor("#000");
      doc.text("Händler");

      if (dealer) {
        doc.moveDown(0.2);
        doc.font(font).fontSize(10).fillColor("#333");

        doc.text(safeText(dealer.store_name || "-"));

        const addr = [dealer.street, dealer.zip, dealer.city]
          .filter(Boolean)
          .join(" ");

        if (addr) doc.text(safeText(addr));
        if (dealer.login_nr) doc.text(`Kd-Nr.: ${safeText(dealer.login_nr)}`);
        if (dealer.email) doc.text(`E-Mail: ${safeText(dealer.email)}`);
        if (dealer.phone) doc.text(`Telefon: ${safeText(dealer.phone)}`);
      }

      /* ===============================
         VERKAUFSPARAMETER
      =============================== */
      let y = doc.y + 20;

      doc.rect(42, y, pageWidth, 120).strokeColor("#ddd").stroke();

      doc.font(bold).fontSize(11).fillColor("#000");
      doc.text("Verkaufsparameter", 50, y + 10);

      doc.font(font).fontSize(10).fillColor("#333");

      const lx = 50;
      const rx = 300;

      doc.text(`Kalenderwoche: ${safeText(submission.calendar_week)}`, lx, y + 30);
      doc.text(`SONY Anteil Stück: ${shareQty} %`, lx, y + 48);
      doc.text(`SONY Anteil Umsatz: ${shareRevenue} %`, lx, y + 66);

      doc.text(`SONY Stückzahl: ${sonyQty}`, rx, y + 30);
      doc.text(`Händler Gesamtstückzahl: ${totalQty}`, rx, y + 48);
      doc.text(`SONY Umsatz: ${toCHF(sonyRevenue)}`, rx, y + 66);
      doc.text(`Händler Gesamtumsatz: ${toCHF(totalRevenue)}`, rx, y + 84);

      doc.y = y + 140;

      /* ===============================
         PRODUKTE
      =============================== */
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

      doc.moveTo(42, tableTop + 14)
        .lineTo(553, tableTop + 14)
        .strokeColor("#ddd")
        .stroke();

      let rowY = tableTop + 22;

      items.forEach((i) => {
        doc.font(font).fillColor("#000");

        doc.text(safeText(i.product_name ?? "Produkt"), col.name, rowY, {
          width: 220,
        });
        doc.text(safeText(i.ean ?? "-"), col.ean, rowY);
        doc.text(String(i.menge ?? 0), col.qty, rowY, {
          width: 50,
          align: "right",
        });
        doc.text(toCHF(Number(i.preis) || 0), col.price, rowY, {
          width: 70,
          align: "right",
        });

        rowY += 20;
      });

      /* ===============================
         FOOTER
      =============================== */
      doc.moveDown(1);
      doc.fontSize(8).fillColor("#999");
      doc.text(
        "P5connect • Automatisch generiertes Verkaufsdokument",
        42,
        Math.max(doc.y, rowY + 10),
        { align: "left" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { data: submission, error: submissionError } = await supabase
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

    if (submissionError) throw submissionError;

    if (!submission) {
      return new NextResponse("submission not found", { status: 404 });
    }

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", submission.dealer_id ?? 0)
      .maybeSingle();

    if (dealerError) throw dealerError;

    const { data: itemsRaw, error: itemsError } = await supabase
      .from("submission_items")
      .select("menge, preis, product_name, ean")
      .eq("submission_id", id);

    if (itemsError) throw itemsError;

    const items: Item[] = itemsRaw ?? [];

    const sonyQty = items.reduce((s, i) => s + (Number(i.menge) || 0), 0);
    const sonyRevenue = items.reduce(
      (s, i) => s + (Number(i.menge) || 0) * (Number(i.preis) || 0),
      0
    );

    const shareQty = Number(submission.sony_share_qty ?? 0);
    const shareRevenue = Number(submission.sony_share_revenue ?? 0);

    const totalQty =
      shareQty > 0 ? Math.round(sonyQty / (shareQty / 100)) : sonyQty;

    const totalRevenue =
      shareRevenue > 0
        ? sonyRevenue / (shareRevenue / 100)
        : sonyRevenue;

    const pdfBuffer = await renderVerkaufPDFBuffer({
      submission,
      dealer: dealer ?? null,
      items,
      sonyQty,
      sonyRevenue,
      shareQty,
      shareRevenue,
      totalQty,
      totalRevenue,
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="verkauf_${id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Verkauf-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}