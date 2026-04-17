type UserLike = {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type EffectiveDealerContext =
  | {
      role: "admin";
      actingAsDealer: boolean;
      effectiveDealerId: number | null;
      ownDealerId: number | null;
    }
  | {
      role: "dealer";
      actingAsDealer: false;
      effectiveDealerId: number | null;
      ownDealerId: number | null;
    };

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  return null;
}

function pickDealerId(user: UserLike): number | null {
  return (
    toPositiveNumber(user.user_metadata?.dealer_id) ??
    toPositiveNumber(user.user_metadata?.dealerId) ??
    toPositiveNumber(user.user_metadata?.haendler_id) ??
    toPositiveNumber(user.user_metadata?.haendlerId) ??
    toPositiveNumber(user.app_metadata?.dealer_id) ??
    toPositiveNumber(user.app_metadata?.dealerId) ??
    null
  );
}

export function getEffectiveDealerContext(
  user: UserLike,
  actingDealerId?: number | null
): EffectiveDealerContext {
  const appRole =
    typeof user.app_metadata?.role === "string"
      ? user.app_metadata.role
      : null;

  const userRole =
    typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null;

  const role = appRole || userRole || "dealer";
  const ownDealerId = pickDealerId(user);

  if (role === "admin") {
    return {
      role: "admin",
      actingAsDealer: !!actingDealerId,
      effectiveDealerId: actingDealerId ?? null,
      ownDealerId,
    };
  }

  return {
    role: "dealer",
    actingAsDealer: false,
    effectiveDealerId: ownDealerId,
    ownDealerId,
  };
}