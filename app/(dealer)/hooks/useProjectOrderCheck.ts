// hooks/useProjectOrderCheck.ts
"use client";

import { createClient } from "@/utils/supabase/client";

export async function checkProjectAlreadyOrdered(projectId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("submissions")
    .select("submission_id, created_at")
    .eq("typ", "bestellung")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Projekt-Bestellprüfung fehlgeschlagen", error);
    return [];
  }

  return data ?? [];
}
