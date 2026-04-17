"use server";

import { getServerDealerContext } from "@/lib/auth/getServerDealerContext";

export async function seedCartFromProjectAction(projectId: string) {
  if (!projectId) {
    throw new Error("projectId fehlt");
  }

  const { supabase, effectiveDealerId } = await getServerDealerContext();

  /* =====================================================
     1️⃣ Projekt-Stammdaten (nur eigenes / impersoniertes Projekt)
  ===================================================== */
  const { data: project } = await supabase
    .from("project_requests")
    .select(`
      id,
      dealer_id,
      project_name,
      customer,
      location,
      start_date,
      end_date,
      comment,
      project_file_url
    `)
    .eq("id", projectId)
    .eq("dealer_id", effectiveDealerId)
    .single();

  if (!project) {
    throw new Error("Projekt nicht gefunden oder keine Berechtigung");
  }

  /* =====================================================
     2️⃣ letzte Projekt-Submission (nur für aktiven Händler)
  ===================================================== */
  const { data: projectSubmission } = await supabase
    .from("submissions")
    .select(`
      submission_id,
      project_id,
      dealer_id,
      customer_name
    `)
    .eq("project_id", projectId)
    .eq("dealer_id", effectiveDealerId)
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
     4️⃣ Rückgabe
  ===================================================== */
  return {
    project: {
      project_id: project.id,
      submission_id: projectSubmission.submission_id,
      project_name:
        project.project_name ?? `Projekt #${projectSubmission.submission_id}`,
      customer: project.customer ?? projectSubmission.customer_name ?? null,
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