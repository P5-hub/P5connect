"use server";
// @ts-nocheck

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail } from "@/lib/mailer";
import { renderBaseEmail } from "@/lib/emails/baseTemplate";

export async function sendProjectNotification(opts: {
  submissionId: number;
  preview?: boolean;
}) {
  const { submissionId, preview = false } = opts;

  const supabase = await getSupabaseServer();

  /* -----------------------------------------------------------
     1) Daten aus View projekt_claims_view laden
     ----------------------------------------------------------- */
  const { data: proj, error } = await supabase
    .from("projekt_claims_view")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (error || !proj) {
    console.error("❌ project load error:", error);
    return { ok: false, error: "project_not_found" };
  }

  const claim: any = proj; // 🎯 Lösung A → stabil, keine TS-Fehler

  /* -----------------------------------------------------------
     2) Items extrahieren
     ----------------------------------------------------------- */
  let items: any[] = [];
  try {
    items = Array.isArray(claim.produkte) ? claim.produkte : [];
  } catch {
    items = [];
  }

  /* -----------------------------------------------------------
     3) HTML für Items
     ----------------------------------------------------------- */
  const itemsHtml = items
    .map((i) => {
      const p: any = i || {}; // 🎯 Schutz + any

      return `
        <tr>
          <td style="padding:6px;border:1px solid #e5e7eb;">${p.name ?? "-"}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${p.sony_article ?? "-"}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${p.menge ?? "-"}</td>
          <td style="padding:6px;border:1px solid #e5e7eb;">${p.preis ? p.preis.toFixed(2) : "-"} CHF</td>
        </tr>`;
    })
    .join("");

  /* -----------------------------------------------------------
     4) Meta-Daten
     ----------------------------------------------------------- */
  const meta = {
    dealerName: claim.dealer_name ?? "-",
    dealerEmail: claim.dealer_email ?? null,

    phone: claim.dealer_phone ?? null,
    customerName: claim.customer_name ?? null,
    customerContact: claim.customer_contact ?? null,
    customerPhone: claim.customer_phone ?? null,

    kamEmail: claim.kam_email ?? null,
    kamEmail2: claim.kam_email_2 ?? null,
    sonyEmail: claim.kam_email_sony ?? null,

    comment: claim.kommentar ?? null,
    createdAt: claim.created_at
      ? new Date(claim.created_at).toLocaleString("de-CH")
      : "",
  };

  /* -----------------------------------------------------------
     5) HTML Body
     ----------------------------------------------------------- */
  const body = `
    <p>Es wurde eine neue Projektanfrage eingereicht.</p>

    <h3 style="margin-top:20px;">Händler</h3>
    <p><strong>${meta.dealerName}</strong><br/>${meta.dealerEmail ?? "-"}</p>

    ${
      meta.phone
        ? `<p><strong>Telefon:</strong> ${meta.phone}</p>`
        : ""
    }

    <h3 style="margin-top:20px;">Produkte</h3>
    <table style="border-collapse:collapse;width:100%;margin-top:10px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:6px;border:1px solid #e5e7eb;">Name</th>
          <th style="padding:6px;border:1px solid #e5e7eb;">Artikel</th>
          <th style="padding:6px;border:1px solid #e5e7eb;">Menge</th>
          <th style="padding:6px;border:1px solid #e5e7eb;">Preis</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    ${
      meta.comment
        ? `<p style="margin-top:12px;"><strong>Kommentar:</strong><br/>${meta.comment}</p>`
        : ""
    }

    <p style="margin-top:20px;color:#555;">
      Eingereicht am: ${meta.createdAt}
    </p>
  `;

  const html = renderBaseEmail({
    title: "Neue Projektanfrage",
    body,
    formType: "projekt",
  });

  /* -----------------------------------------------------------
     6) Empfänger sammeln (dealer + KAM + Sony)
     ----------------------------------------------------------- */
  const rawEmails = [
    meta.dealerEmail,
    meta.kamEmail,
    meta.kamEmail2,
    meta.sonyEmail,
  ].filter(Boolean);

  const seen = new Set<string>();
  const recipients = rawEmails.filter((e): e is string => {
    const key = e.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  /* -----------------------------------------------------------
     7) Preview?
     ----------------------------------------------------------- */
  if (preview) {
    return { ok: true, html, recipients, detail: { preview: true } };
  }

  /* -----------------------------------------------------------
     8) Versand
     ----------------------------------------------------------- */
  const subject = `📁 Neue Projektanfrage – ${meta.dealerName}`;
  const res = await sendMail({
    to: recipients,
    subject,
    html,
  });

  return {
    ok: !(res as any)?.error,
    html,
    recipients,
    detail: res,
  };
}
