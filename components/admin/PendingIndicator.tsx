"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import PendingItem from "./PendingItem";
import { loadAllPending, UnifiedPendingEntry, UnifiedPendingCounts } from "@/utils/loadPending";

export default function PendingIndicator() {
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pendingList, setPendingList] = useState<UnifiedPendingEntry[]>([]);
  const [pendingCounts, setPendingCounts] = useState<UnifiedPendingCounts>({
    promotions: 0,
    sofortrabatt: 0,
    projekts: 0,
    bestellungen: 0,
    support: 0,
    aktionen: 0,
    cashback: 0,
  });

  const [filter, setFilter] = useState("all");

  /* Close menu on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Load counters + list */
  async function reload() {
    const { counts, list } = await loadAllPending();
    setPendingCounts(counts);
    setPendingList(list);
  }

  /* Initial load + realtime */
  useEffect(() => {
    reload();

    const chSubs = supabase
      .channel("changes_submissions")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, reload)
      .subscribe();

    const chPromo = supabase
      .channel("changes_promotion_claims")
      .on("postgres_changes", { event: "*", schema: "public", table: "promotion_claims" }, reload)
      .subscribe();

    const chSofort = supabase
      .channel("changes_sofort")
      .on("postgres_changes", { event: "*", schema: "public", table: "sofortrabatt_claims" }, reload)
      .subscribe();

    const chCashback = supabase
      .channel("changes_cashback")
      .on("postgres_changes", { event: "*", schema: "public", table: "cashback_claims" }, reload)
      .subscribe();

    const chMonatsaktion = supabase
      .channel("changes_monatsaktion")
      .on("postgres_changes", { event: "*", schema: "public", table: "monatsaktionen" }, reload)
      .subscribe();

    return () => {
      supabase.removeChannel(chSubs);
      supabase.removeChannel(chPromo);
      supabase.removeChannel(chSofort);
      supabase.removeChannel(chCashback);
      supabase.removeChannel(chMonatsaktion);
    };
  }, []);

  const filtered =
    filter === "all"
      ? pendingList
      : pendingList.filter((e) => e.typ === filter);

  const total = pendingList.length;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell icon */}
      <button onClick={() => setOpen((o) => !o)} className="relative">
        <Bell className="w-6 h-6 text-gray-700 hover:text-black" />

        {total > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl border rounded-md z-50">
          <div className="px-4 py-2 border-b flex justify-between">
            <span className="font-semibold">Offene Einträge</span>
            <span>{total}</span>
          </div>

          <div className="flex gap-2 p-3 border-b text-xs overflow-x-auto">
            {[
              { key: "all", label: "Alle" },
              { key: "bestellung", label: "Bestellungen" },
              { key: "projekt", label: "Projekte" },
              { key: "support", label: "Support" },
              { key: "promotion", label: "Promotion" },
              { key: "sofortrabatt", label: "Sofortrabatt" },
              { key: "cashback", label: "Cashback" },
              { key: "monatsaktion", label: "Monatsaktionen" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2 py-1 rounded border ${
                  filter === f.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-gray-500 text-sm">
                Keine Einträge
              </div>
            ) : (
              filtered.map((entry) => (
                <PendingItem key={`${entry.typ}-${entry.id}`} entry={entry} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
