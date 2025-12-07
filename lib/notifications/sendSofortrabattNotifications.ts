"use server";
// @ts-nocheck

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail } from "@/lib/mailer";
import { renderBaseEmail } from "@/lib/emails/baseTemplate";

export async function sendSofortrabattNotification(opts: {
  claimId: number;
  preview?: boolean;
}) {
  const { claimId, preview = false } = opts;
  const supabase = await getSupabaseServer();

  /* -----------------------------------------------------------
     1) Claim laden (View)
     ----------------------------------------------------------- */
  const { data: claim, error } = await supabase
    .from("sofortrabatt_claims_view")
    .select("*")
    .eq("claim_id", claimId)
    .maybeSingle();

  if (error || !claim) {
    console.error("❌ sofortrabatt claim load error:", error);
    return { ok: false, error: "claim_not_found" };
  }

  // 👉 EXACT SAME FIX WIE BEI CASHBACK
  const c: any = claim;

  /* -----------------------------------------------------------
     2) Daten extrahieren
     ----------------------------------------------------------- */
  const meta = {
    dealerName: c.dealer_name ?? "Händler",
    dealerEmail: c.dealer_email ?? null,
    kamEmail: c.mail_kam ?? null,
    kamEmail2: c.mail_kam2 ?? null,
    sonyEmail: c.mail_sony ?? null,

    level: c.rabatt_level ?? "-",
    betrag: c.rabatt_betrag ?? 0,

    products: c.product_list ?? "-",
    invoice: c.invoice_file_url ?? null,

    comment: c.comment ?? null,

    createdAt: c.created_at
      ? new Date(c.created_at).toLocaleString("de-CH")
      : "",
  };

  /* -----------------------------------------------------------
     3) HTML Body
     ----------------------------------------------------------- */
  const body = `
    <p>Ein neuer Sofortrabatt-Antrag wurde eingereicht.</p>

    <h3>Händler</h3>
    <p><strong>${meta.dealerName}</strong><br/>${meta.dealerEmail ?? "-"}</p>

    <h3>Sofortrabatt</h3>
    <p>
      <strong>Level:</strong> ${meta.level}<br/>
      <strong>Betrag:</strong> ${meta.betrag.toFixed(2)} CHF
    </p>

    <h3>Produkte</h3>
    <p>${meta.products}</p>

    <h3>Rechnung</h3>
    <p>
      ${
        meta.invoice
          ? `<a href="${meta.invoice}">Rechnung öffnen</a>`
          : "-"
      }
    </p>

    ${
      meta.comment
        ? `<h3>Kommentar</h3><p>${meta.comment}</p>`
        : ""
    }

    <p style="margin-top:20px;color:#555;">
      Eingereicht am: ${meta.createdAt}
    </p>
  `;

  const html = renderBaseEmail({
    title: "Neuer Sofortrabatt-Antrag",
    body,
    formType: "sofortrabatt",
  });

  /* -----------------------------------------------------------
     4) Empfänger (Händler + KAM + Sony)
     ----------------------------------------------------------- */
  const raw = [
    meta.dealerEmail,
    meta.kamEmail,
    meta.kamEmail2,
    meta.sonyEmail,
  ].filter(Boolean);

  const seen = new Set<string>();
  const recipients = raw.filter((e): e is string => {
    const key = e.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  /* Preview-Modus */
  if (preview) {
    return { ok: true, html, recipients, preview: true };
  }

  /* Versand */
  const subject = `💸 Neuer Sofortrabatt – ${meta.dealerName}`;

  const res = await sendMail({
    to: recipients,
    subject,
    html,
  });

  return {
    ok: !(res as any)?.error,
    recipients,
    detail: res,
  };
}
