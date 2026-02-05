"use server";

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail, cleanEmails } from "@/lib/mailer";
import { buildDealerOrderEmailHTML } from "@/lib/emails/orderEmailDealer";
import { buildDistiOrderEmailHTML } from "@/lib/emails/orderEmailDisti";
import { orderMailTexts } from "@/lib/emails/orderMailTexts";

// ---------------------------------------------------
// TYPES
// ---------------------------------------------------

type Stage = "placed" | "confirmed";

type DealerPreviewBlock = {
  html: string;
  recipients: string[];
  subject: string;
};

type DistiPreviewBlock = {
  html: string;
  recipients: string[];
  subject: string;
};

export type OrderNotificationResult =
  | {
      ok: false;
      error: string;
    }
  | {
      ok: true;
      stage: Stage;
      preview: true;
      dealer: DealerPreviewBlock;
      disti?: DistiPreviewBlock; // only for confirmed
    }
  | {
      ok: true;
      preview: false;
    };

// ---------------------------------------------------
// DashboardRow (unchanged)
// ---------------------------------------------------

type DashboardRow = {
  submission_id: number;
  created_at: string;
  status: string | null;
  typ: string | null;
  bestellweg: string | null;
  order_comment: string | null;
  dealer_reference: string | null;
  project_id: number | null;
  order_number: string | null;
  dealer_login_nr: string | null;

  dealer_name: string | null;
  dealer_contact_person: string | null;
  dealer_phone: string | null;
  dealer_email: string | null;
  mail_dealer: string | null;

  dealer_language: "de_CH" | "fr_CH" | "it_CH" | null;
  dealer_city: string | null;
  dealer_street: string | null;
  dealer_zip: string | null;
  dealer_country: string | null;
  requested_delivery: string | null;
  requested_delivery_date: string | null;

  kam_name: string | null;
  kam_email: string | null;
  kam_email_2: string | null;
  kam_email_sony: string | null;
  mail_bg: string | null;
  mail_bg2: string | null;

  distributor_id: string | null;
  distributor_name: string | null;
  distributor_code: string | null;
  distributor_email: string | null;

  item_id: number | null;
  product_id: number | null;
  menge: number | null;
  preis: number | null;
  calc_price_on_invoice: number | null;
  invest: number | null;

  lowest_price_brutto: number | null;
  lowest_price_source: string | null;
  lowest_price_source_custom: string | null;

  product_name: string | null;
  ean: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  vrg: number | null;
  dealer_invoice_price: number | null;
  support_on_invoice: number | null;
  tactical_support: number | null;
  suisa: number | null;

  delivery_name: string | null;
  delivery_street: string | null;
  delivery_zip: string | null;
  delivery_city: string | null;
  delivery_country: string | null;
};

// ---------------------------------------------------
// FUNCTION
// ---------------------------------------------------

