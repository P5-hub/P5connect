import { NextRequest, NextResponse } from "next/server";
import { getApiDealerContext } from "@/lib/auth/getApiDealerContext";

type PricingGroupJoin =
  | {
      sofortrabatt_enabled?: boolean | null;
    }
  | {
      sofortrabatt_enabled?: boolean | null;
    }[]
  | null;

function getSofortrabattEnabled(value: PricingGroupJoin): boolean {
  if (Array.isArray(value)) {
    return value[0]?.sofortrabatt_enabled === true;
  }

  return value?.sofortrabatt_enabled === true;
}

export async function canUseSofortrabatt(req: NextRequest) {
  const auth = await getApiDealerContext(req);

  if (!auth.ok) {
    return auth;
  }

  const dealerId = auth.ctx.effectiveDealerId;

  if (!dealerId) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "No effective dealer context found" },
        { status: 403 }
      ),
    };
  }

  const { data: memberships, error } = await auth.supabase
    .from("dealer_pricing_group_memberships")
    .select(`
      pricing_group_id,
      active,
      dealer_pricing_groups (
        sofortrabatt_enabled
      )
    `)
    .eq("dealer_id", dealerId)
    .eq("active", true);

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Preisgruppen konnten nicht geprüft werden." },
        { status: 403 }
      ),
    };
  }

  const canUse = (memberships ?? []).some((membership: any) => {
    const pricingGroup = membership.dealer_pricing_groups as PricingGroupJoin;
    return getSofortrabattEnabled(pricingGroup);
  });

  if (!canUse) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            "Sofortrabatt ist für diese Händler-Preisgruppe nicht freigeschaltet.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    user: auth.user,
    ctx: auth.ctx,
    supabase: auth.supabase,
    response: auth.response,
    dealerId,
  };
}