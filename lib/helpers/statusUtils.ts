import { getSupabaseServer } from "@/utils/supabase/server";

/**
 * Aktualisiert den Status einer Bestellung (Server-Kontext)
 */
export async function updateOrderStatus(
  submissionId: number,
  newStatus: string
) {
  try {
    const supabase = await getSupabaseServer(); // ✅ async, da getSupabaseServer async ist

    const { error } = await supabase
      .from("submissions")
      .update({ status: newStatus })
      .eq("submission_id", submissionId)
      .eq("typ", "bestellung");

    if (error) {
      console.error("❌ Fehler beim Aktualisieren:", error);
      throw new Error(error.message);
    }

    console.log(`✅ Bestellung ${submissionId} → Status auf '${newStatus}' gesetzt.`);
    return { success: true };
  } catch (err: any) {
    console.error("❌ Fehler in updateOrderStatus:", err);
    return { success: false, error: err.message };
  }
}
