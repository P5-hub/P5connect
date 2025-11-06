import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { Database } from "@/types/supabase";

// 🔧 Typen direkt aus deinem Supabase-Schema:
type TDealer = Database["public"]["Tables"]["dealers"]["Row"];
// ✅ richtig
type TCashbackClaim = Database["public"]["Views"]["cashback_claims_view"]["Row"];


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

    if (!Number.isFinite(id)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // === CASHBACK CLAIM LADEN ===
    // === CASHBACK CLAIM LADEN ===
    const { data: claim, error: e1 } = await supabase
      .from("cashback_claims_view")
      .select("*")
      .eq("claim_id", id)
      .maybeSingle<TCashbackClaim>();

    if (e1) throw e1;
    if (!claim)
      return new NextResponse("cashback claim not found", { status: 404 });

    // === HÄNDLER LADEN ===
    const { data: dealer, error: e2 } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", claim.dealer_id ?? 0)
      .maybeSingle<TDealer>();

    if (e2) throw e2;


    // === PDF INITIALISIEREN ===
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    // === HEADER ===
    doc.font(bold).fontSize(16).fillColor("#000").text(`Cashback-Antrag #${claim.claim_id}`);
    doc.moveDown(0.3);

    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Erstellt am: ${formatDate(claim.created_at)}`);
    doc.text(`Status: ${claim.status || "-"}`);
    doc.text(`Typ: ${claim.cashback_type || "-"}`);
    doc.text(`Betrag (CHF): ${toCHF(claim.cashback_betrag)}`);

    // === PRODUKT- / SERIENNUMMERN ===
    doc.moveDown(0.4);
    doc.font(bold).fontSize(11).fillColor("#000").text("Produktdetails");
    doc.font(font).fontSize(10).fillColor("#333");

    doc.text(`Seriennummer: ${claim.seriennummer || "-"}`);
    if (claim.cashback_type?.toLowerCase() === "double cashback") {
      doc.text(`Soundbar EAN: ${claim.soundbar_ean || "-"}`);
      doc.text(`Soundbar Seriennummer: ${claim.seriennummer_sb || "-"}`);
    }

    // === BELEGE (mit klickbaren Links) ===
    if (claim.document_path || claim.document_path_sb) {
      doc.moveDown(0.5);
      doc.font(bold).fontSize(11).fillColor("#000").text("Belege");
      doc.font(font).fontSize(10).fillColor("#0070f3");

      if (claim.document_path) {
        doc.text("Produkt-Beleg öffnen", {
          link: claim.document_path,
          underline: true,
        });
      }

      if (claim.document_path_sb) {
        doc.text("Soundbar-Beleg öffnen", {
          link: claim.document_path_sb,
          underline: true,
        });
      }

      doc.fillColor("#333");
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

    // === PDF ENDE ===
    doc.end();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cashback_${claim.claim_id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Cashback-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}
