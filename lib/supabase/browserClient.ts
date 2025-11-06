// lib/supabase/browserClient.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserSupabase() {
  return createBrowserClient<Database>(url, anon);
}
