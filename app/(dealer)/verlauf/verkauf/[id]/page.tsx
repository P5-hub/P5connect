"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";

/* ================= TYPES ================= */

type VerkaufHeader = {
  submission_id: number;
  dealer_id: number | null;
  created_at: string;
  status: string | null;
  kommentar: string | null;
};

type VerkaufItem = {
  item_id: number;
  product_name: string | null;
  ean: string | null;
  menge: number | null;
  preis: number | null;
};

/* ================= COMPONENT ================= */

export default function VerkaufDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading } = useActiveDealer();

  const [header, setHeader] = useState<VerkaufHeader | null>(null);
  const [items, setItems] = useState<VerkaufItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

      /* ===== HEADER ===== */
      const { data: headerData, error: headerErr } = await supabase
        .from("submissions")
        .select("submission_id, dealer_id, created_at, status, kommentar")
        .eq("submission_id", Number(id))
        .eq("typ", "verkauf")
        .eq("dealer_id", dealer.dealer_id)
        .single();

      if (headerErr || !headerData) {
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader(headerData as VerkaufHeader);

      /* ===== ITEMS ===== */
      const { data: itemsData } = await supabase
        .from("submission_items")
        .select("item_id, product_name, ean, menge, preis")
        .eq("submission_id", Number(id))
        .order("item_id");

      setItems((itemsData ?? []) as VerkaufItem[]);

      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Verkaufsdetails werden geladen…</p>;
  }

  if (!header) {
    return (
      <p className="text-red-600">
        Verkauf nicht gefunden oder kein Zugriff.
      </p>
    );
  }

  const totalAmount = items.reduce(
    (s, i) => s + Number(i.preis ?? 0) * Number(i.menge ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            router.push(`/verlauf?dealer_id=${dealer?.dealer_id}`)
          }
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <FileSpreadsheet className="w-6 h-6 text-green-700" />

        <div>
          <h1 className="text-lg font-semibold">
            Verkauf V-{header.submission_id}
          </h1>
          <p className="text-sm text-gray-500">
            {items.length} Position
            {items.length !== 1 ? "en" : ""} ·{" "}
            {totalAmount.toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}{" "}
            · {new Date(header.created_at).toLocaleString("de-CH")}
          </p>
        </div>
      </div>

      {/* ===== KOMMENTAR ===== */}
      {header.kommentar && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {header.kommentar}
        </div>
      )}

      {/* ===== ITEMS ===== */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Produkt</th>
              <th className="px-3 py-2 text-left">EAN</th>
              <th className="px-3 py-2 text-right">Menge</th>
              <th className="px-3 py-2 text-right">Preis</th>
              <th className="px-3 py-2 text-right">Umsatz</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const umsatz =
                Number(i.preis ?? 0) * Number(i.menge ?? 0);

              return (
                <tr key={i.item_id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{i.product_name ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">{i.ean ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{i.menge ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(i.preis ?? 0).toLocaleString("de-CH", {
                      style: "currency",
                      currency: "CHF",
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {umsatz.toLocaleString("de-CH", {
                      style: "currency",
                      currency: "CHF",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
