// API-Helper für deine App

// Bestellung (Order)
export async function submitOrder(dealer_id: number, items: any[]) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealer_id, items, type: "order" }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Fehler beim Absenden der Bestellung");
  return result;
}

// Projektanfrage (Project)
export async function submitProject(dealer_id: number, items: any[], kommentar?: string) {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealer_id, items, kommentar }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Fehler beim Absenden der Projektanfrage");
  return result;
}

// Support-Antrag (Support)
export async function submitSupport(
  dealer_id: number,
  support_typ: string,
  betrag: number,
  kommentar?: string
) {
  const res = await fetch("/api/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dealer_id, support_typ, betrag, kommentar }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Fehler beim Absenden des Supports");
  return result;
}

// Cashback-Antrag (Cashback)
export async function submitCashback(
  dealer_id: number,
  cashback_type: string,
  cashback_betrag: number,
  seriennummer: string,
  seriennummer_sb?: string,
  soundbar_ean?: string
) {
  const res = await fetch("/api/cashback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dealer_id,
      cashback_type,
      cashback_betrag,
      seriennummer,
      seriennummer_sb,
      soundbar_ean,
    }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Fehler beim Absenden des Cashbacks");
  return result;
}
