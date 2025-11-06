import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { Readable } from "node:stream";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TProject, TDealer } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("de-CH") : "-";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return new NextResponse("invalid id", { status: 400 });
    }

    // 👉 id als String belassen (Supabase erwartet string in eq)
    const id = idParam.trim();

    const supabase = await getSupabaseServer();

    // === PROJEKT LADEN ===
    const { data: projData, error: e1 } = await supabase
      .from("project_requests")
      .select(`
        id, dealer_id, store_name, project_type, project_name,
        customer, location, start_date, end_date, comment,
        created_at, project_date
      `)
      .eq("id", id) // ✅ String statt number
      .maybeSingle();

    if (e1) throw e1;
    if (!projData) {
      return new NextResponse("project not found", { status: 404 });
    }

    const proj = projData as TProject;

    // === HÄNDLER LADEN ===
    const { data: dealerData, error: e2 } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", proj.dealer_id ?? 0)
      .maybeSingle();

    if (e2) throw e2;
    const dealer = dealerData as TDealer | null;

    // === PDF INITIALISIEREN ===
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const stream = doc as unknown as Readable;

    // === HEADER ===
    doc.font(bold).fontSize(16).fillColor("#000").text("Projektanfrage");
    doc.moveDown(0.3);
    doc.font(font).fontSize(10).fillColor("#555");

    doc.text(`Projekt-ID: ${proj.id}`);
    doc.text(`Projektname: ${proj.project_name || "-"}`);
    doc.text(`Typ: ${proj.project_type || "-"}`);
    doc.text(`Kunde: ${proj.customer || "-"}`);
    doc.text(`Ort: ${proj.location || "-"}`);
    doc.text(`Start: ${proj.start_date || "-"}`);
    doc.text(`Ende: ${proj.end_date || "-"}`);
    doc.text(`Erstellt am: ${formatDate(proj.created_at)}`);

    if (proj.comment) {
      doc.moveDown(0.4);
      doc.fillColor("#333").text(`Kommentar: ${proj.comment}`);
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
        "Content-Disposition": `attachment; filename="projekt_${proj.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("❌ Projekt-PDF Fehler:", e);
    return new NextResponse(e?.message || "PDF generation failed", {
      status: 500,
    });
  }
}
