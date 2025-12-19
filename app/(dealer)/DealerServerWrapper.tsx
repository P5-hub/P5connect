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
  // ✅ TS + Runtime kompatibel (Next 14 / 15 / 16)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // --------------------------------------------------
  // 🔐 Aktuellen User laden
  // --------------------------------------------------
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  // --------------------------------------------------
  // 👤 Rolle bestimmen (Admin / Händler)
  // --------------------------------------------------
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // --------------------------------------------------
  // 🏷 Aktiver Händler (nur Admin darf wechseln)
  // --------------------------------------------------
  const activeDealerId =
    cookieStore.get("active_dealer_id")?.value ?? null;

  let activeDealer: any = null;
  let impersonating = false;

  if (isAdmin && activeDealerId) {
    // 🧑‍💼 Admin impersoniert Händler
    const { data } = await supabase
      .from("dealers")
      .select("*")
      .eq("dealer_id", activeDealerId)
      .single();

    activeDealer = data;
    impersonating = true;
  } else {
    // 👤 Händler → IMMER eigener Datensatz
    const { data } = await supabase
      .from("dealers")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    activeDealer = data ?? fallbackDealer;
  }

  // --------------------------------------------------
  // 🧠 Context bereitstellen
  // --------------------------------------------------
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
