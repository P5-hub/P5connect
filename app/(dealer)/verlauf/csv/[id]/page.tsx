"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";

/* ================= TYPES ================= */
type CsvItem = {
  id: string;
  ean: string;
  product_name: string;
  quantity: number;
  price: number;
  revenue: number;
  kommentar?: string | null;
  seriennummer?: string | null;
};

type CsvHeader = {
  id: string;
  dealer_id: number;
  created_at: string | null;
};

/* ================= COMPONENT ================= */
export default function CsvUploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading, isImpersonated } =
    useActiveDealer();

  const [header, setHeader] = useState<CsvHeader | null>(null);
  const [items, setItems] = useState<CsvItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    const load = async () => {
      setLoading(true);

      /* ===== HEADER (Händler-Check!) ===== */
      const { data: headerData, error: headerError } = await supabase
        .from("verkauf_csv_meldungen")
        .select("id, dealer_id, created_at")
        .eq("id", id)
        .eq("dealer_id", dealer.dealer_id)
        .single();

      if (headerError || !headerData) {
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader(headerData);

      /* ===== ITEMS ===== */
      const { data: itemsData } = await supabase
        .from("verkauf_csv_items")
        .select(
          `
          id,
          ean,
          product_name,
          quantity,
          price,
          revenue,
          kommentar,
          seriennummer
        `
        )
        .eq("meldung_id", id)
        .order("product_name");

      setItems((itemsData ?? []) as CsvItem[]);
      setLoading(false);
    };

    load();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ CSV-Details werden geladen…</p>;
  }

  if (!header) {
    return (
      <p className="text-red-600">
        CSV-Upload nicht gefunden oder kein Zugriff.
      </p>
    );
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.revenue || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* ===== Header ===== */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (isImpersonated && dealer?.dealer_id) {
              router.push(`/verlauf?dealer_id=${dealer.dealer_id}`);
            } else {
              router.push("/verlauf");
            }
          }}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <FileSpreadsheet className="w-6 h-6 text-green-700" />

        <div>
          <h1 className="text-lg font-semibold">
            CSV-Verkauf V-CSV-{header.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-gray-500">
            {items.length} Position
            {items.length !== 1 ? "en" : ""} ·{" "}
            {totalAmount.toLocaleString("de-CH", {
              style: "currency",
              currency: "CHF",
            })}{" "}
            ·{" "}
            {header.created_at
              ? new Date(header.created_at).toLocaleString("de-CH")
              : "—"}
          </p>
        </div>
      </div>

      {/* ===== Tabelle ===== */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">EAN</th>
              <th className="px-3 py-2 text-left">Produkt</th>
              <th className="px-3 py-2 text-right">Menge</th>
              <th className="px-3 py-2 text-right">Preis</th>
              <th className="px-3 py-2 text-right">Umsatz</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-mono">{i.ean}</td>
                <td className="px-3 py-2">{i.product_name}</td>
                <td className="px-3 py-2 text-right">{i.quantity}</td>
                <td className="px-3 py-2 text-right">
                  {i.price.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {i.revenue.toLocaleString("de-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
