"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

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

/* ================= HELPERS ================= */

function getLocale(lang: string) {
  switch (lang) {
    case "de":
      return "de-CH";
    case "en":
      return "en-CH";
    case "fr":
      return "fr-CH";
    case "it":
      return "it-CH";
    case "rm":
      return "rm-CH";
    default:
      return "de-CH";
  }
}

/* ================= COMPONENT ================= */

export default function VerkaufDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } = useActiveDealer();

  const [header, setHeader] = useState<VerkaufHeader | null>(null);
  const [items, setItems] = useState<VerkaufItem[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = useMemo(() => getLocale(lang), [lang]);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

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

      const { data: itemsData } = await supabase
        .from("submission_items")
        .select("item_id, product_name, ean, menge, preis")
        .eq("submission_id", Number(id))
        .order("item_id", { ascending: true });

      setItems((itemsData ?? []) as VerkaufItem[]);
      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return (
      <p className="text-gray-500">
        ⏳ {t("verlauf.verkauf.loading")}
      </p>
    );
  }

  if (!header) {
    return (
      <p className="text-red-600">
        {t("verlauf.verkauf.notFound")}
      </p>
    );
  }

  const totalAmount = items.reduce(
    (s, i) => s + Number(i.preis ?? 0) * Number(i.menge ?? 0),
    0
  );

  const backUrl = isImpersonated
    ? `/verlauf?dealer_id=${dealer?.dealer_id}`
    : "/verlauf";

  const positionsLabel =
    items.length === 1
      ? t("verlauf.verkauf.positionSingle")
      : t("verlauf.verkauf.positionPlural");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label={t("verlauf.verkauf.back")}
          title={t("verlauf.verkauf.back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <FileSpreadsheet className="w-6 h-6 text-green-700" />

        <div>
          <h1 className="text-lg font-semibold">
            {t("verlauf.verkauf.title", {
              id: String(header.submission_id),
            })}
          </h1>
          <p className="text-sm text-gray-500">
            {items.length} {positionsLabel} ·{" "}
            {totalAmount.toLocaleString(locale, {
              style: "currency",
              currency: "CHF",
            })}{" "}
            · {new Date(header.created_at).toLocaleString(locale)}
          </p>
        </div>
      </div>

      {header.kommentar && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {header.kommentar}
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                {t("verlauf.verkauf.table.product")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("verlauf.verkauf.table.ean")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.verkauf.table.quantity")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.verkauf.table.price")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.verkauf.table.revenue")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const revenue =
                Number(i.preis ?? 0) * Number(i.menge ?? 0);

              return (
                <tr key={i.item_id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    {i.product_name ?? t("verlauf.verkauf.emptyValue")}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {i.ean ?? t("verlauf.verkauf.emptyValue")}
                  </td>
                  <td className="px-3 py-2 text-right">{i.menge ?? 0}</td>
                  <td className="px-3 py-2 text-right">
                    {Number(i.preis ?? 0).toLocaleString(locale, {
                      style: "currency",
                      currency: "CHF",
                    })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {revenue.toLocaleString(locale, {
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