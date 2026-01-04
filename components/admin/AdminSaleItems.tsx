"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

type ItemRow = {
  product_name: string | null;
  quantity: number | null;
  revenue: number | null;
  source: string | null;
};

export default function AdminSaleItems({
  displayId,
}: {
  displayId: string;
}) {
  const supabase = getSupabaseBrowser();
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      let query = supabase
        .from("v_sales_unified")
        .select("product_name, quantity, revenue, source")
        .eq("display_id", displayId);

      const { data, error } = await query;
      if (cancelled) return;

      if (error) {
        console.error("AdminSaleItems:", error);
        setItems([]);
      } else {
        setItems(data ?? []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [displayId, supabase]);

  if (loading) {
    return <div className="text-xs text-gray-400 ml-12">Lade Positionen…</div>;
  }

  if (!items.length) {
    return (
      <div className="text-xs text-gray-400 ml-12">
        Keine Positionen gefunden
      </div>
    );
  }

  return (
    <div className="ml-12 mt-2 space-y-1 text-xs">
      {items.map((i, idx) => (
        <div
          key={idx}
          className="flex justify-between border-b border-dashed pb-1"
        >
          <div>
            <div className="font-medium">{i.product_name}</div>
            <div className="text-gray-400">
              Quelle: {i.source}
            </div>
          </div>
          <div className="text-right">
            <div>
              {i.quantity} ×{" "}
              {(Number(i.revenue ?? 0) / Number(i.quantity ?? 1)).toLocaleString(
                "de-CH",
                { style: "currency", currency: "CHF" }
              )}
            </div>
            <div className="font-medium">
              {Number(i.revenue ?? 0).toLocaleString("de-CH", {
                style: "currency",
                currency: "CHF",
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
