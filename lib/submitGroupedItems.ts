// lib/submitGroupedItems.ts
import { getSupabaseBrowser } from "@/lib/supabaseClient";

export async function submitGroupedItems({
  items,
  dealer,
  typ = "verkauf",
  meta = {},
}: {
  items: any[];
  dealer: any;
  typ: string;
  meta?: Record<string, any>;
}) {
  const supabase = getSupabaseBrowser();
  

  if (!dealer?.dealer_id) throw new Error("Kein Händler übergeben");

  // 🔹 Sichere Typkonvertierung für Zahlen
  const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.,-]/g, "").replace(",", ".");
      const num = parseFloat(cleaned);
      return Number.isFinite(num) ? Math.round(num) : 0;
    }
    return 0;
  };

  // 🔹 Sichere Konvertierung für product_id (kein "cost_..." mehr)
  const toProductIdOrNull = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number" && Number.isInteger(val)) return val;
    if (typeof val === "string" && /^[0-9]+$/.test(val)) return parseInt(val, 10);
    return null; // z. B. "cost_17597856..." -> null
  };

  // 🔹 Gruppierung nach Distributor
  const grouped = items.reduce<Record<string, any[]>>((acc, it) => {
    const dist = it.distributor || "ep";
    (acc[dist] ||= []).push(it);
    return acc;
  }, {});

  const results: any[] = [];

  // 🔹 Falls es ein Projekt ist – zuerst Projekt-Datensatz anlegen
  let projectId: string | null = null;
  if (typ === "projekt") {
    const { data: project, error: projectError } = await supabase
      .from("project_requests")
      .insert([
        {
          dealer_id: dealer.dealer_id,
          login_nr: dealer.login_nr ?? null,
          store_name: dealer.store_name ?? null,
          project_type: meta.type || null,
          project_name: meta.name || null,
          customer: meta.customer || null,
          location: meta.location || null,
          start_date: meta.start || null,
          end_date: meta.end || null,
          comment: meta.comment || null,
          project_date: meta.project_date || new Date().toISOString(),
        },
      ])
      .select("id")
      .single();

    if (projectError) {
      console.error("❌ Fehler beim Erstellen der Projektanfrage:", projectError.message);
      throw new Error(`Fehler bei Projektanfrage: ${projectError.message}`);
    }

    projectId = project?.id || null;
  }

  // 🔹 Für jede Distributor-Gruppe eine Submission + Items erzeugen
  for (const [dist, groupItems] of Object.entries(grouped)) {
    // 🧩 1️⃣ Submission erzeugen
    const { data: submission, error: e1 } = await supabase
      .from("submissions")
      .insert([
        {
          dealer_id: dealer.dealer_id,
          typ: typ as "bestellung" | "verkauf" | "projekt" | "support" | "cashback",
          distributor: dist,
          created_at: new Date().toISOString(),
          project_id: projectId,
        },
      ])
      .select("submission_id")
      .single();

    if (e1) {
      console.error("❌ Fehler bei submissions:", e1.message);
      throw new Error(`Fehler bei Submission (${dist}): ${e1.message}`);
    }

    if (!submission?.submission_id) {
      throw new Error(`Keine submission_id zurückgegeben für ${dist}`);
    }

    // 🧩 2️⃣ Items einfügen (jetzt mit sicherem product_id-Handling)
    const insertRows = groupItems.map((it) => ({
      submission_id: submission.submission_id,
      product_id: toProductIdOrNull(it.product_id), // <-- hier der entscheidende Fix
      menge: toNumber(it.quantity),
      preis: toNumber(it.price ?? it.supportbetrag ?? 0),
      datum: it.date ?? new Date().toISOString().split("T")[0],
      ean: it.ean ?? null,
      product_name: it.product_name ?? null,
      project_id: projectId,
    }));

    // Debug
    console.log("🧾 INSERT ITEMS:", JSON.stringify(insertRows, null, 2));

    const { error: e2 } = await supabase.from("submission_items").insert(insertRows);
    if (e2) {
      console.error("❌ Fehler bei submission_items:", e2.message);
      throw new Error(`Fehler bei Items (${dist}): ${e2.message}`);
    }

    results.push({
      distributor: dist,
      submission_id: submission.submission_id,
      project_id: projectId,
    });
  }

  console.log("✅ submitGroupedItems erfolgreich:", results);
  return results;
}
