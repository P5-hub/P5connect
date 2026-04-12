"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
export default function CsvUploadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } =
    useActiveDealer();

  const [header, setHeader] = useState<CsvHeader | null>(null);
  const [items, setItems] = useState<CsvItem[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = useMemo(() => getLocale(lang), [lang]);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    const load = async () => {
      setLoading(true);

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
    return (
      <p className="text-gray-500">
        ⏳ {t("verlauf.csv.loading")}
      </p>
    );
  }

  if (!header) {
    return (
      <p className="text-red-600">
        {t("verlauf.csv.notFound")}
      </p>
    );
  }

  const totalAmount = items.reduce(
    (sum, i) => sum + Number(i.revenue || 0),
    0
  );

  const backUrl =
    isImpersonated && dealer?.dealer_id
      ? `/verlauf?dealer_id=${dealer.dealer_id}`
      : "/verlauf";

  const positionsLabel =
    items.length === 1
      ? t("verlauf.csv.positionSingle")
      : t("verlauf.csv.positionPlural");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label={t("verlauf.csv.back")}
          title={t("verlauf.csv.back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <FileSpreadsheet className="w-6 h-6 text-green-700" />

        <div>
          <h1 className="text-lg font-semibold">
            {t("verlauf.csv.title", {
              id: header.id.slice(0, 8),
            })}
          </h1>
          <p className="text-sm text-gray-500">
            {items.length} {positionsLabel} ·{" "}
            {totalAmount.toLocaleString(locale, {
              style: "currency",
              currency: "CHF",
            })}{" "}
            ·{" "}
            {header.created_at
              ? new Date(header.created_at).toLocaleString(locale)
              : t("verlauf.csv.emptyValue")}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                {t("verlauf.csv.table.ean")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("verlauf.csv.table.product")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.csv.table.quantity")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.csv.table.price")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.csv.table.revenue")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-mono">
                  {i.ean || t("verlauf.csv.emptyValue")}
                </td>
                <td className="px-3 py-2">
                  {i.product_name || t("verlauf.csv.emptyValue")}
                </td>
                <td className="px-3 py-2 text-right">{i.quantity ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  {Number(i.price ?? 0).toLocaleString(locale, {
                    style: "currency",
                    currency: "CHF",
                  })}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {Number(i.revenue ?? 0).toLocaleString(locale, {
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