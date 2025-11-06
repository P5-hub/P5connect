// lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies as nextCookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * 🧩 Supabase Server Client (Service Role Key)
 * Stabil für Next.js 14 und 15 — ohne TS-Fehler.
 */
export function getSupabaseServer() {
  // 💡 Workaround: "cookies()" wird manchmal als Promise getypt → casten
  const cookieStore = nextCookies() as unknown as {
    get: (name: string) => { value: string } | undefined;
    set?: (opts: any) => void;
  };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set?.({ name, value, ...options });
          } catch {
            /* keine Schreibrechte im Server-Kontext */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set?.({ name, value: "", ...options });
          } catch {
            /* keine Schreibrechte im Server-Kontext */
          }
        },
      },
    }
  );
}
