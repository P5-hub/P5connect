"use server";
// @ts-nocheck

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail } from "@/lib/mailer";
import { buildOrderEmailHTML } from "@/lib/emails/orderEmail";

type Stage = "placed" | "confirmed";

export async function sendOrderNotification(opts: {
  submissionId: number;
  stage: Stage;
  preview?: boolean;
}) {
  const { submissionId, stage, preview = false } = opts;
  const supabase = await getSupabaseServer();

  // ------------------------------------------------------------
  // 1) Bestellung laden (aus deiner View bestellung_dashboard)
  // ------------------------------------------------------------
  const { data: order, error: orderErr } = await supabase
    .from("bestellung_dashboard")
    .select("*")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (orderErr || !order) {
    console.error("❌ order load failed:", orderErr);
    return { ok: false, error: "order_not_found" };
  }

  // ------------------------------------------------------------
  // 2) Items laden (+ Distributor-Daten embedded)
  // ------------------------------------------------------------
  const { data: itemRows, error: itemsErr } = await supabase
    .from("submission_items")
    .select(`
      item_id,
      submission_id,
      menge,
      preis,
      invest,
      distributor_id,
      products:product_id(product_name, ean),
      distributors:distributor_id(id, code, name, email)
    `)
    .eq("submission_id", submissionId);

  if (itemsErr) {
    console.error("❌ items load failed:", itemsErr);
    return { ok: false, error: "items_not_found" };
  }

  // ------------------------------------------------------------
  // 3) Distributor bestimmen
  //    - Priorität: Item Distributor
  //    - Fallback über distributor_id oder code in View
  // ------------------------------------------------------------
  let dist = itemRows?.[0]?.distributors ?? null;

  if (!dist?.email) {
    // Fallback-Möglichkeiten aus deiner View
    const fallbackCodes = [
      order.distributor_code,
      order.distributor_id,
      order.distributor_name,
      order.distributor_email,
    ]
      .map((v) => (v ? String(v).trim() : null))
      .filter(Boolean);

    for (const raw of fallbackCodes) {
      if (!raw) continue;

      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          raw
        );

      let q = supabase
        .from("distributors")
        .select("id, code, name, email")
        .limit(1);

      q = isUuid ? q.eq("id", raw) : q.eq("code", raw);

      const { data: fallbackDist } = await q.maybeSingle();
      if (fallbackDist) {
        dist = fallbackDist;
        break;
      }
    }
  }

  // ------------------------------------------------------------
  // 4) Meta-Daten fürs E-Mail-Template
  //    (ALLE Felder basieren 100% auf deiner View)
  // ------------------------------------------------------------
  const meta = {
    // Händler
    dealerCompany: order.dealer_name ?? null,
    dealerName: order.dealer_name ?? null,
    dealerEmail: order.dealer_email ?? null,
    dealerPhone: order.dealer_phone ?? null,
    dealerStreet: order.dealer_street ?? null,
    dealerZip: order.dealer_zip ?? null,
    dealerCity: order.dealer_city ?? null,
    dealerCountry: order.dealer_country ?? "Schweiz",

    // KAM / Sony Empfänger
    kamName: order.kam_name ?? null,
    kamEmail:
      order.kam_email ??
      order.kam_email_2 ??
      order.kam_email_sony ??
      null,

    // Bestellung / Kunde
    orderNumber: order.order_number ?? order.submission_id ?? null,
    customerNumber: order.dealer_login_nr ?? null,
    customerName: order.dealer_name ?? null,
    customerContact: order.dealer_contact_person ?? null,
    customerPhone: order.dealer_phone ?? null,

    // Lieferadresse
    deliveryName: order.delivery_name ?? null,
    deliveryStreet: order.delivery_street ?? null,
    deliveryZip: order.delivery_zip ?? null,
    deliveryCity: order.delivery_city ?? null,
    deliveryCountry: order.delivery_country ?? null,

    // Kommentar
    orderComment: order.order_comment ?? null,
  };

  // ------------------------------------------------------------
  // 5) HTML-E-Mail generieren
  // ------------------------------------------------------------
  const html = buildOrderEmailHTML({
    distributor: {
      name: dist?.name ?? order.distributor_name ?? "",
      email: dist?.email ?? order.distributor_email ?? null,
    },
    items: (itemRows || []).map((i) => ({
      menge: i.menge ?? 0,
      preis: i.preis ?? 0,
      products: {
        product_name: i.products?.product_name ?? "-",
        ean: i.products?.ean ?? "-",
      },
    })),
    meta,
  });

  // ------------------------------------------------------------
  // 6) Betreff vorbereiten
  // ------------------------------------------------------------
  const distributorName = dist?.name ?? order.distributor_name ?? null;
  const subject =
    stage === "placed"
      ? `📦 Neue Bestellung von ${order.dealer_name ?? "Händler"}${
          distributorName ? ` → ${distributorName}` : ""
        }`
      : `✅ Bestellung bestätigt – ${order.dealer_name ?? "Händler"}${
          distributorName ? ` → ${distributorName}` : ""
        }`;

  // ------------------------------------------------------------
  // 7) Empfänger ermitteln (distributor + Händler + KAM)
  // ------------------------------------------------------------
  const emailsRaw = [
    dist?.email ?? null,
    order.dealer_email ?? null,
    order.kam_email_sony ?? null,
    order.kam_email ?? null,
    order.kam_email_2 ?? null,
    order.mail_bg ?? null,
    order.mail_bg2 ?? null,
    order.mail_dealer ?? null,
  ].filter(Boolean) as string[];

  // doppelte entfernen
  const seen = new Set<string>();
  const recipients = emailsRaw.filter((e) => {
    const key = e.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ------------------------------------------------------------
  // 8) Preview ohne Versand
  // ------------------------------------------------------------
  if (preview) {
    return { ok: true, html, recipients, detail: { preview: true } };
  }

  // ------------------------------------------------------------
  // 9) Versand
  // ------------------------------------------------------------
  const res = await sendMail({ to: recipients, subject, html });

  return { ok: !(res as any)?.error, html, recipients, detail: res };
}
