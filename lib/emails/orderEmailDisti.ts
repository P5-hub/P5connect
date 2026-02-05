// ======================================================================
//  buildDistiOrderEmailHTML – FINAL VERSION (aligned with Dealer Version)
// ======================================================================
export function buildDistiOrderEmailHTML(params: {
  meta: any;
  items: any[];
}) {
  const { meta, items } = params;

  // ------------------------------------------------------------
  // Hilfsfunktionen
  // ------------------------------------------------------------
  function formatDateCH(d: string | null) {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toLocaleDateString("de-CH");
  }

  function translateRequestedDelivery(v: string | null) {
    if (!v) return null;
    switch (v) {
      case "immediately":
        return "Sofort";
      case "scheduled":
        return "Geplante Lieferung";
      default:
        return v;
    }
  }

  // ------------------------------------------------------------
  // Items
  // ------------------------------------------------------------
  const rows = items
    .map((i) => {
      const preis = i.preis?.toFixed?.(2) ?? "-";
      const poiNeu = i.calc_price_on_invoice?.toFixed?.(2) ?? "-";
      const poiAlt = i.poi_alt?.toFixed?.(2) ?? "-";
      const invest = i.invest?.toFixed?.(2) ?? "-";
      const street = i.lowest_price_brutto?.toFixed?.(2) ?? "-";

      const quelle =
        i.lowest_price_source === "Andere" && i.lowest_price_source_custom
          ? `Andere (${i.lowest_price_source_custom})`
          : i.lowest_price_source ?? "-";

      return `
        <tr>
          <td style="padding:8px;border-top:1px solid #eee;">${i.products?.product_name ?? "-"}</td>
          <td style="padding:8px;border-top:1px solid #eee;">${i.products?.ean ?? "-"}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:center;">${i.menge ?? "-"}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">${preis}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">${poiNeu}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">${poiAlt}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">${invest}</td>
          <td style="padding:8px;border-top:1px solid #eee;text-align:right;">${street}</td>
          <td style="padding:8px;border-top:1px solid #eee;">${quelle}</td>
        </tr>
      `;
    })
    .join("");

  // ------------------------------------------------------------
  // Händlerblock
  // ------------------------------------------------------------
  const dealerBlock = `
    <div style="margin-top:10px;padding:12px;background:#f9fafb;border-radius:8px;">
      <strong style="font-size:15px;color:#111;">Händler</strong><br/>
      ${meta.dealerCompany ?? "-"}<br/>
      ${meta.dealerStreet ?? ""}<br/>
      ${meta.dealerZip ?? ""} ${meta.dealerCity ?? ""}<br/>
      ${meta.dealerCountry ?? ""}<br/><br/>

      <strong>Ansprechperson:</strong> ${meta.dealerName ?? "-"}<br/>
      <strong>E-Mail:</strong> ${meta.dealerEmail ?? "-"}<br/>
      <strong>Telefon:</strong> ${meta.dealerPhone ?? "-"}<br/>
      <strong>Kunden-Nr.:</strong> ${meta.dealerLoginNr ?? "-"}
    </div>
  `;

  // ------------------------------------------------------------
  // KAM Block
  // ------------------------------------------------------------
  const kamEmailFinal = meta.kamSonyEmail || meta.kamEmail || "-";

  const kamBlock =
    meta.kamName || kamEmailFinal
      ? `
    <div style="margin-top:10px;padding:12px;background:#f9fafb;border-radius:8px;">
      <strong style="font-size:15px;color:#111;">KAM</strong><br/>
      ${[meta.kamName, kamEmailFinal].filter(Boolean).join(" · ")}
    </div>
  `
      : "";

  // ------------------------------------------------------------
  // Wunschlieferung
  // ------------------------------------------------------------
  const translatedDelivery = translateRequestedDelivery(meta.requested_delivery);
  const requestedDate = formatDateCH(meta.requested_delivery_date);

  const requestedDeliveryBlock =
    translatedDelivery || requestedDate
      ? `
        <div style="margin-top:14px;padding:12px;background:#eef2ff;border-radius:8px;
                    border-left:5px solid #6366f1;">
          <strong style="font-size:15px;color:#3730a3;">Lieferoptionen</strong><br/>
          ${translatedDelivery ? `<strong>Lieferung:</strong> ${translatedDelivery}<br/>` : ""}
          ${requestedDate ? `<strong>Geplantes Lieferdatum:</strong> ${requestedDate}<br/>` : ""}
        </div>
      `
      : "";

  // ------------------------------------------------------------
  // Direktlieferung: abweichende Lieferadresse
  // ------------------------------------------------------------
  const hasDeliveryAddress =
    meta.deliveryName || meta.deliveryStreet || meta.deliveryZip || meta.deliveryCity || meta.deliveryPhone || meta.deliveryEmail;

  const deliveryBlock = hasDeliveryAddress
    ? `
      <div style="margin-top:16px;padding:16px;border-radius:8px;
                  background:#fff4d6;border-left:5px solid #f59e0b;">
        
        <strong style="font-size:15px;color:#b45309;">
          ⚠️ Direktlieferung – Abweichende Lieferadresse
        </strong><br/><br/>

        ${meta.deliveryName ?? ""}<br/>
        ${meta.deliveryStreet ?? ""}<br/>
        ${meta.deliveryZip ?? ""} ${meta.deliveryCity ?? ""}<br/>
        ${meta.deliveryCountry ?? ""}

        ${
          meta.deliveryPhone || meta.deliveryEmail
            ? `<div style="margin-top:10px;">
                ${meta.deliveryPhone ? `<strong>Telefon:</strong> ${meta.deliveryPhone}<br/>` : ""}
                ${meta.deliveryEmail ? `<strong>E-Mail:</strong> ${meta.deliveryEmail}<br/>` : ""}
              </div>`
            : ""
        }

        ${
          meta.dealerReference
            ? `<div style="margin-top:10px;">
                <strong>Händler-Referenz:</strong> ${meta.dealerReference}
              </div>`
            : ""
        }
      </div>
    `
    : "";


  // ------------------------------------------------------------
  // Kommentar
  // ------------------------------------------------------------
  const commentBlock = meta.orderComment
    ? `
    <div style="margin-top:16px;padding:14px;background:#fff8e1;border-left:5px solid #fbbf24;border-radius:6px;">
      <strong style="color:#7c5c00;">Kommentar des Händlers:</strong><br/>
      ${meta.orderComment}
    </div>`
    : "";

  // ------------------------------------------------------------
  // FINAL HTML
  // ------------------------------------------------------------
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.55;color:#333;width:100%;max-width:none;box-sizing:border-box;">

        <h2 style="color:#C2410C;margin-bottom:6px;">Neue Händlerbestellung</h2>
        <p style="margin-bottom:14px;">
          Bitte diese Bestellung erfassen und zu den untenstehenden Konditionen ausführen.
        </p>

        <div style="margin-bottom:12px;">
          <strong>P5 Bestell-Nr.:</strong> ${meta.orderNumber ?? meta.submissionId}<br/>
          <strong>Bestellweg:</strong> ${meta.bestellweg ?? "-"}
        </div>

        ${requestedDeliveryBlock}
        ${dealerBlock}
        ${kamBlock}
        ${commentBlock}
        ${deliveryBlock}

        <h3 style="margin-top:24px;margin-bottom:6px;">Bestellpositionen</h3>

        <table style="border-collapse:collapse;width:100%;border:1px solid #ddd;">
          <thead style="background:#f3f4f6;">
            <tr>
              <th style="padding:8px;">Produkt</th>
              <th style="padding:8px;">EAN</th>
              <th style="padding:8px;">Menge</th>
              <th style="padding:8px;">Preis</th>
              <th style="padding:8px;">POI neu</th>
              <th style="padding:8px;">POI alt</th>
              <th style="padding:8px;">Invest</th>
              <th style="padding:8px;">Street</th>
              <th style="padding:8px;">Quelle</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <p style="margin-top:24px;">Mit freundlichen Grüssen<br/><strong>P5connect System</strong></p>
    </div>
  `;
}
