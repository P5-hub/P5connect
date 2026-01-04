"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, Briefcase } from "lucide-react";

/* ================= TYPES ================= */
type ProjectHeader = {
  submission_id: number | null;
  dealer_id: number | null;
  created_at: string;
  status: string | null;
  project_id: string;
  project_name: string | null;
};


type ProjectItem = {
  item_id: number;
  product_name: string | null;
  ean: string | null;
  menge: number | null;
  preis: number | null;
};

/* ================= COMPONENT ================= */
export default function ProjektDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading, isImpersonated } = useActiveDealer();

  const [header, setHeader] = useState<ProjectHeader | null>(null);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

      /* ===== HEADER (Projekt-Submission) ===== */
      const { data: headerData, error: headerError } = await supabase
        .from("submissions")
        .select(`
          submission_id,
          dealer_id,
          created_at,
          status,
          project_id,
          project_requests (
            project_name
          )
        `)
        .eq("submission_id", Number(id))
        .eq("dealer_id", dealer.dealer_id)
        .eq("typ", "projekt")
        .single();

      if (headerError || !headerData || !headerData.project_id) {
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader({
        submission_id: headerData.submission_id,
        dealer_id: headerData.dealer_id,
        created_at: headerData.created_at,
        status: headerData.status,
        project_id: headerData.project_id,
        project_name: headerData.project_requests?.project_name ?? null,
      });

      /* ===== ITEMS ===== */
      const { data: itemsData } = await supabase
        .from("submission_items")
        .select(`
          item_id,
          product_name,
          ean,
          menge,
          preis
        `)
        .eq("submission_id", Number(id))
        .order("product_name");

      setItems((itemsData ?? []) as ProjectItem[]);
      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Projekt wird geladen…</p>;
  }

  if (!header) {
    return (
      <p className="text-red-600">
        Projekt nicht gefunden oder kein Zugriff.
      </p>
    );
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.menge || 0) * Number(i.preis || 0),
    0
  );

  const backUrl = isImpersonated
    ? `/verlauf?dealer_id=${dealer?.dealer_id}`
    : "/verlauf";

  /* ================= RENDER ================= */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <Briefcase className="w-6 h-6 text-purple-700" />

        <div>
          <h1 className="text-lg font-semibold">
            Projekt P-{header.submission_id}
          </h1>
          {header.project_name && (
            <p className="text-sm text-purple-700 font-medium">
              {header.project_name}
            </p>
          )}
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

      {/* Tabelle */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Produkt</th>
              <th className="px-3 py-2 text-left">EAN</th>
              <th className="px-3 py-2 text-right">Menge</th>
              <th className="px-3 py-2 text-right">Preis</th>
              <th className="px-3 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.item_id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  {i.product_name ?? "—"}
                </td>
                <td className="px-3 py-2 font-mono">
                  {i.ean ?? "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  {i.menge ?? 0}
                </td>
                <td className="px-3 py-2 text-right">
                  {(i.preis ?? 0).toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {(Number(i.menge || 0) * Number(i.preis || 0)).toLocaleString(
                    "de-CH",
                    {
                      style: "currency",
                      currency: "CHF",
                    }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
