import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SubmissionItem = {
  product_name: string | null;
  menge: number | null;
  preis: number | null;
};

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

function renderProjektPDFBuffer(args: {
  submission: any;
  proj: any;
  dealer: any;
  products: SubmissionItem[];
  projectFiles: any[];
  projectLogs: any[];
}): Promise<Buffer> {
  const { submission, proj, dealer, products, projectFiles, projectLogs } = args;

  return new Promise((resolve, reject) => {
    try {
      const { doc, useFallback } = createPDFDocument({ margin: 42 });
      const font = useFallback ? "Helvetica" : "Body";
      const bold = useFallback ? "Helvetica-Bold" : "BodyBold";
      const lineColor = "#e5e7eb";

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

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

      /* ================= TITLE ================= */
      doc.font(bold).fontSize(16).text("Projektanfrage");
      doc.moveDown(0.6);
      hr();

      /* ================= HÄNDLER ================= */
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
        doc.text(safeText(dealer.store_name || "-"));
        if (address) doc.text(safeText(address));
        doc.text(`Kd.-Nr.: ${safeText(dealer.login_nr)}`);
        if (dealer.email) doc.text(`E-Mail: ${safeText(dealer.email)}`);
        if (dealer.phone) doc.text(`Telefon: ${safeText(dealer.phone)}`);
      }

      doc.moveDown(0.8);
      hr();

      /* ================= PROJEKTINFOS ================= */
      doc.font(bold).fontSize(12).text("Projektinformationen");
      doc.moveDown(0.3);

      doc.font(font).fontSize(10);
      doc.text(`Projekt-Nr.: #${submission.submission_id}`);
      doc.text(`Projektname: ${safeText(proj?.project_name)}`);
      doc.text(`Typ: ${safeText(proj?.project_type)}`);
      doc.text(`Kunde: ${safeText(proj?.customer)}`);
      doc.text(`Ort: ${safeText(proj?.location)}`);
      doc.text(
        `Zeitraum: ${safeText(proj?.start_date)} – ${safeText(proj?.end_date)}`
      );
      doc.text(`Erstellt am: ${formatDate(proj?.created_at || null)}`);

      if (proj?.comment || submission.kommentar) {
        doc.moveDown(0.6);
        doc.font(bold).text("Kommentar");
        doc.moveDown(0.2);
        doc.font(font).text(safeText(proj?.comment || submission.kommentar || "-"));
      }

      doc.moveDown(0.8);
      hr();

      /* ================= PRODUKTE ================= */
      if (products && products.length > 0) {
        doc.font(bold).fontSize(12).text("Produkte");
        doc.moveDown(0.4);

        const colProduct = left;
        const colQty = left + 260;
        const colPrice = left + 330;
        const colTotal = left + 430;

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
          const qty = Number(p.menge ?? 0);
          const price = Number(p.preis ?? 0);
          const total = qty * price;
          grandTotal += total;

          const y = doc.y;
          doc.text(safeText(p.product_name || "-"), colProduct, y);
          doc.text(String(qty), colQty, y);
          doc.text(`${price.toFixed(2)} CHF`, colPrice, y);
          doc.text(`${total.toFixed(2)} CHF`, colTotal, y);
          doc.moveDown(0.35);
        });

        hr();

        doc.font(bold).text(`Total: ${grandTotal.toFixed(2)} CHF`, colTotal);
        doc.x = left;
      }

      /* ================= DATEIEN ================= */
      doc.font(bold).fontSize(12).text("Projektdateien");
      doc.moveDown(0.3);
      doc.font(font).fontSize(10);

      if (!projectFiles || projectFiles.length === 0) {
        doc.text("Keine Dateien vorhanden.");
      } else {
        projectFiles.forEach((f: any) => doc.text(`• ${safeText(f.file_name)}`));
      }

      doc.moveDown(0.8);
      hr();

      /* ================= VERLAUF ================= */
      doc.font(bold).fontSize(12).text("Projektverlauf");
      doc.moveDown(0.3);
      doc.font(font).fontSize(10);

      if (!projectLogs || projectLogs.length === 0) {
        doc.text("Noch keine Aktivitäten.");
      } else {
        projectLogs.forEach((l: any) =>
          doc.text(`${formatDate(l.created_at)} – ${safeText(l.action || "created")}`)
        );
      }

      /* ================= FOOTER ================= */
      doc.moveDown(1.4);
      hr();
      doc.font(font).fontSize(8).fillColor("#999");
      doc.text("P5connect • Projektmanagement • Automatisch generiert");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const submissionId = Number(idParam);
    if (!Number.isFinite(submissionId)) {
      return new NextResponse("invalid submission id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("submission_id, dealer_id, project_id, kommentar, created_at")
      .eq("submission_id", submissionId)
      .eq("typ", "projekt")
      .maybeSingle();

    if (submissionError) throw submissionError;

    if (!submission || !submission.project_id) {
      return new NextResponse("project submission not found", { status: 404 });
    }

    const { data: proj, error: projError } = await supabase
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

    if (projError) throw projError;

    const { data: dealer, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", submission.dealer_id ?? 0)
      .maybeSingle();

    if (dealerError) throw dealerError;

    const { data: products, error: productsError } = await supabase
      .from("submission_items")
      .select("product_name, menge, preis")
      .eq("submission_id", submission.submission_id)
      .order("item_id", { ascending: true });

    if (productsError) throw productsError;

    const { data: projectFiles, error: filesError } = await supabase
      .from("project_files")
      .select("file_name")
      .eq("project_id", submission.project_id)
      .order("uploaded_at", { ascending: true });

    if (filesError) throw filesError;

    const { data: projectLogs, error: logsError } = await supabase
      .from("project_logs")
      .select("action, created_at")
      .eq("project_id", submission.project_id)
      .order("created_at", { ascending: true });

    if (logsError) throw logsError;

    const pdfBuffer = await renderProjektPDFBuffer({
      submission,
      proj,
      dealer,
      products: (products ?? []) as SubmissionItem[],
      projectFiles: projectFiles ?? [],
      projectLogs: projectLogs ?? [],
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="projekt_${submission.submission_id}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
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