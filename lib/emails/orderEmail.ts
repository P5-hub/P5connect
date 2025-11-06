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
  customerContact?: string | null; // z.B. Ansprechpartner Kunde
  customerPhone?: string | null;

  dealerCompany?: string | null;
  dealerName?: string | null;
  dealerEmail?: string | null;
  dealerPhone?: string | null;
  dealerStreet?: string | null;
  dealerZip?: string | null;
  dealerCity?: string | null;
  dealerCountry?: string | null;

  kamName?: string | null;
  kamEmail?: string | null;
};

function addressBlock(meta: OrderMeta) {
  // Helpers
  const clean = (v?: string | null) =>
    (v ?? "").toString().trim().replace(/\s+/g, " ");

  const same = (a?: string | null, b?: string | null) =>
    clean(a).toLowerCase() === clean(b).toLowerCase();

  const contained = (a?: string | null, b?: string | null) =>
    !!clean(a) && !!clean(b) &&
    (clean(a).toLowerCase().includes(clean(b).toLowerCase()) ||
     clean(b).toLowerCase().includes(clean(a).toLowerCase()));

  const company = clean(meta.dealerCompany);
  const name    = clean(meta.dealerName);
  const street  = clean(meta.dealerStreet);
  const zip     = clean(meta.dealerZip);
  const city    = clean(meta.dealerCity);
  const country = clean(meta.dealerCountry);
  const email   = clean(meta.dealerEmail);
  const phone   = clean(meta.dealerPhone);

  const rows: string[] = [];

  // 1) Kopfzeile: Company/Name (ohne Duplikate)
  if (company && name) {
    if (same(company, name) || contained(company, name)) {
      rows.push(company.length >= name.length ? company : name);
    } else {
      rows.push(company, name);
    }
  } else if (company) {
    rows.push(company);
  } else if (name) {
    rows.push(name);
  }

  // 2) Adresse
  const line2 = [street, [zip, city].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
  if (line2) rows.push(line2);
  if (country) rows.push(country);

  // 3) Kontakt
  const contact = [email, phone].filter(Boolean).join(" · ");
  if (contact) rows.push(contact);

  return rows.length
    ? `<p style="margin:0 0 10px;"><strong>Händler</strong><br/>${rows.join("<br/>")}</p>`
    : "";
}


function orderFacts(meta: OrderMeta) {
  const facts = [
    meta.orderNumber ? `<tr><td style="padding:4px 8px;">Bestell-Nr.</td><td style="padding:4px 8px;"><strong>${meta.orderNumber}</strong></td></tr>` : "",
    meta.customerNumber ? `<tr><td style="padding:4px 8px;">Kunden-Nr.</td><td style="padding:4px 8px;">${meta.customerNumber}</td></tr>` : "",
    meta.customerName ? `<tr><td style="padding:4px 8px;">Kunde</td><td style="padding:4px 8px;">${meta.customerName}</td></tr>` : "",
    meta.customerContact ? `<tr><td style="padding:4px 8px;">Ansprechpartner</td><td style="padding:4px 8px;">${meta.customerContact}</td></tr>` : "",
    meta.customerPhone ? `<tr><td style="padding:4px 8px;">Telefon</td><td style="padding:4px 8px;">${meta.customerPhone}</td></tr>` : "",
    meta.kamName || meta.kamEmail ? `<tr><td style="padding:4px 8px;">KAM</td><td style="padding:4px 8px;">${[meta.kamName, meta.kamEmail].filter(Boolean).join(" · ")}</td></tr>` : "",
  ].filter(Boolean);

  return facts.length
    ? `
      <table style="border-collapse:collapse;border:1px solid #eee;margin:10px 0;width:100%;">
        <tbody>
          ${facts.join("")}
        </tbody>
      </table>
    `
    : "";
}

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
    <p style="margin:0 0 12px;">Good News! Liebes ${distributor.name} Team,</p>

    
    <div style="font-family:Arial,sans-serif;color:#333;">
    

    <p style="margin:0 0 12px;">
      bitte diese Bestellung in Ihrem System erfassen und zu den untenstehenden Konditionen ausliefern.
    </p>

    <!-- hier deine Meta-Boxen (KAM, Adresse, Bestellnr., Kundennr., Ansprechpartner, etc.) -->
    <!-- ... -->
    <!-- danach die Artikeltabelle -->  

    ${addressBlock(meta)}
    ${orderFacts(meta)}

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
