"use server";

import { getSupabaseServer } from "@/utils/supabase/server";
import { sendMail, cleanEmails } from "@/lib/mailer";
import { buildDealerOrderEmailHTML } from "@/lib/emails/orderEmailDealer";
import { buildDistiOrderEmailHTML } from "@/lib/emails/orderEmailDisti";
import { orderMailTexts } from "@/lib/emails/orderMailTexts";

function debugOrderMail(stage: string, preview: boolean, meta: any, recipients: any) {
  console.log("📧 ORDER MAIL DEBUG ----------------------------");
  console.log("Stage:", stage, "| Preview:", preview);
  console.log("Order:", meta.orderNumber, "| Submission:", meta.submissionId);

  console.log("Dealer:", {
    name: meta.dealerCompany,
    email: meta.dealerEmail,
    phone: meta.dealerPhone,
    reference: meta.dealerReference,
  });

  console.log("KAM:", {
    kamName: meta.kamName,
    kamEmail: meta.kamEmail,
    kamEmail2: meta.kamEmail2,
    kamSonyEmail: meta.kamSonyEmail,
  });

  console.log("Delivery Contact:", {
    deliveryName: meta.deliveryName,
    deliveryPhone: meta.deliveryPhone,
    deliveryEmail: meta.deliveryEmail,
  });

  console.log("Recipients:", recipients);
  console.log("--------------------------------------------------");
}

// ---------------------------------------------------
// HELPERS
// ---------------------------------------------------

function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value !== "string") {
    const converted = String(value).replace(/\r?\n|\r/g, "").trim();
    return converted.length ? converted : null;
  }

  const cleaned = value.replace(/\r?\n|\r/g, "").trim();
  return cleaned.length ? cleaned : null;
}

function cleanLanguage(value: unknown): "de_CH" | "fr_CH" | "it_CH" {
  const lang = cleanText(value);

  if (lang === "fr_CH" || lang === "fr") return "fr_CH";
  if (lang === "it_CH" || lang === "it") return "it_CH";
  if (lang === "de_CH" || lang === "de") return "de_CH";

  return "de_CH";
}

function cleanNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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
// DashboardRow
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

  dealer_language: "de_CH" | "fr_CH" | "it_CH" | string | null;
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
  delivery_phone: string | null;
  delivery_email: string | null;

  customer_phone: string | null;
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

  const lang = cleanLanguage(order.dealer_language);
  const txt = orderMailTexts[stage]?.[lang] ?? orderMailTexts[stage]?.de_CH;

  if (!txt) {
    console.error("❌ Missing order mail text:", {
      stage,
      rawLanguage: order.dealer_language,
      cleanedLanguage: lang,
    });

    return { ok: false, error: "mail_text_not_found" };
  }

  // Items
  const items = rows.map((r: any) => ({
    menge: cleanNumber(r.menge),
    preis: cleanNumber(r.preis),
    invest: cleanNumber(r.invest ?? r.calc_price_on_invoice),
    calc_price_on_invoice: cleanNumber(r.calc_price_on_invoice),
    lowest_price_brutto: cleanNumber(r.lowest_price_brutto),
    lowest_price_source: cleanText(r.lowest_price_source),
    lowest_price_source_custom: cleanText(r.lowest_price_source_custom),

    products: {
      product_name: cleanText(r.product_name),
      ean: cleanText(r.ean),
      brand: cleanText(r.brand),
      gruppe: cleanText(r.gruppe),
      category: cleanText(r.category),
      retail_price: cleanNumber(r.retail_price),
      vrg: cleanNumber(r.vrg),
      dealer_invoice_price: cleanNumber(r.dealer_invoice_price),
      support_on_invoice: cleanNumber(r.support_on_invoice),
      tactical_support: cleanNumber(r.tactical_support),
      suisa: cleanNumber(r.suisa),
    },
  }));

  // Meta
  const meta = {
    submissionId,
    createdAt: cleanText(order.created_at),
    status: cleanText(order.status),
    typ: cleanText(order.typ),
    bestellweg: cleanText(order.bestellweg),
    orderNumber: cleanText(order.order_number),

    // ✅ Referenz ist bereits korrekt
    dealerReference: cleanText(order.dealer_reference),

    customerNumber: cleanText(order.dealer_login_nr),
    dealerCompany: cleanText(order.dealer_name),
    dealerName: cleanText(order.dealer_contact_person),
    dealerEmail: cleanText(order.dealer_email) ?? cleanText(order.mail_dealer),
    dealerPhone: cleanText(order.dealer_phone),

    // ✅ optional, falls dein Template orderFacts(meta.customerPhone) nutzt
    customerPhone: cleanText(order.customer_phone) ?? cleanText(order.dealer_phone),

    dealerStreet: cleanText(order.dealer_street),
    dealerZip: cleanText(order.dealer_zip),
    dealerCity: cleanText(order.dealer_city),
    dealerCountry: cleanText(order.dealer_country),
    dealerLanguage: lang,

    kamName: cleanText(order.kam_name),
    kamEmail: cleanText(order.kam_email),
    kamEmail2: cleanText(order.kam_email_2),
    kamSonyEmail: cleanText(order.kam_email_sony),
    mailBG: cleanText(order.mail_bg),
    mailBG2: cleanText(order.mail_bg2),

    distributorId: cleanText(order.distributor_id),
    distributorName: cleanText(order.distributor_name),
    distributorCode: cleanText(order.distributor_code),
    distributorEmail: cleanText(order.distributor_email),

    deliveryName: cleanText(order.delivery_name),
    deliveryStreet: cleanText(order.delivery_street),
    deliveryZip: cleanText(order.delivery_zip),
    deliveryCity: cleanText(order.delivery_city),
    deliveryCountry: cleanText(order.delivery_country),

    // ✅ Lieferkontakt
    deliveryPhone: cleanText(order.delivery_phone),
    deliveryEmail: cleanText(order.delivery_email),

    orderComment: cleanText(order.order_comment),
    requested_delivery: cleanText(order.requested_delivery),
    requested_delivery_date: cleanText(order.requested_delivery_date),
  };

  // Build HTML
  const dealerHtml = buildDealerOrderEmailHTML({ meta, items, text: txt });
  const distiHtml = buildDistiOrderEmailHTML({ meta, items });

  // Recipients
  const dealerRecipients = cleanEmails([
    cleanText(order.dealer_email),
    cleanText(order.mail_dealer),
  ]);

  const sonyKamRecipients = cleanEmails([
    cleanText(order.kam_email_sony),
  ]);

  const distiRecipients = cleanEmails([
    cleanText(order.distributor_email),
    cleanText(order.kam_email_sony),
    cleanText(order.kam_email),
    cleanText(order.kam_email_2),
  ]);

  // ---------------------------------------------------
  // STAGE: PLACED
  // ---------------------------------------------------

  if (stage === "placed") {
    const recipients = cleanEmails([...dealerRecipients, ...sonyKamRecipients]);
    const subject = cleanText(txt.subject) ?? "Neue Bestellung";

    debugOrderMail(stage, preview, meta, {
      dealerRecipients,
      sonyKamRecipients,
      finalRecipients: recipients,
    });

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
    const dealerSubject = cleanText(txt.subject) ?? "Bestellung bestätigt";
    const distiSubject = `Neue Bestellung von ${meta.dealerCompany ?? "P5-Partner"}`;

    const dealerTo = dealerRecipients.length ? dealerRecipients : ["test@p5connect.ch"];
    const distiTo = distiRecipients.length ? distiRecipients : ["test@p5connect.ch"];

    debugOrderMail(stage, preview, meta, {
      dealerRecipients,
      distiRecipients,
      finalDealerTo: dealerTo,
      finalDistiTo: distiTo,
    });

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
      to: dealerTo,
      subject: dealerSubject,
      html: dealerHtml,
    });

    const distiRes = await sendMail({
      to: distiTo,
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