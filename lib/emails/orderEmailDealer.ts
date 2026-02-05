import { translationsByLang, type Lang } from "../i18n/translations";

// -------------------------------------------------------
// Hilfsfunktion zum Normalisieren aller Email-Keys
// -------------------------------------------------------
function normalizeEmailLabels(raw: any) {
  return {
    firmendaten: raw.firmendaten,
    ansprechperson: raw.ansprechperson,
    email: raw.email,
    telefon: raw.telefon,

    // Kundennummer
    kundennr: raw.kundennr ?? raw.kundenNr,

    // KAM
    kam: raw.kam,
    kam_email: raw.kam_email ?? raw.kamEmail,

    // Lieferinfos
    lieferoption: raw.lieferoption,
    lieferdatum: raw.lieferdatum,
    lieferadresse_warn: raw.lieferadresse_warn ?? raw.lieferadresseWarn,
    lieferadresse: raw.lieferadresse,

    // Kommentar
    kommentar: raw.kommentar,

    // Bestellinfos
    bestellpositionen: raw.bestellpositionen,
    bestellweg: raw.bestellweg,
    haendler_referenz: raw.haendler_referenz ?? raw.haendlerReferenz,
    bestellnr: raw.bestellnr ?? raw.bestellNr,

    // Zustände
    delivery_immediately: raw.delivery_immediately ?? raw.sofort,
    delivery_scheduled: raw.delivery_scheduled ?? raw.geplant,
  };
}