export async function sendOrderNotification(opts: {
  submissionId: number;
  stage: Stage;
  preview?: boolean;
}): Promise<OrderNotificationResult> {
  const { submissionId, stage, preview = false } = opts;
  const supabase = await getSupabaseServer();

  // Load rows
  const { data: rows, error } = await supabase
    .from("bestellung_dashboard")
    .select("*")
    .eq("submission_id", submissionId);

  if (error || !rows?.length) {
    console.error("❌ Error loading bestellung_dashboard:", error);
    return { ok: false, error: "order_not_found" };
  }

  // SAFE cast
  const order = rows[0] as unknown as DashboardRow;

  // Items
  const items = rows.map((r) => ({
    menge: r.menge ?? null,
    preis: r.preis ?? null,
    invest: r.invest ?? r.calc_price_on_invoice ?? null,
    calc_price_on_invoice: r.calc_price_on_invoice ?? null,
    lowest_price_brutto: r.lowest_price_brutto ?? null,
    lowest_price_source: r.lowest_price_source ?? null,
    lowest_price_source_custom: r.lowest_price_source_custom ?? null,

    products: {
      product_name: r.product_name,
      ean: r.ean,
      brand: r.brand,
      gruppe: r.gruppe,
      category: r.category,
      retail_price: r.retail_price,
      vrg: r.vrg,
      dealer_invoice_price: r.dealer_invoice_price,
      support_on_invoice: r.support_on_invoice,
      tactical_support: r.tactical_support,
      suisa: r.suisa,
    },
  }));

  // Meta
  const meta = {
    submissionId,
    createdAt: order.created_at,
    status: order.status,
    typ: order.typ,
    bestellweg: order.bestellweg,
    orderNumber: order.order_number,
    dealerReference: order.dealer_reference,
    customerNumber: order.dealer_login_nr,
    dealerCompany: order.dealer_name,
    dealerName: order.dealer_contact_person,
    dealerEmail: order.dealer_email ?? order.mail_dealer,
    dealerPhone: order.dealer_phone,
    dealerStreet: order.dealer_street,
    dealerZip: order.dealer_zip,
    dealerCity: order.dealer_city,
    dealerCountry: order.dealer_country,
    dealerLanguage: order.dealer_language ?? "de_CH",
    kamName: order.kam_name,
    kamEmail: order.kam_email,
    kamEmail2: order.kam_email_2,
    kamSonyEmail: order.kam_email_sony,
    mailBG: order.mail_bg,
    mailBG2: order.mail_bg2,
    distributorId: order.distributor_id,
    distributorName: order.distributor_name,
    distributorCode: order.distributor_code,
    distributorEmail: order.distributor_email,
    deliveryName: order.delivery_name,
    deliveryStreet: order.delivery_street,
    deliveryZip: order.delivery_zip,
    deliveryCity: order.delivery_city,
    deliveryCountry: order.delivery_country,
    orderComment: order.order_comment,
    requested_delivery: order.requested_delivery,
    requested_delivery_date: order.requested_delivery_date,
  };

  const lang = (order.dealer_language as "de_CH" | "fr_CH" | "it_CH") ?? "de_CH";
  const txt = orderMailTexts[stage][lang];

  // Build HTML
  const dealerHtml = buildDealerOrderEmailHTML({ meta, items, text: txt });
  const distiHtml = buildDistiOrderEmailHTML({ meta, items });

  // Recipients
  const dealerRecipients = cleanEmails([order.dealer_email, order.mail_dealer]);
  const sonyKamRecipients = cleanEmails([order.kam_email_sony]);

  const distiRecipients = cleanEmails([
    order.distributor_email,
    order.kam_email_sony,
    order.kam_email,
    order.kam_email_2,
  ]);

  // ---------------------------------------------------
  // STAGE: PLACED
  // ---------------------------------------------------

  if (stage === "placed") {
    const recipients = cleanEmails([...dealerRecipients, ...sonyKamRecipients]);
    const subject = txt.subject;

    if (preview) {
      return {
        ok: true,
        stage,
        preview: true,
        dealer: { html: dealerHtml, recipients, subject },
      };
    }

    const mailRes = await sendMail({
      to: recipients.length ? recipients : ["test@p5connect.ch"],
      subject,
      html: dealerHtml,
    });

    if ((mailRes as any)?.error) {
      return { ok: false, error: "mail_failed" };
    }

    return { ok: true, preview: false };
  }

  // ---------------------------------------------------
  // STAGE: CONFIRMED
  // ---------------------------------------------------
  if (stage === "confirmed") {
    const dealerSubject = txt.subject;
    const distiSubject = `Neue Bestellung von ${order.dealer_name ?? "P5-Partner"}`;

    if (preview) {
      return {
        ok: true,
        stage,
        preview: true,
        dealer: {
          html: dealerHtml,
          recipients: dealerRecipients,
          subject: dealerSubject,
        },
        disti: {
          html: distiHtml,
          recipients: distiRecipients,
          subject: distiSubject,
        },
      };
    }

    const dealerRes = await sendMail({
      to: dealerRecipients.length ? dealerRecipients : ["test@p5connect.ch"],
      subject: dealerSubject,
      html: dealerHtml,
    });

    const distiRes = await sendMail({
      to: distiRecipients.length ? distiRecipients : ["test@p5connect.ch"],
      subject: distiSubject,
      html: distiHtml,
    });

    if ((dealerRes as any)?.error || (distiRes as any)?.error) {
      return { ok: false, error: "mail_failed" };
    }

    return { ok: true, preview: false };
  }

  return { ok: false, error: "invalid_stage" };
}
