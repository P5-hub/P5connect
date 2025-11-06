import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TDealer } from "@/types";

export type TSupportClaim = {
  claim_id: number;
  dealer_id: number | null;
  created_at: string | null;
  submission_date: string | null;
  status: string | null;
  support_typ: string | null;
  produkte: any;
  comment: string | null;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // === SUPPORT-CLAIM LADEN ===
    const { data: claimData, error: e1 } = await supabase
      .from("support_claims")
      .select(`
        claim_id, dealer_id, created_at, submission_date, status,
        support_typ, produkte, comment
      `)
      .eq("claim_id", id)
      .maybeSingle();

    if (e1) throw e1;
    if (!claimData)
      return new NextResponse("support claim not found", { status: 404 });

    const claim = claimData as TSupportClaim;

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
      .text(`Supportfall #${claim.claim_id}`);
    doc.moveDown(0.3);
    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Erstellt: ${formatDate(claim.created_at)}`);
    doc.text(`Status: ${claim.status || "-"}`);
    doc.text(`Typ: ${claim.support_typ || "-"}`);

    // === PRODUKTE ===
    if (claim.produkte) {
      doc.moveDown(0.4);
      doc.font(bold).text("Produkte:");
      doc.font(font).fillColor("#333");

      try {
        const parsed =
          typeof claim.produkte === "string"
            ? JSON.parse(claim.produkte)
            : claim.produkte;
        doc.text(JSON.stringify(parsed, null, 2));
      } catch {
        doc.text(String(claim.produkte));
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
        "Content-Disposition": `attachment; filename="support_${claim.claim_id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Support-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}
