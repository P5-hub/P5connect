"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function seedCartFromProjectAction(projectId: string) {
  if (!projectId) {
    throw new Error("projectId fehlt");
  }

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

  /* =====================================================
     1️⃣ Projekt-Stammdaten (project_requests)
  ===================================================== */
  const { data: project } = await supabase
    .from("project_requests")
    .select(`
      id,
      project_name,
      customer,
      location,
      start_date,
      end_date,
      comment,
      project_file_url
    `)
    .eq("id", projectId)
    .single();

  if (!project) {
    throw new Error("Projekt nicht gefunden (project_requests)");
  }

  /* =====================================================
     2️⃣ letzte Projekt-Submission (Workflow!)
  ===================================================== */
  const { data: projectSubmission } = await supabase
    .from("submissions")
    .select(`
      submission_id,
      project_id,
      customer_name
    `)
    .eq("project_id", projectId)
    .eq("typ", "projekt")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!projectSubmission) {
    throw new Error("Keine Projekt-Submission gefunden");
  }

  /* =====================================================
     3️⃣ Projekt-Produkte
  ===================================================== */
  const { data: items } = await supabase
    .from("submission_items")
    .select(`
      product_id,
      product_name,
      ean,
      menge,
      preis,
      project_id
    `)
    .eq("submission_id", projectSubmission.submission_id);

  if (!items || items.length === 0) {
    throw new Error("Projekt enthält keine Produkte");
  }

  /* =====================================================
     4️⃣ Rückgabe (BEIDE IDs!)
  ===================================================== */
  /* =====================================================
    4️⃣ Rückgabe (DTO – sauber gemappt)
  ===================================================== */
  return {
    project: {
      project_id: project.id, // UUID (intern, nicht anzeigen!)
      submission_id: projectSubmission.submission_id, // 🔥 Projekt-ID = P-xxx
      project_name:
        project.project_name ??
        `Projekt #${projectSubmission.submission_id}`,
      customer:
        project.customer ??
        projectSubmission.customer_name ??
        null,
      location: project.location,
      start_date: project.start_date,
      end_date: project.end_date,
      comment: project.comment,
      project_file_url: project.project_file_url,
    },

    items: items.map((i) => ({
      product_id: i.product_id,
      product_name: i.product_name,
      ean: i.ean,
      quantity: i.menge ?? 1,
      price: i.preis ?? 0,
      project_id: i.project_id,
      __origin: "project",
    })),
  };

}
