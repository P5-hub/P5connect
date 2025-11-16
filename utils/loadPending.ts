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
    crypto.randomUUID(); // ⬅ garantiert eindeutige ID

  const resolveTimestamp = (obj: any) =>
    obj.created_at ??
    obj.submitted_at ??
    obj.timestamp ??
    obj.created ??
    new Date().toISOString(); // ⬅ robustes Timestamp-Fallback

  /* ---------------- submissions ---------------- */
  const { data: subs } = await supabase.from("submissions").select("*");

  if (subs) {
    subs.forEach((s: any) => {
      if (s.status !== "pending") return;
      if (s.typ === "verkauf") return; // Verkauf nicht anzeigen

      list.push({
        id: normalizeID(s),
        typ: s.typ,
        title: mapping[s.typ] ?? "Einreichung",
        created_at: resolveTimestamp(s),
      });

      if (s.typ === "promotion") counts.promotions++;
      if (s.typ === "projekt") counts.projekts++;
      if (s.typ === "bestellung") counts.bestellungen++;
      if (s.typ === "support") counts.support++;
      if (s.typ === "monatsaktion") counts.aktionen++;
      if (s.typ === "cashback") counts.cashback++;
    });
  }

  /* ---------------- promotion_claims ---------------- */
  const { data: promo } = await supabase
    .from("promotion_claims")
    .select("*");

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

  /* ---------------- SORT newest first ---------------- */
  list.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  return { counts, list };
}
