import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleString("de-CH") : "-";

type SubmissionItem = {
  product_name: string | null;
  menge: number | null;
  preis: number | null;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    if (!idParam) return new NextResponse("invalid id", { status: 400 });

    const submissionId = Number(idParam);
    if (!Number.isFinite(submissionId)) {
      return new NextResponse("invalid submission id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // ================= DATA =================
    const { data: submission } = await supabase
      .from("submissions")
      .select("submission_id, dealer_id, project_id, kommentar, created_at")
      .eq("submission_id", submissionId)
      .eq("typ", "projekt")
      .maybeSingle();

    if (!submission || !submission.project_id) {
      return new NextResponse("project submission not found", { status: 404 });
    }

    const { data: proj } = await supabase
      .from("project_requests")
      .select(`
        project_type,
        project_name,
        customer,
        location,
        start_date,
        end_date,
        comment,
        created_at
      `)
      .eq("id", submission.project_id)
      .maybeSingle();

    const { data: dealer } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", submission.dealer_id ?? 0)
      .maybeSingle();

    const { data: products } = await supabase
      .from("submission_items")
      .select("product_name, menge, preis")
      .eq("submission_id", submission.submission_id)
      .order("item_id", { ascending: true });

    const { data: projectFiles } = await supabase
      .from("project_files")
      .select("file_name")
      .eq("project_id", submission.project_id)
      .order("uploaded_at", { ascending: true });

    const { data: projectLogs } = await supabase
      .from("project_logs")
      .select("action, created_at")
      .eq("project_id", submission.project_id)
      .order("created_at", { ascending: true });

    // ================= PDF =================
    const { doc, useFallback } = createPDFDocument({ margin: 42 });
    const font = useFallback ? "Helvetica" : "Body";
    const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
    const lineColor = "#e5e7eb";

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));

    const left = 42;
    const right = 553;

    const hr = () => {
      doc
        .moveTo(left, doc.y)
        .lineTo(right, doc.y)
        .strokeColor(lineColor)
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.6);
    };

    // ================= TITLE =================
    doc.font(bold).fontSize(16).text("Projektanfrage");
    doc.moveDown(0.6);
    hr();

    // ================= HÄNDLER =================
    if (dealer) {
      doc.font(bold).fontSize(12).text("Händler");
      doc.moveDown(0.3);

      const address = [
        dealer.street,
        dealer.zip,
        dealer.city,
        dealer.country,
      ]
        .filter(Boolean)
        .join(" ");

      doc.font(font).fontSize(10);
      doc.text(dealer.store_name || "-");
      if (address) doc.text(address);
      doc.text(`Kd.-Nr.: ${dealer.login_nr || "-"}`);
      if (dealer.email) doc.text(`E-Mail: ${dealer.email}`);
      if (dealer.phone) doc.text(`Telefon: ${dealer.phone}`);
    }

    doc.moveDown(0.8);
    hr();

    // ================= PROJEKTINFOS =================
    doc.font(bold).fontSize(12).text("Projektinformationen");
    doc.moveDown(0.3);

    doc.font(font).fontSize(10);
    doc.text(`Projekt-Nr.: #${submission.submission_id}`);
    doc.text(`Projektname: ${proj?.project_name || "-"}`);
    doc.text(`Typ: ${proj?.project_type || "-"}`);
    doc.text(`Kunde: ${proj?.customer || "-"}`);
    doc.text(`Ort: ${proj?.location || "-"}`);
    doc.text(`Zeitraum: ${proj?.start_date || "-"} – ${proj?.end_date || "-"}`);
    doc.text(`Erstellt am: ${formatDate(proj?.created_at || null)}`);

    if (proj?.comment || submission.kommentar) {
      doc.moveDown(0.6);
      doc.font(bold).text("Kommentar");
      doc.moveDown(0.2);
      doc.font(font).text(proj?.comment || submission.kommentar || "-");
    }

    doc.moveDown(0.8);
    hr();

    // ================= PRODUKTE =================
    if (products && products.length > 0) {
      doc.font(bold).fontSize(12).text("Produkte");
      doc.moveDown(0.4);

      const colProduct = left;
      const colQty = left + 260;
      const colPrice = left + 330;
      const colTotal = left + 430;

      // Header
      const yHeader = doc.y;
      doc.font(bold).fontSize(10);
      doc.text("Produkt", colProduct, yHeader);
      doc.text("Menge", colQty, yHeader);
      doc.text("Preis", colPrice, yHeader);
      doc.text("Total", colTotal, yHeader);

      doc.moveDown(0.2);
      hr();

      doc.font(font);
      let grandTotal = 0;

      products.forEach((p: SubmissionItem) => {
        const qty = p.menge ?? 0;
        const price = Number(p.preis ?? 0);
        const total = qty * price;
        grandTotal += total;

        const y = doc.y;
        doc.text(p.product_name || "-", colProduct, y);
        doc.text(String(qty), colQty, y);
        doc.text(`${price.toFixed(2)} CHF`, colPrice, y);
        doc.text(`${total.toFixed(2)} CHF`, colTotal, y);
        doc.moveDown(0.35);
      });

      hr();

      // TOTAL rechts
      doc.font(bold).text(`Total: ${grandTotal.toFixed(2)} CHF`, colTotal);

      // ✅ WICHTIG: Cursor wieder links setzen
      doc.x = left;
    }

    // ================= DATEIEN =================
    doc.font(bold).fontSize(12).text("Projektdateien");
    doc.moveDown(0.3);
    doc.font(font).fontSize(10);

    if (!projectFiles || projectFiles.length === 0) {
      doc.text("Keine Dateien vorhanden.");
    } else {
      projectFiles.forEach((f: any) => doc.text(`• ${f.file_name}`));
    }

    doc.moveDown(0.8);
    hr();

    // ================= VERLAUF =================
    doc.font(bold).fontSize(12).text("Projektverlauf");
    doc.moveDown(0.3);
    doc.font(font).fontSize(10);

    if (!projectLogs || projectLogs.length === 0) {
      doc.text("Noch keine Aktivitäten.");
    } else {
      projectLogs.forEach((l: any) =>
        doc.text(`${formatDate(l.created_at)} – ${l.action || "created"}`)
      );
    }

    // ================= FOOTER =================
    doc.moveDown(1.4);
    hr();
    doc.font(font).fontSize(8).fillColor("#999");
    doc.text("P5connect • Projektmanagement • Automatisch generiert");

    doc.end();

    const pdfBuffer = await new Promise<Buffer>((resolve) =>
      doc.on("end", () => resolve(Buffer.concat(chunks)))
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="projekt_${submission.submission_id}.pdf"`,
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
