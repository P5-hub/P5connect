// /lib/helpers/calcHelpers.ts

export function parseNum(v: string | number | null | undefined): number {
  if (typeof v === "number") return v;
  const s = (v ?? "").toString().replace(",", ".").trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Berechnet den Netto-UPE (ohne MwSt. & VRG)
 * Formel: (UPE brutto / 1.081) - VRG
 */
export function calcNettoUPE(retail_price: number, vrg: number): number | null {
  if (!retail_price || retail_price <= 0) return null;
  const netto = retail_price / 1.081 - (vrg || 0);
  return parseFloat(netto.toFixed(2));
}

/**
 * Berechnet die Marge in Prozent basierend auf Netto-UPE und Händler-EK.
 */
export function calcMarge(nettoRetail: number | null, dealerPrice: number): number | null {
  if (!nettoRetail || nettoRetail <= 0) return null;
  return ((nettoRetail - dealerPrice) / nettoRetail) * 100;
}

/**
 * Berechnet den Händlerpreis aus Zielmarge und Netto-UPE.
 */
export function calcPriceFromTargetMargin(nettoRetail: number, targetMarginPct: number): number {
  return nettoRetail * (1 - targetMarginPct / 100);
}

/**
 * Berechnet den Distributor-EK (POI) aus Händlerpreis.
 * Standardformel: (Preis / 0.92) * 0.865 * 0.97
 */
export function calcPOI(price: number) {
  return (price / 0.92) * 0.865 * 0.97;
}

/**
 * Berechnet den Invest (Differenz alter vs. neuer EK) je nach Distributor-Regel.
 *
 * @param rule - Regelcode aus distributors.invest_rule ("ep_formula", "simple_diff", ...)
 * @param price - Neuer EK / Zielpreis
 * @param poiAlt - Alter Preis auf Rechnung (POI alt)
 * @returns Invest-Differenz (neuer EK - alter EK)
 */
export function calcInvestByRule(rule: string, price: number, poiAlt: number): number {
  let ekNeu = 0;

  switch (rule) {
    case "ep_formula":
      ekNeu = (price / 0.92) * 0.865 * 0.97;
      break;
    case "simple_diff":
    case "default":
    default:
      ekNeu = price;
      break;
  }

  return poiAlt - ekNeu; // ✅ Korrekt: positiver Wert = Invest
}

/**
 * ✅ NEU: Berechnet die Marge auf den Streetprice (lowest_price_netto oder -brutto)
 * Wird z. B. in Dashboards und Detail-Ansichten genutzt.
 */
export function calcMargeStreet(
  streetPriceNetto: number | null,
  dealerPrice: number | null
): number | null {
  const netto = parseNum(streetPriceNetto);
  const ek = parseNum(dealerPrice);
  if (!netto || netto <= 0) return null;
  const marge = ((netto - ek) / netto) * 100;
  return parseFloat(marge.toFixed(2));
}
