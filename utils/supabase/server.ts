// lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * ✅ Supabase Server Client mit Service Role Key
 * Funktioniert garantiert in Next.js 14/15 – keine TypeScript-Fehler.
 */
export async function getSupabaseServer() {
  // 👇 await hinzufügen, damit TS weiß, dass cookies() Promise ist
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // kein Schreibrecht im Server-Kontext
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // kein Schreibrecht im Server-Kontext
          }
        },
      },
    }
  );
}
