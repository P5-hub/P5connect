import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { DealerProvider } from "./DealerContext";

export default async function DealerServerWrapper({
  dealer: fallbackDealer,
  children,
}: {
  dealer?: any;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let activeDealer: any = null;
  let isAdmin = false;
  let impersonating = false;

  async function attachPricingGroup(dealer: any) {
    if (!dealer?.dealer_id) return dealer;

    const { data: memberships } = await supabase
      .from("dealer_pricing_group_memberships")
      .select(`
        pricing_group_id,
        active,
        dealer_pricing_groups (
          pricing_group_id,
          code,
          name,
          sofortrabatt_enabled
        )
      `)
      .eq("dealer_id", dealer.dealer_id)
      .eq("active", true);

    const activeMemberships = memberships ?? [];

    const enabledMembership = activeMemberships.find((membership: any) => {
      const pricingGroup = Array.isArray(membership.dealer_pricing_groups)
        ? membership.dealer_pricing_groups[0]
        : membership.dealer_pricing_groups;

      return pricingGroup?.sofortrabatt_enabled === true;
    });

    const selectedMembership = enabledMembership ?? activeMemberships[0] ?? null;

    const pricingGroup = Array.isArray(selectedMembership?.dealer_pricing_groups)
      ? selectedMembership?.dealer_pricing_groups[0]
      : selectedMembership?.dealer_pricing_groups;

    return {
      ...dealer,
      pricing_group_id: selectedMembership?.pricing_group_id ?? null,
      dealer_pricing_groups: pricingGroup ?? null,
    };
  }

  if (user) {
    const roleFromProfile = user.app_metadata?.role ?? null;
    const isAdminLike =
      roleFromProfile === "admin" || roleFromProfile === "superadmin";

    isAdmin = isAdminLike;

    const actingDealerId = cookieStore.get("acting_dealer_id")?.value ?? null;

    if (isAdminLike && actingDealerId) {
      const { data } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", Number(actingDealerId))
        .maybeSingle();

      activeDealer = data ? await attachPricingGroup(data) : null;
      impersonating = !!data;
    } else {
      const { data } = await supabase
        .from("dealers")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const dealer = data ?? fallbackDealer ?? null;
      activeDealer = dealer ? await attachPricingGroup(dealer) : null;
    }
  }

  return (
    <DealerProvider
      dealer={activeDealer}
      isAdmin={isAdmin}
      impersonating={impersonating}
    >
      {children}
    </DealerProvider>
  );
}