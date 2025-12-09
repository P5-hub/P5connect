import { Suspense } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import DealerServerWrapper from "@/app/(dealer)/DealerServerWrapper";
import BestellungClient from "./components/BestellungClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BestellungPage() {
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
    return <p className="p-4 text-red-600">Nicht eingeloggt.</p>;
  }

  const { data: dealer } = await supabase
    .from("dealers")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!dealer) {
    return (
      <p className="p-4 text-red-600">
        Händlerdaten nicht gefunden – bitte Support kontaktieren.
      </p>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">Lade Bestellung…</div>}>
      <DealerServerWrapper dealer={dealer}>
        <BestellungClient />
      </DealerServerWrapper>
    </Suspense>
  );
}
