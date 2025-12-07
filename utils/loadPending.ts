import { createClient } from "@/utils/supabase/client";

export type UnifiedPendingCounts = {
  promotions: number;
  sofortrabatt: number;
  projekts: number;
  bestellungen: number;
  support: number;
  aktionen: number;
  cashback: number;
};

export type UnifiedPendingEntry = {
  id: string | number;
  typ: string;
  title: string;
  created_at: string;
};

export async function loadAllPending() {
  const supabase = createClient();

  const list: UnifiedPendingEntry[] = [];
  const counts: UnifiedPendingCounts = {
    promotions: 0,
    sofortrabatt: 0,
    projekts: 0,
    bestellungen: 0,
    support: 0,
    aktionen: 0,
    cashback: 0,
  };

  // ⭐ Einheitliches Typ-Mapping (Normalisierung)
  const normalizeTyp = (t: string): string => {
    const x = t?.toLowerCase() ?? "";

    if (x === "order" || x === "orders" || x === "einreichung") return "bestellung";
    if (x === "projekt" || x === "projekts" || x === "projekte") return "projekt";
    if (x === "promotion" || x === "promotions") return "promotion";
    if (x === "sofortrabatt" || x === "sofort") return "sofortrabatt";
    if (x === "cashback" || x === "cashbacks") return "cashback";
    if (x === "monatsaktion" || x === "monatsaktionen") return "monatsaktion";

    return x; // fallback: unverändert
  };

  // Titel-Mapping
  const mapping: Record<string, string> = {
    promotion: "Promotion",
    projekt: "Projektanfrage",
    bestellung: "Bestellung",
    support: "Support",
    monatsaktion: "Monatsaktion",
    cashback: "Cashback",
    sofortrabatt: "Sofortrabatt-Antrag",
  };

  const normalizeID = (obj: any) =>
    obj.id ??
    obj.claim_id ??
    obj.submission_id ??
    crypto.randomUUID();

  const resolveTimestamp = (obj: any) =>
    obj.created_at ??
    obj.submitted_at ??
    obj.timestamp ??
    obj.created ??
    new Date().toISOString();

  /* ---------------- submissions ---------------- */
  const { data: subs } = await supabase.from("submissions").select("*");

  if (subs) {
    subs.forEach((s: any) => {
      if (s.status !== "pending") return;

      // Verkauf wird nie angezeigt
      if (s.typ === "verkauf") return;

      // ⭐ Typ normalisieren (wichtig!)
      const typ = normalizeTyp(s.typ);

      list.push({
        id: normalizeID(s),
        typ,
        title: mapping[typ] ?? "Einreichung",
        created_at: resolveTimestamp(s),
      });

      // Sicheres Zählen
      if (typ === "promotion") counts.promotions++;
      if (typ === "projekt") counts.projekts++;
      if (typ === "bestellung") counts.bestellungen++;
      if (typ === "support") counts.support++;
      if (typ === "monatsaktion") counts.aktionen++;
      if (typ === "cashback") counts.cashback++;
    });
  }

  /* ---------------- promotion_claims ---------------- */
  const { data: promo } = await supabase.from("promotion_claims").select("*");

  if (promo) {
    promo.forEach((p: any) => {
      if (p.status !== "pending") return;

      list.push({
        id: normalizeID(p),
        typ: "promotion",
        title: "Promotion-Claim",
        created_at: resolveTimestamp(p),
      });

      counts.promotions++;
    });
  }

  /* ---------------- sofortrabatt_claims ---------------- */
  const { data: sofort } = await supabase
    .from("sofortrabatt_claims")
    .select("*");

  if (sofort) {
    sofort.forEach((p: any) => {
      if (p.status !== "pending") return;

      list.push({
        id: normalizeID(p),
        typ: "sofortrabatt",
        title: "Sofortrabatt-Antrag",
        created_at: resolveTimestamp(p),
      });

      counts.sofortrabatt++;
    });
  }

  /* ---------------- cashback_claims ---------------- */
  const { data: cash } = await supabase.from("cashback_claims").select("*");

  if (cash) {
    cash.forEach((c: any) => {
      if (c.status !== "pending") return;

      list.push({
        id: normalizeID(c),
        typ: "cashback",
        title: "Cashback-Antrag",
        created_at: resolveTimestamp(c),
      });

      counts.cashback++;
    });
  }

  /* ---------------- SORT newest first ---------------- */
  list.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  return { counts, list };
}
