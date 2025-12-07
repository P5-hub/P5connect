// lib/mailer.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Testmodus ist aktiv, solange NICHT 'live' gesetzt ist.
 * .env: NEXT_PUBLIC_EMAIL_MODE=test  (Standardentwicklung)
 *       NEXT_PUBLIC_EMAIL_MODE=live  (Produktion)
 */
const isTestMode = process.env.NEXT_PUBLIC_EMAIL_MODE !== "live";

/* ============================================================================
   🔧 EMAIL-BEREINIGUNG (exportiert für sendOrderNotification)
   ============================================================================
*/
export function cleanEmails(list: (string | null | undefined)[]): string[] {
  return Array.from(
    new Set(
      list
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((x) => x.trim())
        .map((x) => x.toLowerCase())
    )
  );
}

/* ============================================================================
   📧 BASIS-MAILFUNKTION
   ============================================================================
*/
console.log("🔑 RESEND_API_KEY vorhanden:", !!process.env.RESEND_API_KEY);
console.log("📦 Email mode:", process.env.NEXT_PUBLIC_EMAIL_MODE);

type SendMailArgs = {
  to?: string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendMail({ to, subject, html, from }: SendMailArgs) {
  const recipients = cleanEmails(to || []);

  if (recipients.length === 0) {
    console.warn("⚠️ Keine Empfänger angegeben. Mail wird nicht gesendet.");
    return { warning: "no_recipients", subject, html };
  }

  if (isTestMode) {
    console.log("🧪 TESTMODUS – E-Mail wird NICHT gesendet");
    console.log("From:", from ?? "P5connect <noreply@notifications.p5connect.ch>");
    console.log("To:", recipients);
    console.log("Subject:", subject);
    console.log("HTML:\n", html);
    return { test: true, recipients };
  }

  if (!resend) {
    console.error("❌ RESEND_API_KEY fehlt – Versand nicht möglich");
    return { error: "no_resend_key" };
  }

  try {
    const result = await resend.emails.send({
      from: from ?? "P5connect <noreply@notifications.p5connect.ch>",
      to: recipients,
      subject,
      html,
    });

    console.log("📤 Resend send result:", result);

    return { success: true, id: (result as any)?.id };
  } catch (error: any) {
    console.error("❌ Fehler beim Mailversand:", error?.message || error);
    return { error: error?.message || "send_failed" };
  }
}

/* ============================================================================
   📧 SPEZIALFUNKTION FÜR PROJEKTANFRAGEN
   ============================================================================
*/
type ProjectMailArgs = {
  toDealer?: string | null;
  toKAM?: string | null;
  toKAM2?: string | null;
  toBG?: string | null;
  toBG2?: string | null;
  toDistributor?: string | null;
  toDistributor2?: string | null;
  projectName?: string | null;
  productName?: string | null;
  quantity?: number | null;
  price?: number | null;
  customer?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  from?: string;
  submissionId?: string | number;
  preview?: boolean;
};

export async function sendProjectMail(
  args: ProjectMailArgs & { status?: "approved" | "rejected" }
) {
  const {
    toDealer,
    toKAM,
    toKAM2,
    toBG,
    toBG2,
    toDistributor,
    toDistributor2,
    projectName,
    productName,
    quantity,
    price,
    customer,
    startDate,
    endDate,
    status = "approved",
    from,
  } = args;

  const recipients = cleanEmails([
    toDealer,
    toKAM,
    toKAM2,
    toBG,
    toBG2,
    toDistributor,
    toDistributor2,
  ]);

  const subject =
    status === "approved"
      ? `Projektanfrage bestätigt – P5connect`
      : `Projektanfrage abgelehnt – P5connect`;

  const detailsRows: string[] = [];
  if (productName)
    detailsRows.push(`<tr><td><strong>Produkt:</strong></td><td>${productName}</td></tr>`);
  if (quantity != null)
    detailsRows.push(`<tr><td><strong>Menge:</strong></td><td>${quantity}</td></tr>`);
  if (price != null)
    detailsRows.push(`<tr><td><strong>Preis:</strong></td><td>${price} CHF</td></tr>`);
  if (customer)
    detailsRows.push(`<tr><td><strong>Kunde:</strong></td><td>${customer}</td></tr>`);
  if (startDate || endDate)
    detailsRows.push(
      `<tr><td><strong>Zeitraum:</strong></td><td>${startDate || "?"} – ${endDate || "?"}</td></tr>`
    );

  const html =
    status === "approved"
      ? `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #5B21B6;">Projektanfrage bestätigt</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>Ihre Projektanfrage <strong>${projectName || "(unbenanntes Projekt)"}</strong> wurde bestätigt.</p>
          ${detailsRows.length ? `<table style="border-collapse: collapse; margin-top: 10px;">${detailsRows.join("")}</table>` : ""}
          <p style="margin-top: 15px;">Vielen Dank für Ihre Zusammenarbeit.<br><strong>Ihr P5connect-Team</strong></p>
        </div>`
      : `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #DC2626;">Projektanfrage abgelehnt</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>Ihre Projektanfrage <strong>${projectName || "(unbenanntes Projekt)"}</strong> wurde leider abgelehnt.</p>
          <p>Für Rückfragen steht Ihnen Ihr Ansprechpartner gerne zur Verfügung.</p>
          <p style="margin-top: 15px;">Mit freundlichen Grüssen,<br><strong>Ihr P5connect-Team</strong></p>
        </div>`;

  return await sendMail({
    to: recipients.length ? recipients : ["test@p5connect.ch"],
    subject,
    html,
    from: from ?? "P5connect <noreply@notifications.p5connect.ch>",
  });
}

/* ============================================================================
   📧 SPEZIALFUNKTION FÜR SUPPORT-ANFRAGEN
   ============================================================================
*/
type SupportMailArgs = {
  toDealer?: string | null;
  toKAM?: string | null;
  toKAM2?: string | null;
  toBG?: string | null;
  toBG2?: string | null;
  subject?: string;
  message?: string;
  from?: string;
  submissionId?: string | number;
  preview?: boolean;
  excludeDistributors?: boolean;
  status?: "approved" | "rejected";
};

export async function sendSupportMail(args: SupportMailArgs) {
  const {
    toDealer,
    toKAM,
    toKAM2,
    toBG,
    toBG2,
    subject = "Support-Anfrage – P5connect",
    message = "Eine neue Support-Anfrage wurde eingereicht.",
    from,
  } = args;

  const recipients = cleanEmails([toDealer, toKAM, toKAM2, toBG, toBG2]);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #2563EB;">Neue Support-Anfrage</h2>
      <p>${message}</p>
      <p style="margin-top: 15px;">
        Freundliche Grüsse,<br><strong>Ihr P5connect-Team</strong>
      </p>
    </div>`;

  return await sendMail({
    to: recipients.length ? recipients : ["test@p5connect.ch"],
    subject,
    html,
    from: from ?? "P5connect <noreply@notifications.p5connect.ch>",
  });
}
