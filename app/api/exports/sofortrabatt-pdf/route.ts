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
    const idParam = searchParams.get("id");
    const id = idParam ? Number(idParam) : NaN;

    // ✅ ID prüfen
    if (!Number.isFinite(id)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // === CLAIM LADEN ===
    const { data: claimData, error: e1 } = await supabase
      .from("sofortrabatt_claims")
      .select(`
        claim_id, dealer_id, submission_date, status,
        rabatt_level, rabatt_betrag, products, comment
      `)
      .eq("claim_id", id)
      .maybeSingle();

    if (e1) throw e1;
    if (!claimData)
      return new NextResponse("sofortrabatt claim not found", { status: 404 });

    const claim = claimData as TSofortrabattClaim;

    // === HÄNDLER LADEN ===
    const { data: dealerData, error: e2 } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", claim.dealer_id ?? 0)
      .maybeSingle();

    if (e2) throw e2;
    const dealer = dealerData as TDealer | null;

    // === PDF INITIALISIEREN ===
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    // === HEADER ===
    doc.font(bold)
      .fontSize(16)
      .fillColor("#000")
      .text(`Sofortrabatt-Antrag #${claim.claim_id}`);
    doc.moveDown(0.3);
    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Datum: ${formatDate(claim.submission_date)}`);
    doc.text(`Status: ${claim.status || "-"}`);
    doc.text(`Rabatt-Level: ${claim.rabatt_level || "-"}`);
    doc.text(`Rabattbetrag (CHF): ${toCHF(claim.rabatt_betrag)}`);

    // === PRODUKTE ===
    if (claim.products) {
      doc.moveDown(0.4);
      doc.font(bold).text("Produkte:");
      doc.font(font).fillColor("#333");
      try {
        const parsed =
          typeof claim.products === "string"
            ? JSON.parse(claim.products)
            : claim.products;
        doc.text(JSON.stringify(parsed, null, 2));
      } catch {
        doc.text(String(claim.products));
      }
    }

    // === KOMMENTAR ===
    if (claim.comment) {
      doc.moveDown(0.4);
      doc.fillColor("#333").text(`Kommentar: ${claim.comment}`);
    }

    // === HÄNDLERDATEN ===
    if (dealer) {
      const name =
        dealer.store_name ||
        (dealer as any).company_name ||
        (dealer as any).firma ||
        (dealer as any).company ||
        "-";

      const zip = dealer.plz ?? dealer.zip ?? "";
      const address =
        (dealer as any)["address"] ||
        (dealer as any)["street"] ||
        (dealer as any)["strasse"] ||
        "";
      const addr = [address, zip, dealer.city].filter(Boolean).join(" ");

      doc.moveDown(0.8);
      doc.font(bold).fontSize(11).fillColor("#000").text("Händler");
      doc.font(font).fontSize(10).fillColor("#333");
      doc.text(name);
      if (addr) doc.text(addr);
      doc.text(`Kd-Nr.: ${dealer.login_nr || "-"}`);
      if (dealer.email) doc.text(`E-Mail: ${dealer.email}`);
      if (dealer.phone) doc.text(`Telefon: ${dealer.phone}`);
    }

    // === PDF FINALISIEREN ===
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
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}
