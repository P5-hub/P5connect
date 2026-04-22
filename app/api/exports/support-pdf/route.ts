import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase/server";
import { createPDFDocument } from "@/utils/pdf/createPDFDocument";
import type { TDealer } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TSupportDetail = {
  support_id: number;
  submission_id: number;
  support_typ: string | null;
  betrag: number | string | null;
  created_at: string | null;
  updated_at?: string | null;
};

type TSubmission = {
  submission_id: number;
  dealer_id: number | null;
  typ: string | null;
  created_at: string | null;
  status: string | null;
  kommentar?: string | null;
  order_comment?: string | null;
  dealer_reference?: string | null;
  calendar_week?: string | number | null;
  sony_share?: number | string | null;
};

type TSubmissionItem = {
  item_id: number;
  submission_id: number;
  product_name: string | null;
  ean: string | null;
  menge: number | string | null;
  preis: number | string | null;
  comment?: string | null;
};

type TSupportClaim = {
  claim_id: number;
  dealer_id: number | null;
  created_at: string | null;
  status: string | null;
} | null;

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

const toCHF = (n: unknown) => (Number(n) || 0).toFixed(2);

async function loadSupportData(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  submissionId: number
): Promise<{
  submission: TSubmission | null;
  details: TSupportDetail[];
  claim: TSupportClaim;
}> {
  const { data: submissionData, error: submissionError } = await supabase
    .from("submissions")
    .select(`
      submission_id,
      dealer_id,
      typ,
      created_at,
      status,
      kommentar,
      order_comment,
      dealer_reference,
      calendar_week,
      sony_share
    `)
    .eq("submission_id", submissionId)
    .eq("typ", "support")
    .maybeSingle();

  if (submissionError) throw submissionError;
  if (!submissionData) {
    return {
      submission: null,
      details: [],
      claim: null,
    };
  }

  const submission = submissionData as TSubmission;

  const { data: detailsData, error: detailsError } = await supabase
    .from("support_details")
    .select(`
      support_id,
      submission_id,
      support_typ,
      betrag,
      created_at,
      updated_at
    `)
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: true });

  if (detailsError) throw detailsError;

  const details = (detailsData ?? []) as TSupportDetail[];

  let claim: TSupportClaim = null;

  const supportId = details[0]?.support_id;
  if (supportId) {
    const { data: claimData, error: claimError } = await supabase
      .from("support_claims")
      .select("claim_id, dealer_id, created_at, status")
      .eq("claim_id", supportId)
      .maybeSingle();

    if (claimError) throw claimError;
    claim = (claimData as TSupportClaim) ?? null;
  }

  return { submission, details, claim };
}

