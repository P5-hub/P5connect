"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function seedCartFromProject(projectId: string) {
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

  const { data: submission } = await supabase
    .from("submissions")
    .select("submission_id")
    .eq("project_id", projectId)
    .eq("typ", "projekt")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!submission) {
    throw new Error("Keine Projekt-Submission gefunden");
  }

  const { data: items } = await supabase
    .from("submission_items")
    .select(`
      product_id,
      ean,
      product_name,
      sony_article,
      menge,
      preis,
      project_id
    `)
    .eq("submission_id", submission.submission_id);

  if (!items || items.length === 0) {
    throw new Error("Projekt enthält keine Produkte");
  }

  return items.map((i) => ({
    product_id: i.product_id,
    ean: i.ean,
    product_name: i.product_name,
    sony_article: i.sony_article,
    quantity: i.menge ?? 1,
    price: i.preis ?? 0,
    project_id: i.project_id,
    __origin: "project",
  }));
}
