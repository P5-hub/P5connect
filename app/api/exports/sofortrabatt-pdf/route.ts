import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
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

const toCHF = (n: any) => (Number(n) || 0).toFixed(2);
const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("de-CH") : "-";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isFinite(id)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // ===============================
    // CLAIM LADEN
    // ===============================
    const { data: claim } = await supabase
      .from("sofortrabatt_claims")
      .select(
        "claim_id, dealer_id, submission_date, status, rabatt_level, rabatt_betrag, products, comment"
      )
      .eq("claim_id", id)
      .maybeSingle();

    if (!claim) {
      return new NextResponse("sofortrabatt claim not found", { status: 404 });
    }

    // ===============================
    // HÄNDLER LADEN
    // ===============================
    const { data: dealer } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", claim.dealer_id ?? 0)
      .maybeSingle();

    // ===============================
    // PDF INITIALISIEREN
    // ===============================
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    

    // ===============================
    // TITEL
    // ===============================
    doc.font(bold).fontSize(16).fillColor("#000");
    doc.text(`Sofortrabatt-Antrag #${claim.claim_id}`);
    doc.moveDown(0.6);



    // ===============================
    // HÄNDLER (AB SENDER – GANZ OBEN)
    // ===============================
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

      doc.font(bold).fontSize(11).fillColor("#000").text(name);
      doc.font(font).fontSize(10).fillColor("#333");
      if (address) doc.text(address);
      doc.text(`Kd.-Nr.: ${dealer.login_nr || "-"}`);
      if (dealer.email) doc.text(`E-Mail: ${dealer.email}`);
      if (dealer.phone) doc.text(`Telefon: ${dealer.phone}`);
    }

    doc.moveDown(1.2);



    // ===============================
    // ANTRAGSDETAILS
    // ===============================
    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Datum: ${formatDate(claim.submission_date)}`);
    doc.text(`Status: ${claim.status || "-"}`);
    doc.text(`Rabatt-Level: ${claim.rabatt_level || "-"}`);
    doc.text(`Rabattbetrag: CHF ${toCHF(claim.rabatt_betrag)}`);


    // ===============================
    // PRODUKTE (SAUBERE TABELLE) + KOMMENTAR
    // ===============================
    let products: any[] = [];
    try {
      products =
        typeof claim.products === "string"
          ? JSON.parse(claim.products)
          : claim.products;
    } catch {
      products = [];
    }

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
        doc.text(p.product_name || "-", colProduct, y, { width: 140 });
        doc.text(p.category || "-", colCategory, y, { width: 140 });
        doc.text(p.ean || "-", colEAN, y, { width: 100 });
        doc.text("1", colQty, y);

        y += 14;
      }

      tableEndY = y;
    }

    // ===============================
    // KOMMENTAR (korrekt unterhalb Tabelle)
    // ===============================
    if (claim.comment) {
      if (tableEndY !== null) {
        doc.y = Math.max(doc.y, tableEndY + 10);
        doc.x = 42;
      }

      doc.moveDown(0.4);
      doc.font(bold).fontSize(11).fillColor("#000").text("Kommentar");
      doc.font(font).fontSize(10).fillColor("#333").text(claim.comment);
    }

    // ===============================
    // FOOTER
    // ===============================
    doc.moveDown(1.5);
    doc.font(font).fontSize(8).fillColor("#999");
    doc.text("P5connect – Sofortrabatt-System • Automatisch generiertes Dokument");

    doc.end();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="sofortrabatt_${claim.claim_id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Sofortrabatt-PDF Fehler:", e);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
