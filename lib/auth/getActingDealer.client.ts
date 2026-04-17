export function getActingDealerIdFromCookie(): number | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)acting_dealer_id=([^;]+)/);
  if (!match) return null;

  const id = Number(decodeURIComponent(match[1]));
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function getActingDealerNameFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(/(?:^|;\s*)acting_dealer_name=([^;]+)/);
  if (!match) return null;

  const name = decodeURIComponent(match[1]).trim();
  return name || null;
}