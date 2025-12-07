// lib/emails/orderEmail.ts
type Dist = { name?: string | null; email?: string | null };

type Item = {
  menge?: number;
  preis?: number;
  products?: { product_name?: string; ean?: string };
};

type OrderMeta = {
  // Bestell-/Kunden-/Händlerinfos
  orderNumber?: string | number | null;
  customerNumber?: string | number | null;
  customerName?: string | null;
  customerContact?: string | null;
  customerPhone?: string | null;

  dealerCompany?: string | null;
  dealerName?: string | null;
  dealerEmail?: string | null;
  dealerPhone?: string | null;
  dealerStreet?: string | null;
  dealerZip?: string | null;
  dealerCity?: string | null;
  dealerCountry?: string | null;

  // 🆕 Lieferadresse
  deliveryName?: string | null;
  deliveryStreet?: string | null;
  deliveryZip?: string | null;
  deliveryCity?: string | null;
  deliveryCountry?: string | null;

  // 🆕 Kommentar zur Bestellung
  orderComment?: string | null;

  kamName?: string | null;
  kamEmail?: string | null;
  kamSonyEmail?: string | null; 
};

function clean(v?: string | null) {
  return (v ?? "").toString().trim().replace(/\s+/g, " ");
}

/* ========================================================================== */
/* 🏪 Händleradresse                                                          */
/* ========================================================================== */
function addressBlock(meta: OrderMeta) {
  const rows: string[] = [];

  const company = clean(meta.dealerCompany);
  const name = clean(meta.dealerName);
  const street = clean(meta.dealerStreet);
  const zip = clean(meta.dealerZip);
  const city = clean(meta.dealerCity);
  const country = clean(meta.dealerCountry);
  const email = clean(meta.dealerEmail);
  const phone = clean(meta.dealerPhone);

  if (company && name) {
    if (company.toLowerCase() !== name.toLowerCase()) {
      rows.push(company, name);
    } else {
      rows.push(company);
    }
  } else if (company) rows.push(company);
  else if (name) rows.push(name);

  const addressLine = [street, [zip, city].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  if (addressLine) rows.push(addressLine);
  if (country) rows.push(country);

  const contact = [email, phone].filter(Boolean).join(" · ");
  if (contact) rows.push(contact);

  return rows.length
    ? `<p style="margin:0 0 10px;"><strong>Händleradresse</strong><br/>${rows.join("<br/>")}</p>`
    : "";
}

/* ========================================================================== */
/* 📦 Abweichende Lieferadresse                                               */
/* ========================================================================== */
function deliveryBlock(meta: OrderMeta) {
  const rows: string[] = [];
  const name = clean(meta.deliveryName);
  const street = clean(meta.deliveryStreet);
  const zip = clean(meta.deliveryZip);
  const city = clean(meta.deliveryCity);
  const country = clean(meta.deliveryCountry);

  if (!name && !street && !zip && !city) return "";

  const line1 = name ? name : "";
  const line2 = [street, [zip, city].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  const line3 = country || "";

  [line1, line2, line3].filter(Boolean).forEach((l) => rows.push(l));

  return rows.length
    ? `<p style="margin:12px 0 10px;"><strong>Lieferadresse</strong><br/>${rows.join("<br/>")}</p>`
    : "";
}

/* ========================================================================== */
/* 📋 Bestellinfos (KAM, Ansprechpartner, etc.)                               */
/* ========================================================================== */
function orderFacts(meta: OrderMeta) {
  const facts = [
    meta.orderNumber
      ? `<tr><td style="padding:4px 8px;">Bestell-Nr.</td><td style="padding:4px 8px;"><strong>${meta.orderNumber}</strong></td></tr>`
      : "",
    meta.customerNumber
      ? `<tr><td style="padding:4px 8px;">Kunden-Nr.</td><td style="padding:4px 8px;">${meta.customerNumber}</td></tr>`
      : "",
    meta.customerName
      ? `<tr><td style="padding:4px 8px;">Kunde</td><td style="padding:4px 8px;">${meta.customerName}</td></tr>`
      : "",
    meta.customerContact
      ? `<tr><td style="padding:4px 8px;">Ansprechpartner</td><td style="padding:4px 8px;">${meta.customerContact}</td></tr>`
      : "",
    meta.customerPhone
      ? `<tr><td style="padding:4px 8px;">Telefon</td><td style="padding:4px 8px;">${meta.customerPhone}</td></tr>`
      : "",

    // 👉 NEUE SONY-KAM-LOGIK
    meta.kamName || meta.kamSonyEmail || meta.kamEmail
      ? `<tr>
          <td style="padding:4px 8px;">KAM</td>
          <td style="padding:4px 8px;">
            ${[
              meta.kamName,
              meta.kamSonyEmail || meta.kamEmail
            ]
              .filter(Boolean)
              .join(" · ")}
          </td>
        </tr>`
      : "",
  ].filter(Boolean);

  return facts.length
    ? `
      <table style="border-collapse:collapse;border:1px solid #eee;margin:10px 0;width:100%;">
        <tbody>${facts.join("")}</tbody>
      </table>
    `
    : "";
}


/* ========================================================================== */
/* ✉️ HTML-Gesamtvorlage                                                     */
/* ========================================================================== */
export function buildOrderEmailHTML(params: {
  distributor: Dist;
  items: Item[];
  meta: OrderMeta;
}) {
  const { distributor, items, meta } = params;

  const rows = (items || [])
    .map(
      (i) => `
        <tr>
          <td style="padding:6px;border-top:1px solid #eee;">${i.products?.product_name ?? "-"}</td>
          <td style="padding:6px;border-top:1px solid #eee;">${i.products?.ean ?? "-"}</td>
          <td style="padding:6px;border-top:1px solid #eee;">${i.menge ?? "-"}</td>
          <td style="padding:6px;border-top:1px solid #eee;">${(i.preis ?? 0).toFixed(2)} CHF</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;color:#333;line-height:1.6;">
    <h2 style="color:#1E3A8A;margin:0 0 8px;">Neue Bestellung – ${meta.dealerCompany || meta.dealerName || "-"}</h2>
    <p style="margin:0 0 12px;">Liebes ${distributor.name || "Distributor"}-Team,</p>

    <p style="margin:0 0 12px;">
      Bitte diese Bestellung in Ihrem System erfassen und zu den untenstehenden Konditionen ausliefern.
    </p>

    ${addressBlock(meta)}
    ${deliveryBlock(meta)}
    ${orderFacts(meta)}

    ${
      meta.orderComment
        ? `<p style="margin:10px 0 15px;padding:10px;border-left:4px solid #1E3A8A;background:#f9fafb;">
            <strong>Kommentar:</strong><br/>${meta.orderComment}
          </p>`
        : ""
    }

    <p style="margin:12px 0 6px;"><strong>Bestellpositionen</strong></p>
    <table style="border-collapse:collapse;margin-top:6px;width:100%;border:1px solid #ddd;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th align="left" style="padding:6px;">Produkt</th>
          <th align="left" style="padding:6px;">EAN</th>
          <th align="left" style="padding:6px;">Menge</th>
          <th align="left" style="padding:6px;">Preis</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <p style="margin-top:15px;">Mit freundlichen Grüssen,<br/><strong>P5connect-Team</strong></p>
  </div>`;
}
