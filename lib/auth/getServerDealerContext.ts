"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function getServerDealerContext() {
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

  if (!user) {
    throw new Error("Nicht eingeloggt");
  }

  const roleFromProfile =
    user.app_metadata?.role ?? user.user_metadata?.role ?? null;

  const isAdmin = roleFromProfile === "admin";
  const actingDealerIdRaw = cookieStore.get("acting_dealer_id")?.value ?? null;

  if (isAdmin && actingDealerIdRaw) {
    const actingDealerId = Number(actingDealerIdRaw);

    if (Number.isFinite(actingDealerId) && actingDealerId > 0) {
      const { data: actingDealer } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", actingDealerId)
        .maybeSingle();

      if (!actingDealer) {
        throw new Error("Impersonierter Händler nicht gefunden");
      }

      return {
        supabase,
        user,
        isAdmin,
        impersonating: true,
        effectiveDealerId: actingDealer.dealer_id as number,
        dealer: actingDealer,
      };
    }
  }

  const { data: ownDealer } = await supabase
    .from("dealers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!ownDealer?.dealer_id) {
    throw new Error("Kein Händlerkontext gefunden");
  }

  return {
    supabase,
    user,
    isAdmin,
    impersonating: false,
    effectiveDealerId: ownDealer.dealer_id as number,
    dealer: ownDealer,
  };
}