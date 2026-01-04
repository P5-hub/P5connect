"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function checkProjectAlreadyOrdered(projectId: string) {
  if (!projectId) return false;

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

  const { data, error } = await supabase
    .from("submissions")
    .select("submission_id")
    .eq("typ", "bestellung")
    .eq("project_id", projectId)
    .limit(1);

  if (error) {
    console.error("checkProjectAlreadyOrdered error:", error);
    return false;
  }

  return (data?.length ?? 0) > 0;
}
