"use server";
// @ts-nocheck

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail } from "@/lib/mailer";
import { renderBaseEmail } from "@/lib/emails/baseTemplate";

export async function sendCashbackNotification(opts: {
  claimId: number;
  preview?: boolean;
}) {
  const { claimId, preview = false } = opts;
  const supabase = await getSupabaseServer();

  /* -----------------------------------------------------------
     1) Claim laden (View: cashback_claims_view)
     ----------------------------------------------------------- */
  const { data: claim, error } = await supabase
    .from("cashback_claims_view")
    .select("*")
    .eq("claim_id", claimId)
    .maybeSingle();

  if (error || !claim) {
    console.error("❌ cashback_claim load error:", error);
    return { ok: false, error: "claim_not_found" };
  }

  // 👉 Alle View-Zusatzfelder als any lesen (Lösung A)
  const c: any = claim;

  /* -----------------------------------------------------------
     2) Basisdaten extrahieren
     ----------------------------------------------------------- */
  const isDouble = c.cashback_type === "double";

  const meta = {
    dealerName: c.dealer_name ?? "Händler",
    dealerEmail: c.dealer_email ?? null,
    kamEmail: c.mail_kam ?? null,
    kamEmail2: c.mail_kam2 ?? null,
    sonyEmail: c.mail_sony ?? null,

    seriennummer: c.seriennummer ?? "-",
    seriennummerSB: c.seriennummer_sb ?? null,
    soundbarEAN: c.soundbar_ean ?? null,

    cashback: c.cashback_betrag ?? 0,
    type: c.cashback_type,
    createdAt: c.created_at
      ? new Date(c.created_at).toLocaleString("de-CH")
      : "",

    document: c.document_path ?? null,
    documentSB: c.document_path_sb ?? null,
  };

  /* -----------------------------------------------------------
     3) HTML Body generieren
     ----------------------------------------------------------- */
  const body = `
    <p>Ein neuer Cashback-Antrag wurde eingereicht.</p>

    <h3 style="margin-top:20px;">Händler</h3>
    <p><strong>${meta.dealerName}</strong><br/>${meta.dealerEmail ?? "-"}</p>

    <h3 style="margin-top:20px;">Gerät</h3>
    <p>
      <strong>Seriennummer:</strong> ${meta.seriennummer}<br/>
      <strong>Cashback:</strong> ${meta.cashback.toFixed(2)} CHF<br/>
      <strong>Typ:</strong> ${meta.type}
    </p>

    ${
      isDouble
        ? `
        <h3 style="margin-top:20px;">Double Cashback (Soundbar)</h3>
        <p>
          <strong>Soundbar EAN:</strong> ${meta.soundbarEAN ?? "-"}<br/>
          <strong>Soundbar SN:</strong> ${meta.seriennummerSB ?? "-"}
        </p>
      `
        : ""
    }

    <h3 style="margin-top:20px;">Dokumente</h3>
    <ul>
      ${
        meta.document
          ? `<li><a href="${meta.document}">Rechnung / Nachweis</a></li>`
          : `<li>-</li>`
      }
      ${
        isDouble && meta.documentSB
          ? `<li><a href="${meta.documentSB}">Soundbar-Dokument</a></li>`
          : ""
      }
    </ul>

    <p style="margin-top:20px; color:#555;">
      Eingereicht am: ${meta.createdAt}
    </p>
  `;

  const html = renderBaseEmail({
    title: "Neuer Cashback-Antrag",
    body,
    formType: "cashback",
  });

  /* -----------------------------------------------------------
     4) Empfänger (Händler + KAM + Sony, ohne BG)
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
     5) Preview ohne Versand
     ----------------------------------------------------------- */
  if (preview) {
    return { ok: true, html, recipients, detail: { preview: true } };
  }

  /* -----------------------------------------------------------
     6) Versand
     ----------------------------------------------------------- */
  const subject = `💶 Neuer Cashback-Antrag – ${meta.dealerName}`;
  const res = await sendMail({
    to: recipients,
    subject,
    html,
  });

  return {
    ok: !(res as any)?.error,
    recipients,
    html,
    detail: res,
  };
}