// -------------------------------------------------------
// Dealer Email HTML Builder – komplett erweitert
// -------------------------------------------------------
export function buildDealerOrderEmailHTML(params: {
  meta: any;
  items: any[];
  text: { intro: string; footer: string; subject: string };
}) {
  const { meta, items, text } = params;

  // Sprache bestimmen
  const rawLang = (meta.dealerLanguage || "de").split("_")[0];
  const lang: Lang = ["de", "en", "fr", "it", "rm"].includes(rawLang)
    ? (rawLang as Lang)
    : "de";

  const rawLabels = translationsByLang[lang].email;
  const t = normalizeEmailLabels(rawLabels);

  // Datum formatieren
  function formatDateCH(d: string | null) {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString("de-CH");
  }

  // Übersetzung Lieferoption
  function translateDelivery(option: string | null) {
    if (!option) return null;
    switch (option) {
      case "immediately":
        return t.delivery_immediately;
      case "scheduled":
        return t.delivery_scheduled;
      default:
        return option;
    }
  }

  // Tabellenzeilen
  const rows = items
    .map(
      (i) => `
      <tr>
          <td style="padding:8px;border-top:1px solid #eee;">
            ${i.products?.product_name ?? "-"}
          </td>
          <td style="padding:8px;border-top:1px solid #eee;">
            ${i.products?.ean ?? "-"}
          </td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:center;">
            ${i.menge ?? "-"}
          </td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">
            ${(i.preis ?? 0).toFixed(2)} CHF
          </td>
      </tr>`
    )
    .join("");

  const deliveryTranslated = translateDelivery(meta.requested_delivery);
  const deliveryDate = formatDateCH(meta.requested_delivery_date);

  // Händler-Referenz
  const dealerReferenceLine = meta.dealerReference
    ? `<strong>${t.haendler_referenz}:</strong> ${meta.dealerReference}<br/>`
    : "";

  // Händlerblock (übersetzt)
  const dealerBlock = `
    <div style="margin-top:18px;padding:14px;background:#f9fafb;border-radius:8px;">
      <strong style="font-size:15px;color:#111;">${t.firmendaten}</strong><br/>
      ${meta.dealerCompany ?? "-"}<br/>
      ${meta.dealerStreet ?? ""}<br/>
      ${meta.dealerZip ?? ""} ${meta.dealerCity ?? ""}<br/>
      ${meta.dealerCountry ?? ""}<br/><br/>

      <strong>${t.ansprechperson}:</strong> ${meta.dealerName ?? "-"}<br/>
      <strong>${t.email}:</strong> ${meta.dealerEmail ?? "-"}<br/>
      <strong>${t.telefon}:</strong> ${meta.dealerPhone ?? "-"}<br/>
      <strong>${t.kundennr}:</strong> ${meta.dealerLoginNr ?? "-"}<br/><br/>

      <strong>${t.kam}:</strong> ${meta.kamName ?? "-"}<br/>
      <strong>${t.kam_email}:</strong> ${meta.kamSonyEmail ?? "-"}
    </div>
  `;


  // Lieferoptionen
  const deliveryBlock =
    deliveryTranslated || deliveryDate
      ? `
      <div style="margin-top:14px;padding:12px;background:#eef2ff;border-radius:8px;
                  border-left:5px solid #6366f1;">
        <strong style="font-size:15px;color:#3730a3;">${t.lieferoption}</strong><br/>
        ${deliveryTranslated ? `${deliveryTranslated}<br/>` : ""}
        ${deliveryDate ? `<strong>${t.lieferdatum}:</strong> ${deliveryDate}<br/>` : ""}
      </div>`
      : "";

  // Direktlieferung
  const hasAltDelivery =
  meta.deliveryName || meta.deliveryStreet || meta.deliveryZip || meta.deliveryCity || meta.deliveryPhone || meta.deliveryEmail;

  const altDeliveryBlock = hasAltDelivery
    ? `
        <div style="margin-top:16px;padding:16px;border-radius:8px;
                    background:#fff4d6;border-left:5px solid #f59e0b;">
          <strong style="font-size:15px;color:#b45309;">
            ${t.lieferadresse_warn}
          </strong><br/><br/>

          ${meta.deliveryName ?? ""}<br/>
          ${meta.deliveryStreet ?? ""}<br/>
          ${meta.deliveryZip ?? ""} ${meta.deliveryCity ?? ""}<br/>
          ${meta.deliveryCountry ?? ""}

          ${
            meta.deliveryPhone || meta.deliveryEmail
              ? `<div style="margin-top:10px;">
                  ${meta.deliveryPhone ? `<strong>${t.telefon}:</strong> ${meta.deliveryPhone}<br/>` : ""}
                  ${meta.deliveryEmail ? `<strong>${t.email}:</strong> ${meta.deliveryEmail}<br/>` : ""}
                </div>`
              : ""
          }

          ${
            meta.dealerReference
              ? `<div style="margin-top:10px;">
                  <strong>${t.haendler_referenz}:</strong> ${meta.dealerReference}
                </div>`
              : ""
          }
        </div>`
    : "";


  // Kommentarblock
  const commentBlock = meta.orderComment
    ? `
    <div style="margin-top:16px;padding:14px;background:#fff8e1;border-left:5px solid #fbbf24;border-radius:6px;">
      <strong style="color:#7c5c00;">${t.kommentar}:</strong><br/>
      ${meta.orderComment}
    </div>`
    : "";

  // FINAL HTML
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#333;padding:20px;">
      <h2 style="color:#2563EB;margin-bottom:6px;">${text.subject}</h2>
      <p>${text.intro}</p>

      <div style="margin-top:12px;">
        ${dealerReferenceLine}
        <strong>${t.bestellnr}:</strong> ${meta.orderNumber ?? meta.submissionId}<br/>
        <strong>${t.bestellweg}:</strong> ${meta.bestellweg ?? "-"}<br/>
      </div>

      ${deliveryBlock}
      ${dealerBlock}
      ${altDeliveryBlock}
      ${commentBlock}

      <h3 style="margin-top:26px;margin-bottom:10px;">${t.bestellpositionen}</h3>

      <table style="border-collapse:collapse;width:100%;border:1px solid #ddd;">
        <thead style="background:#eef2ff;">
          <tr>
            <th style="padding:8px;">Produkt</th>
            <th style="padding:8px;">EAN</th>
            <th style="padding:8px;">Menge</th>
            <th style="padding:8px;">Preis</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="margin-top:26px;">
        ${text.footer}<br/><br/>
        <strong>P5connect</strong>
      </p>
    </div>
  `;
}
