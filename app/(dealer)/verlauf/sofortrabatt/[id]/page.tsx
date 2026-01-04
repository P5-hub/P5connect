"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, Percent, Download } from "lucide-react";

/* ================= TYPES ================= */

type SofortrabattProduct = {
  product_name: string;
  ean: string;
  category?: string | null;
  qty?: number | null;
};

type SofortrabattHeader = {
  claim_id: number;
  dealer_id: number | null;

  rabatt_level: number | null;
  rabatt_betrag: number | null;

  status: "pending" | "approved" | "rejected" | null;
  comment: string | null;

  products: SofortrabattProduct[] | null;
  product_list: string | null;

  invoice_file_url: string | null;
  submission_date: string | null;
  created_at: string | null;
};

/* ================= COMPONENT ================= */

export default function SofortrabattDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading } = useActiveDealer();

  const [data, setData] = useState<SofortrabattHeader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("sofortrabatt_claims_view")
        .select("*")
        .eq("claim_id", Number(id))
        .eq("dealer_id", dealer.dealer_id)
        .single();

      if (error || !data) {
        console.warn("Sofortrabatt nicht gefunden:", error);
        setData(null);
        setLoading(false);
        return;
      }

      setData(data as SofortrabattHeader);
      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Sofortrabatt wird geladen…</p>;
  }

  if (!data) {
    return (
      <p className="text-red-600">
        Sofortrabatt nicht gefunden oder kein Zugriff.
      </p>
    );
  }

  const invoiceUrl =
    data.invoice_file_url
      ? supabase.storage
          .from("sofortrabatt-invoices")
          .getPublicUrl(data.invoice_file_url).data.publicUrl
      : null;

  const displayDate = data.submission_date || data.created_at;

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

        <Percent className="w-6 h-6 text-orange-600" />

        <div>
          <h1 className="text-lg font-semibold">
            Sofortrabatt R-{data.claim_id}
          </h1>
          <p className="text-sm text-gray-500">
            Rabatt-Level {data.rabatt_level ?? "—"} ·{" "}
            {(data.rabatt_betrag ?? 0).toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}{" "}
            ·{" "}
            {displayDate
              ? new Date(displayDate).toLocaleString("de-CH")
              : "—"}
          </p>
        </div>
      </div>

      {/* ===== STATUS ===== */}
      <div className="text-sm">
        Status:{" "}
        <span className="font-medium capitalize">
          {data.status ?? "—"}
        </span>
      </div>

      {/* ===== KOMMENTAR ===== */}
      {data.comment && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {data.comment}
        </div>
      )}

      {/* ===== PRODUKTE ===== */}
      {data.products && data.products.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Produkt</th>
                <th className="px-3 py-2 text-left">EAN</th>
                <th className="px-3 py-2 text-left">Kategorie</th>
                <th className="px-3 py-2 text-right">Menge</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{p.product_name}</td>
                  <td className="px-3 py-2 font-mono">{p.ean}</td>
                  <td className="px-3 py-2">{p.category ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{p.qty ?? 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        data.product_list && (
          <div className="text-sm text-gray-700">
            {data.product_list}
          </div>
        )
      )}

      {/* ===== RECHNUNG ===== */}
      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <Download className="w-4 h-4" />
          Rechnung herunterladen
        </a>
      )}
    </div>
  );
}
