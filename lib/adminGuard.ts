import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function assertAdminOrThrow() {
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
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("forbidden");
  }

  const role = String(user.app_metadata?.role || "").toLowerCase();
  const isAdminLike = role === "admin" || role === "superadmin";

  if (!isAdminLike) {
    throw new Error("forbidden");
  }
}