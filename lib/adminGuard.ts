import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr"; // falls du utils/supabase/server nutzt, entsprechend anpassen

export async function assertAdminOrThrow() {
  const cookieStore = await cookies();  // ✅ Promise auflösen
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rolle aus user_metadata oder app_metadata prüfen
  const role = (user?.user_metadata?.role || user?.app_metadata?.role || "").toLowerCase();
  if (role !== "admin") {
    throw new Error("forbidden");
  }
}
