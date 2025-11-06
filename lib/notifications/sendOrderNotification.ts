"use server";

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

  // Bestellung + Items + Distributor laden
  const { data: order, error } = await supabase
    .from("bestellungen_view_ext")
    .select(`
      *,
      submission_items(
        item_id,
        menge,
        preis,
        invest,
        products(product_name, ean),
        distributors:distributor_id(name, email, id, code)
      )
    `)
    .eq("submission_id", submissionId)
    .single<any>();

  if (error || !order) {
    console.error("❌ Bestellung nicht gefunden oder DB-Fehler:", error);
    return { ok: false, error: "order_not_found" };
  }

  const items =
    (order.submission_items as Array<{
      menge?: number;
      preis?: number;
      invest?: number;
      products?: { product_name?: string; ean?: string };
      distributors?: { id?: string; code?: string; name?: string | null; email?: string | null };
    }>) || [];

  // Distributor bestimmen (Fallback)
  let dist = items[0]?.distributors ?? null;

  if (!dist?.email) {
    const raw = String(order.distributor ?? "").trim();
    if (raw) {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw);
      let q = supabase.from("distributors").select("id, code, name, email").limit(1);
      q = isUuid ? q.eq("id", raw) : q.eq("code", raw);
      const { data: fallbackDist } = await q.maybeSingle();
      if (fallbackDist) dist = fallbackDist as typeof dist;
    }
  }

  // Meta fürs Template
  const meta = {
    dealerCompany: order.dealer_company ?? order.dealer_name ?? null,
    dealerName: order.dealer_name ?? null,
    dealerEmail: order.dealer_email ?? null,
    dealerPhone: order.dealer_phone ?? null,
    dealerStreet: order.dealer_street ?? null,
    dealerZip: order.dealer_zip ?? null,
    dealerCity: order.dealer_city ?? null,
    dealerCountry: order.dealer_country ?? "Schweiz",
    kamName: order.kam_name ?? order.kam ?? null,
    kamEmail:
      order.kam_email ??
      order.kam_email_sony ??
      order.mail_kam ??
      order.kam ??
      order.kam_email_sony ??
      null,
    orderNumber: order.order_number ?? order.submission_id ?? null,
    customerNumber: order.dealer_login_nr ?? order.customer_number ?? null,
    customerName: order.customer_name ?? null,
    customerContact: order.dealer_contact_person ?? order.customer_contact ?? null,
    customerPhone: order.customer_phone ?? null,
  };

  // HTML generieren
  const html = buildOrderEmailHTML({
    distributor: { name: dist?.name ?? order.distributor ?? "", email: dist?.email ?? null },
    items: items.map((i) => ({
      menge: i.menge ?? 0,
      preis: i.preis ?? 0,
      invest: i.invest ?? null,
      products: {
        product_name: i.products?.product_name ?? "-",
        ean: i.products?.ean ?? "-",
      },
    })),
    meta,
  });

  const distributorName = dist?.name || order.distributor || null;

  const subject =
    stage === "placed"
      ? `📦 Neue Bestellung von ${order.dealer_name ?? "Händler"}${
          distributorName ? ` → ${distributorName}` : ""
        }`
      : `✅ Bestellung bestätigt – ${order.dealer_name ?? "Händler"}${
          distributorName ? ` → ${distributorName}` : ""
        }`;

  // Empfänger zusammenstellen
  const emailsRaw = [
    dist?.email ?? null,
    order.dealer_email ?? null,
    order.kam_email_sony ?? null,
    order.kam_email ?? null,
    order.mail_kam ?? null,
  ].filter(Boolean) as string[];

  const seen = new Set<string>();
  const recipients = emailsRaw.filter((e) => {
    const key = e.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Vorschau → kein Versand
  if (preview) {
    return {
      ok: true,
      html,
      recipients,
      detail: { preview: true, count: recipients.length },
    };
  }

  // Echter Versand
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