function renderSupportPDFBuffer(args: {
  submission: TSubmission;
  details: TSupportDetail[];
  items: TSubmissionItem[];
  dealer: TDealer | null;
  claim: TSupportClaim;
}): Promise<Buffer> {
  const { submission, details, items, dealer, claim } = args;

  return new Promise((resolve, reject) => {
    try {
      const { doc, useFallback } = createPDFDocument({ margin: 42 });
      const font = useFallback ? "Helvetica" : "Body";
      const bold = useFallback ? "Helvetica-Bold" : "BodyBold";

      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const supportId = details[0]?.support_id ?? null;
      const titleId = supportId ?? submission.submission_id;

      /* ===============================
         HEADER
      =============================== */
      doc.font(bold).fontSize(16).fillColor("#000");
      doc.text(`Supportfall #${titleId}`);

      doc.moveDown(0.4);
      doc.font(font).fontSize(10).fillColor("#555");
      doc.text(`Submission-ID: ${submission.submission_id}`);
      doc.text(`Erstellt: ${formatDate(submission.created_at)}`);
      doc.text(`Status: ${safeText(claim?.status ?? submission.status)}`);
      doc.text(`Kalenderwoche: ${safeText(submission.calendar_week ?? "-")}`);
      if (submission.dealer_reference) {
        doc.text(`Referenz: ${safeText(submission.dealer_reference)}`);
      }

      /* ===============================
         HÄNDLER
      =============================== */
      if (dealer) {
        const name =
          dealer.store_name ||
          (dealer as any).company_name ||
          (dealer as any).firma ||
          (dealer as any).company ||
          "-";

        const street =
          (dealer as any).street ||
          (dealer as any).strasse ||
          (dealer as any).address ||
          "";

        const zip = dealer.plz ?? dealer.zip ?? "";
        const city = dealer.city ?? "";
        const address = [street, zip, city].filter(Boolean).join(" ");

        doc.moveDown(0.8);
        doc.font(bold).fontSize(11).fillColor("#000").text("Händler");
        doc.font(font).fontSize(10).fillColor("#333");
        doc.text(safeText(name));
        if (address) doc.text(safeText(address));
        doc.text(`Kd-Nr.: ${safeText(dealer.login_nr || "-")}`);
        if (dealer.email) doc.text(`E-Mail: ${safeText(dealer.email)}`);
        if (dealer.phone) doc.text(`Telefon: ${safeText(dealer.phone)}`);
      }

      /* ===============================
         SUPPORTDETAILS
      =============================== */
      doc.moveDown(0.8);
      doc.font(bold).fontSize(11).fillColor("#000").text("Supportdetails");
      doc.moveDown(0.3);

      if (details.length > 0) {
        doc.font(font).fontSize(10).fillColor("#333");

        let totalSupport = 0;

        for (const detail of details) {
          const betrag = Number(detail.betrag) || 0;
          totalSupport += betrag;

          doc.text(`Support-ID: ${safeText(detail.support_id)}`);
          doc.text(`Typ: ${safeText(detail.support_typ)}`);
          doc.text(`Betrag: CHF ${toCHF(betrag)}`);
          doc.text(`Erfasst: ${formatDate(detail.created_at)}`);
          doc.moveDown(0.4);
        }

        doc.font(bold).fillColor("#000");
        doc.text(`Total Support: CHF ${toCHF(totalSupport)}`);
      } else {
        doc.font(font).fontSize(10).fillColor("#333");
        doc.text("Keine Supportdetails vorhanden.");
      }

      /* ===============================
         PRODUKTE
      =============================== */
      doc.moveDown(0.8);
      doc.font(bold).fontSize(11).fillColor("#000").text("Produkte");
      doc.moveDown(0.3);

      if (items.length > 0) {
        const col = { name: 42, ean: 290, qty: 430, price: 500 };
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

        doc.font(font).fontSize(10).fillColor("#000");

        let rowY = tableTop + 20;
        let totalQty = 0;
        let totalSum = 0;

        for (const item of items) {
          const name = safeText(item.product_name || "Produkt");
          const ean = safeText(item.ean || "-");
          const qty = Number(item.menge) || 0;
          const price = Number(item.preis) || 0;

          totalQty += qty;
          totalSum += qty * price;

          doc.text(name, col.name, rowY, { width: 220 });
          doc.text(ean, col.ean, rowY, { width: 110 });
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
      } else {
        doc.font(font).fontSize(10).fillColor("#333");
        doc.text("Keine Produkte vorhanden.");
      }

      /* ===============================
         KOMMENTAR
      =============================== */
      const comment =
        submission.kommentar ||
        submission.order_comment ||
        null;

      if (comment) {
        doc.moveDown(1);
        doc.font(bold).fontSize(10).fillColor("#000").text("Kommentar");
        doc.moveDown(0.3);
        doc.font(font).fontSize(10).fillColor("#333").text(safeText(comment), {
          width: 420,
          align: "left",
        });
      }

      /* ===============================
         FOOTER
      =============================== */
      doc.moveDown(1);
      doc.fontSize(8).fillColor("#999");
      doc.text(
        "P5connect • Automatisch generiertes Support-Dokument",
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
    const idParam = searchParams.get("id");
    const submissionId = idParam ? Number(idParam) : NaN;

    if (!Number.isFinite(submissionId)) {
      return new NextResponse("invalid id", { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { submission, details, claim } = await loadSupportData(
      supabase,
      submissionId
    );

    if (!submission) {
      return new NextResponse("support submission not found", { status: 404 });
    }

    const { data: dealerData, error: dealerError } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", submission.dealer_id ?? 0)
      .maybeSingle();

    if (dealerError) throw dealerError;
    const dealer = dealerData as TDealer | null;

    const { data: itemsData, error: itemsError } = await supabase
      .from("submission_items")
      .select(`
        item_id,
        submission_id,
        product_name,
        ean,
        menge,
        preis,
        comment
      `)
      .eq("submission_id", submissionId)
      .order("item_id", { ascending: true });

    if (itemsError) throw itemsError;
    const items = (itemsData ?? []) as TSubmissionItem[];

    const pdfBuffer = await renderSupportPDFBuffer({
      submission,
      details,
      items,
      dealer,
      claim,
    });

    const pdfBytes = new Uint8Array(pdfBuffer);

    const supportId = details[0]?.support_id ?? submission.submission_id;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="support_${supportId}.pdf"`,
        "Content-Length": String(pdfBuffer.length),
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