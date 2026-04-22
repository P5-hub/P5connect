import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TDealer } from "@/types";

export type TSofortrabattClaim = {
  claim_id: number;
  dealer_id: number | null;
  submission_date: string | null;
  status: string | null;
  rabatt_level: string | null;
  rabatt_betrag: number | null;
  products: any;
  comment: string | null;
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

function renderSofortrabattPDFBuffer(args: {
  claim: TSofortrabattClaim;
  dealer: TDealer | null;
}): Promise<Buffer> {
  const { claim, dealer } = args;

  return new Promise((resolve, reject) => {
    try {
      const { doc, useFallback } = createPDFDocument({ margin: 42 });
      const font = useFallback ? "Helvetica" : "Body";
      const bold = useFallback ? "Helvetica-Bold" : "BodyBold";

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      let products: any[] = [];
      try {
        products =
          typeof claim.products === "string"
            ? JSON.parse(claim.products)
            : claim.products;
      } catch {
        products = [];
      }

      /* ===============================
         TITEL
      =============================== */
      doc.font(bold).fontSize(16).fillColor("#000");
      doc.text(`Sofortrabatt-Antrag #${claim.claim_id}`);
      doc.moveDown(0.6);

      /* ===============================
         HÄNDLER
      =============================== */
      if (dealer) {
        const name =
          dealer.store_name ||
          (dealer as any).company_name ||
          (dealer as any).firma ||
          "-";

        const address = [
          (dealer as any).address || (dealer as any).strasse,
          dealer.plz ?? dealer.zip,
          dealer.city,
        ]
          .filter(Boolean)
          .join(" ");

        doc.font(bold).fontSize(11).fillColor("#000").text(safeText(name));
        doc.font(font).fontSize(10).fillColor("#333");
        if (address) doc.text(safeText(address));
        doc.text(`Kd.-Nr.: ${safeText(dealer.login_nr)}`);
        if (dealer.email) doc.text(`E-Mail: ${safeText(dealer.email)}`);
        if (dealer.phone) doc.text(`Telefon: ${safeText(dealer.phone)}`);
      }

      doc.moveDown(1.2);

      /* ===============================
         ANTRAGSDETAILS
      =============================== */
      doc.font(font).fontSize(10).fillColor("#555");
      doc.text(`Datum: ${formatDate(claim.submission_date)}`);
      doc.text(`Status: ${safeText(claim.status)}`);
      doc.text(`Rabatt-Level: ${safeText(claim.rabatt_level)}`);
      doc.text(`Rabattbetrag: CHF ${toCHF(claim.rabatt_betrag)}`);

      /* ===============================
         PRODUKTE
      =============================== */
      let tableEndY: number | null = null;

      if (Array.isArray(products) && products.length > 0) {
        doc.moveDown(0.8);
        doc.font(bold).fontSize(11).fillColor("#000").text("Produkte");
        doc.moveDown(0.4);

        const startX = 42;
        let y = doc.y;

        const colProduct = startX;
        const colCategory = 200;
        const colEAN = 360;
        const colQty = 480;

        doc.font(bold).fontSize(9);
        doc.text("Produkt", colProduct, y);
        doc.text("Kategorie", colCategory, y);
        doc.text("EAN", colEAN, y);
        doc.text("Menge", colQty, y);

        y += 12;
        doc.moveTo(startX, y).lineTo(540, y).strokeColor("#ddd").stroke();
        y += 6;

        doc.font(font).fontSize(9).fillColor("#333");

        for (const p of products) {
          doc.text(safeText(p.product_name || "-"), colProduct, y, { width: 140 });
          doc.text(safeText(p.category || "-"), colCategory, y, { width: 140 });
          doc.text(safeText(p.ean || "-"), colEAN, y, { width: 100 });
          doc.text(String(p.qty ?? 1), colQty, y);

          y += 14;
        }

        tableEndY = y;
      }

      /* ===============================
         KOMMENTAR
      =============================== */
      if (claim.comment) {
        if (tableEndY !== null) {
          doc.y = Math.max(doc.y, tableEndY + 10);
          doc.x = 42;
        }

        doc.moveDown(0.4);
        doc.font(bold).fontSize(11).fillColor("#000").text("Kommentar");
        doc.font(font).fontSize(10).fillColor("#333").text(safeText(claim.comment));
      }

      /* ===============================
         FOOTER
      =============================== */
      doc.moveDown(1.5);
      doc.font(font).fontSize(8).fillColor("#999");
      doc.text("P5connect – Sofortrabatt-System • Automatisch generiertes Dokument");

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

    const { data: claim, error: claimError } = await supabase
      .from("sofortrabatt_claims")
      .select(
        "claim_id, dealer_id, submission_date, status, rabatt_level, rabatt_betrag, products, comment"
      )
      .eq("claim_id", id)
      .maybeSingle();

    if (claimError) throw claimError;

    if (!claim) {
      return new NextResponse("sofortrabatt claim not found", { status: 404 });
    }

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", claim.dealer_id ?? 0)
      .maybeSingle();

    if (dealerError) throw dealerError;

    const pdfBuffer = await renderSofortrabattPDFBuffer({
      claim: claim as TSofortrabattClaim,
      dealer: dealer ?? null,
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sofortrabatt_${claim.claim_id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}