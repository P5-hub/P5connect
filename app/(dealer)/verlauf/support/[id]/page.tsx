"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, LifeBuoy, Paperclip } from "lucide-react";

/* ================= TYPES ================= */

type SupportHeader = {
  submission_id: number;
  dealer_id: number | null;
  created_at: string;
  status: string | null;
  kommentar: string | null;
  project_file_path: string | null;
};

type SupportItem = {
  item_id: number;
  product_name: string | null;
  ean: string | null;
  menge: number | null;
  preis: number | null;
  comment: string | null;
};

type SupportMeta = {
  support_typ: string | null;
  betrag: number | null;
};

/* ================= COMPONENT ================= */

export default function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  const { dealer, loading: dealerLoading } = useActiveDealer();

  const [header, setHeader] = useState<SupportHeader | null>(null);
  const [items, setItems] = useState<SupportItem[]>([]);
  const [meta, setMeta] = useState<SupportMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

      /* ===== HEADER (Submission!) ===== */
      const { data: headerData, error: headerErr } = await supabase
        .from("submissions")
        .select(
          "submission_id, dealer_id, created_at, status, kommentar, project_file_path"
        )
        .eq("submission_id", Number(id))
        .eq("typ", "support")
        .eq("dealer_id", dealer.dealer_id)
        .single();

      if (headerErr || !headerData) {
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader(headerData as SupportHeader);

      /* ===== ITEMS (Sell-Out Support) ===== */
      const { data: itemsData } = await supabase
        .from("submission_items")
        .select(
          "item_id, product_name, ean, menge, preis, comment"
        )
        .eq("submission_id", Number(id))
        .order("item_id");

      setItems((itemsData ?? []) as SupportItem[]);

      /* ===== META (Non-Sell-Out Support, optional) ===== */
      const { data: metaData } = await supabase
        .from("support_details")
        .select("support_typ, betrag")
        .eq("submission_id", Number(id))
        .single();

      if (metaData) {
        setMeta(metaData as SupportMeta);
      }

      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return <p className="text-gray-500">⏳ Support-Details werden geladen…</p>;
  }

  if (!header) {
    return (
      <p className="text-red-600">
        Support-Fall nicht gefunden oder kein Zugriff.
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

        <LifeBuoy className="w-6 h-6 text-teal-700" />

        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            Support S-{header.submission_id}
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

        {header.project_file_path && (
          <a
            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/support-documents/${header.project_file_path}`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <Paperclip className="w-4 h-4" />
            Beleg
          </a>
        )}
      </div>

      {/* ===== KOMMENTAR ===== */}
      {header.kommentar && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {header.kommentar}
        </div>
      )}

      {/* ===== NON-SELLOUT META ===== */}
      {meta && (
        <div className="rounded-md border bg-teal-50 p-3 text-sm">
          <strong>Support-Typ:</strong> {meta.support_typ}
          {meta.betrag != null && (
            <>
              <br />
              <strong>Betrag:</strong>{" "}
              {meta.betrag.toLocaleString("de-CH", {
                style: "currency",
                currency: "CHF",
              })}
            </>
          )}
        </div>
      )}

      {/* ===== ITEMS ===== */}
      {items.length > 0 && (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">Produkt</th>
                <th className="px-3 py-2 text-left">EAN</th>
                <th className="px-3 py-2 text-right">Menge</th>
                <th className="px-3 py-2 text-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.item_id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{i.product_name ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">{i.ean ?? "—"}</td>
                  <td className="px-3 py-2 text-right">{i.menge ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    {(Number(i.preis ?? 0) * Number(i.menge ?? 0)).toLocaleString(
                      "de-CH",
                      { style: "currency", currency: "CHF" }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
