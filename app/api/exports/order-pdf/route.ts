import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { Database } from "@/types/supabase";

type TSubmission = Database["public"]["Tables"]["submissions"]["Row"];
type TDealer = Database["public"]["Tables"]["dealers"]["Row"];
type TSubmissionItem =
  Database["public"]["Tables"]["submission_items"]["Row"] & {
    products?: {
      product_name: string | null;
      ean: string | null;
    } | null;
  };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toCHF = (n: unknown) => (Number(n) || 0).toFixed(2);

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

function renderOrderPDFBuffer(args: {
  sub: TSubmission;
  dealer: TDealer | null;
  items: TSubmissionItem[];
}): Promise<Buffer> {
  const { sub, dealer, items } = args;

  return new Promise((resolve, reject) => {
    try {
      const { doc, useFallback } = createPDFDocument({ margin: 42 });
      const font = useFallback ? "Helvetica" : "Body";
      const bold = useFallback ? "Helvetica-Bold" : "BodyBold";

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      /* ===============================
         HEADER
      =============================== */
      doc.font(bold).fontSize(16).fillColor("#000");
      doc.text(`Bestellung #${sub.submission_id}`);

      doc.moveDown(0.4);
      doc.font(font).fontSize(10).fillColor("#555");
      doc.text(`Datum: ${formatDate(sub.created_at)}`);
      doc.text(`Status: ${safeText(sub.status)}`);
      doc.text(`Kalenderwoche: ${safeText(sub.calendar_week)}`);
      doc.text(`Referenz: ${safeText(sub.dealer_reference)}`);

      /* ===============================
         DEALER
      =============================== */
      if (dealer) {
        const name = dealer.store_name || "-";
        const address = [
          dealer.street ?? "",
          dealer.plz ?? dealer.zip ?? "",
          dealer.city ?? "",
        ]
          .filter(Boolean)
          .join(" ");

        doc.moveDown(0.8);
        doc.font(bold).fontSize(11).fillColor("#000").text("Händler");
        doc.font(font).fontSize(10).fillColor("#333");
        doc.text(safeText(name));
        if (address) doc.text(safeText(address));
        doc.text(`Kd-Nr.: ${safeText(dealer.login_nr)}`);
        if (dealer.email) doc.text(`E-Mail: ${safeText(dealer.email)}`);
        if (dealer.phone) doc.text(`Telefon: ${safeText(dealer.phone)}`);
      }

      /* ===============================
         PRODUCTS
      =============================== */
      doc.moveDown(0.8);
      doc.font(bold).fontSize(11).fillColor("#000").text("Produkte");
      doc.moveDown(0.3);

      const col = { name: 42, ean: 300, qty: 440, price: 500 };
      const tableTop = doc.y;

      doc.font(bold).fontSize(10).fillColor("#333");
      doc.text("Produkt", col.name, tableTop);
      doc.text("EAN", col.ean, tableTop);
      doc.text("Menge", col.qty, tableTop, { width: 40, align: "right" });
      doc.text("Preis (CHF)", col.price, tableTop, {
        width: 60,
        align: "right",
      });

      doc.moveTo(42, tableTop + 14)
        .lineTo(553, tableTop + 14)
        .strokeColor("#ccc")
        .stroke();

      doc.font(font).fillColor("#000");

      let rowY = tableTop + 20;
      let totalQty = 0;
      let totalSum = 0;

      for (const it of items || []) {
        const product = it.products;
        const name = product?.product_name || "Produkt";
        const ean = product?.ean || "-";
        const qty = Number(it.menge) || 0;
        const price = Number(it.preis) || 0;

        totalQty += qty;
        totalSum += qty * price;

        doc.text(safeText(name), col.name, rowY, { width: 240 });
        doc.text(safeText(ean), col.ean, rowY);
        doc.text(String(qty), col.qty, rowY, {
          width: 40,
          align: "right",
        });
        doc.text(toCHF(price), col.price, rowY, {
          width: 60,
          align: "right",
        });

        rowY += 16;
      }

      doc.moveTo(42, rowY + 2)
        .lineTo(553, rowY + 2)
        .strokeColor("#000")
        .stroke();

      rowY += 6;
      doc.font(bold);
      doc.text("Summe", col.name, rowY);
      doc.text("", col.ean, rowY);
      doc.text(String(totalQty), col.qty, rowY, {
        width: 40,
        align: "right",
      });
      doc.text(toCHF(totalSum), col.price, rowY, {
        width: 60,
        align: "right",
      });

      /* ===============================
         COMMENT
      =============================== */
      if (sub.order_comment) {
        const commentY = rowY + 30;

        doc.font(bold)
          .fontSize(10)
          .fillColor("#000")
          .text("Kommentar", 42, commentY);

        doc.moveDown(0.3);

        doc.font(font)
          .fontSize(10)
          .fillColor("#333")
          .text(safeText(sub.order_comment), 42, doc.y, {
            width: 400,
            align: "left",
          });
      }

      /* ===============================
         FOOTER
      =============================== */
      doc.moveDown(1);
      doc.fontSize(8).fillColor("#999");
      doc.text(
        "P5connect • Automatisch generiertes Bestelldokument",
        42,
        doc.y,
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

    const { data: sub, error: subError } = await supabase
      .from("submissions")
      .select(`
        submission_id,
        dealer_id,
        created_at,
        status,
        dealer_reference,
        order_comment,
        calendar_week
      `)
      .eq("submission_id", id)
      .maybeSingle<TSubmission>();

    if (subError) throw subError;
    if (!sub) {
      return new NextResponse("order submission not found", { status: 404 });
    }

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", sub.dealer_id ?? 0)
      .maybeSingle<TDealer>();

    if (dealerError) throw dealerError;

    const { data: items, error: itemsError } = await supabase
      .from("submission_items")
      .select(`menge, preis, products(product_name, ean)`)
      .eq("submission_id", id)
      .returns<TSubmissionItem[]>();

    if (itemsError) throw itemsError;

    const pdfBuffer = await renderOrderPDFBuffer({
      sub,
      dealer: dealer ?? null,
      items: items ?? [],
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bestellung_${id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Order-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}