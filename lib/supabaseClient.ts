"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 👇 Nur einmal erstellen (Singleton)
let browserClient:
  | ReturnType<typeof createBrowserClient<Database>>
  | null = null;

/**
 * 🌐 Supabase Browser Client (typisiert & Singleton)
 */
export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}

/**
 * 🧩 Einheitlicher Default-Export
 */
export const supabase = getSupabaseBrowser();
export default supabase;
