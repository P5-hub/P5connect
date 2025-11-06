"use client";

import { toast } from "sonner";
import { SupabaseClient } from "@supabase/supabase-js";
import { useRef } from "react";

/**
 * 🔁 useOptimisticSave Hook (Sonner-Version)
 * - Optimistic UI
 * - Debounce
 * - Overflow-Prüfung
 * - farbige Sonner-Notifications
 */
export function useOptimisticSave(supabase: SupabaseClient, fetchRows: () => Promise<void>) {
  const debounceTimers = useRef<Record<string, any>>({});

  function sanitizeNumeric(value: any, max: number = 99999999): number | null {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    if (Math.abs(n) > max) return null;
    return parseFloat(n.toFixed(2));
  }

  async function optimisticUpdate(
    itemId: number,
    currentItem: Record<string, any>,
    fieldValues: Record<string, any>,
    debounceMs: number = 600
  ) {
    if (!itemId) return;

    // 🔄 Sofort UI aktualisieren
    Object.entries(fieldValues).forEach(([key, val]) => {
      if (key in currentItem) currentItem[key] = val;
    });

    clearTimeout(debounceTimers.current[itemId]);
    debounceTimers.current[itemId] = setTimeout(async () => {
      try {
        const cleanValues = Object.fromEntries(
          Object.entries(fieldValues).map(([key, val]) => {
            if (typeof val === "number") return [key, sanitizeNumeric(val)];
            return [key, val];
          })
        );

        const { error } = await supabase
          .from("submission_items")
          .update(cleanValues)
          .eq("item_id", itemId);

        if (error) throw error;

        toast.success("Gespeichert", {
          description: "Die Änderungen wurden erfolgreich übernommen.",
          duration: 2000,
        });

        setTimeout(fetchRows, 600);
      } catch (err: any) {
        console.error("❌ Supabase update failed:", err.message || err);
        toast.error("Fehler beim Speichern", {
          description: err.message || "Bitte Eingaben prüfen.",
          duration: 3000,
        });
      }
    }, debounceMs);
  }

  return { optimisticUpdate };
}
