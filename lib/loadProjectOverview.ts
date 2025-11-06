import { getSupabaseBrowser } from "@/lib/supabaseClient";

/**
 * Lädt eine strukturierte Übersicht aller Projektanfragen aus der View `view_project_overview`.
 * Optional kann per `dealerId` gefiltert werden.
 */
export async function loadProjectOverview(dealerId?: number) {
  const supabase = getSupabaseBrowser();

  let query = supabase
    .from("view_project_overview")
    .select("*")
    .order("project_created", { ascending: false });

  if (dealerId) {
    query = query.eq("dealer_id", dealerId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Fehler beim Laden der Projektübersicht:", error.message);
    throw new Error(error.message);
  }

  // 🧠 Projekte logisch gruppieren (nach project_id)
  const projects: Record<string, any> = {};

  for (const row of data || []) {
    const id = row.project_id ?? null;

    // 🚫 Skip falls keine gültige project_id vorhanden ist
    if (!id) continue;

    if (!projects[id]) {
      projects[id] = {
        project_id: id,
        project_name: row.project_name,
        project_type: row.project_type,
        customer: row.customer,
        location: row.location,
        start_date: row.start_date,
        end_date: row.end_date,
        comment: row.comment,
        project_date: row.project_date,
        created_at: row.project_created,

        dealer: {
          dealer_id: row.dealer_id,
          company_name: row.dealer_name ?? "-", // ✅ richtiges Feld aus der View
          store_name: row.store_name ?? "-",     // optional, falls vorhanden
          city: (row as any).city ?? "-",        // nur wenn city evtl. im Select fehlt
          email: row.dealer_email ?? null,
          phone: (row as any).dealer_phone ?? null,
        },

        submission: {
          submission_id: row.submission_id,
          submission_type: row.submission_type,
          distributor: row.distributor,
          created_at: row.submission_created,
        },

        items: [],
      };
    }

    // Produkt anhängen, falls Produktinformationen in der View enthalten sind
    if ((row as any).product_name || (row as any).ean) {
      projects[id].items.push({
        product_id: (row as any).product_id ?? null, // View hat evtl. keine echte ID
        product_name: (row as any).product_name ?? null,
        ean: (row as any).ean ?? null,
        quantity: (row as any).quantity ?? null,
        price: (row as any).price ?? null,
      });
    }
  } // ✅ fehlende Klammer war hier

  return Object.values(projects);
}
