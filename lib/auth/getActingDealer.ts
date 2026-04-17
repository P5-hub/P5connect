import { cookies } from "next/headers";

export async function getActingDealerId(): Promise<number | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("acting_dealer_id")?.value;

  if (!raw) return null;

  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function getActingDealerName(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("acting_dealer_name")?.value;

  if (!raw || !raw.trim()) return null;
  return raw.trim();
}

export async function getActingDealerContext() {
  const [actingDealerId, actingDealerName] = await Promise.all([
    getActingDealerId(),
    getActingDealerName(),
  ]);

  return {
    actingDealerId,
    actingDealerName,
    isActingAsDealer: !!actingDealerId,
  };
}