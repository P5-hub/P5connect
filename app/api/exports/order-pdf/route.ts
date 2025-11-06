import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { Database } from "@/types/supabase";

// 🔧 lokale Alias-Typen aus der generierten Supabase-Datei:
type TSubmission = Database["public"]["Tables"]["submissions"]["Row"];
type TDealer = Database["public"]["Tables"]["dealers"]["Row"];
type TSubmissionItem = Database["public"]["Tables"]["submission_items"]["Row"];

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

    // === SUBMISSION LADEN ===
    const { data: sub, error: e1 } = await supabase
      .from("submissions")
      .select(
        `
        submission_id, dealer_id, created_at, typ, status,
        dealer_reference, order_comment, calendar_week
      `
      )
      .eq("submission_id", id)
      .maybeSingle<TSubmission>();

    if (e1) throw e1;
    if (!sub) return new NextResponse("submission not found", { status: 404 });

    // === HÄNDLER LADEN ===
    const { data: dealer, error: e2 } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", sub.dealer_id ?? 0)
      .maybeSingle<TDealer>();

    if (e2) throw e2;

    // === POSITIONEN LADEN ===
    const { data: items, error: e3 } = await supabase
      .from("submission_items")
      .select(`menge, preis, products(product_name, ean)`)
      .eq("submission_id", id)
      .returns<TSubmissionItem[]>();

    if (e3) throw e3;

    // === PDF INITIALISIEREN ===
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    // === HEADER ===
    doc.font(bold).fontSize(16).fillColor("#000").text(`Bestellung #${sub.submission_id}`);
    doc.moveDown(0.3);
    doc.font(font).fontSize(10).fillColor("#555");
    doc.text(`Datum: ${formatDate(sub.created_at)}`);
    doc.text(`Status: ${sub.status || "-"}`);
    doc.text(`Kalenderwoche: ${sub.calendar_week || "-"}`);
    doc.text(`Referenz: ${sub.dealer_reference || "-"}`);

    if (sub.order_comment) {
      doc.moveDown(0.3);
      doc.fillColor("#333").text(`Kommentar: ${sub.order_comment}`);
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

    // === PRODUKTE ===
    doc.moveDown(0.8);
    doc.font(bold).fontSize(11).fillColor("#000").text("Produkte");
    doc.moveDown(0.2);
    doc.font(font).fontSize(10).fillColor("#555");

    const colX = { name: 42, ean: 300, qty: 450, price: 510 };
    doc.text("Produkt", colX.name, doc.y, { width: 240 });
    doc.text("EAN", colX.ean, doc.y, { width: 120 });
    doc.text("Menge", colX.qty, doc.y, { width: 50, align: "right" });
    doc.text("Preis (CHF)", colX.price, doc.y, { width: 70, align: "right" });

    doc.moveDown(0.1);
    doc.moveTo(42, doc.y).lineTo(553, doc.y).strokeColor("#ddd").stroke();
    doc.fillColor("#000").font(font);

    let totalQty = 0;
    let totalSum = 0;

    for (const it of items || []) {
      // @ts-ignore – Supabase liefert manchmal products als Array
      const product = Array.isArray(it.products) ? it.products[0] : it.products;

      const name = product?.product_name || "Produkt";
      const ean = product?.ean || "-";
      const qty = Number(it.menge) || 0;
      const price = Number(it.preis) || 0;

      totalQty += qty;
      totalSum += qty * price;

      doc.moveDown(0.2);
      doc.text(name, colX.name, doc.y, { width: 240 });
      doc.text(ean, colX.ean, doc.y, { width: 110 });
      doc.text(String(qty), colX.qty, doc.y, { width: 50, align: "right" });
      doc.text(toCHF(price), colX.price, doc.y, { width: 70, align: "right" });
    }

    doc.moveDown(0.2);
    doc.moveTo(42, doc.y).lineTo(553, doc.y).strokeColor("#ddd").stroke();
    doc.moveDown(0.2);
    doc.font(bold).fontSize(10).fillColor("#000");
    doc.text("Summe", colX.name, doc.y, { width: 240 });
    doc.text("", colX.ean, doc.y, { width: 110 });
    doc.text(String(totalQty), colX.qty, doc.y, { width: 50, align: "right" });
    doc.text(toCHF(totalSum), colX.price, doc.y, { width: 70, align: "right" });

    doc.end();

    return new Response(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="order_${id}.pdf"`,
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
