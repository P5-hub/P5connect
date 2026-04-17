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

      activeDealer = data ?? null;
      impersonating = !!data;
    } else {
      const { data } = await supabase
        .from("dealers")
        .select("*")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      activeDealer = data ?? fallbackDealer ?? null;
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