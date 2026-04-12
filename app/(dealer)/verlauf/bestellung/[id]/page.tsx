"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* ================= TYPES ================= */
type OrderHeader = {
  submission_id: number;
  dealer_id: number;
  created_at: string;
  status: string | null;
  dealer_reference?: string | null;
};

type OrderItem = {
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
export default function BestellungDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } = useActiveDealer();

  const [header, setHeader] = useState<OrderHeader | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = useMemo(() => getLocale(lang), [lang]);

  useEffect(() => {
    if (!id || dealerLoading || !dealer?.dealer_id) return;

    (async () => {
      setLoading(true);

      const { data: headerData, error: headerError } = await supabase
        .from("submissions")
        .select(`
          submission_id,
          dealer_id,
          created_at,
          status,
          dealer_reference
        `)
        .eq("submission_id", Number(id))
        .eq("dealer_id", dealer.dealer_id)
        .eq("typ", "bestellung")
        .single();

      if (headerError || !headerData) {
        setHeader(null);
        setLoading(false);
        return;
      }

      setHeader(headerData as OrderHeader);

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

      setItems((itemsData ?? []) as OrderItem[]);
      setLoading(false);
    })();
  }, [id, dealer?.dealer_id, dealerLoading, supabase]);

  if (dealerLoading || loading) {
    return (
      <p className="text-gray-500">
        ⏳ {t("verlauf.bestellung.loading")}
      </p>
    );
  }

  if (!header) {
    return (
      <p className="text-red-600">
        {t("verlauf.bestellung.notFound")}
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

  const positionsLabel =
    items.length === 1
      ? t("verlauf.bestellung.positionSingle")
      : t("verlauf.bestellung.positionPlural");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label={t("verlauf.bestellung.back")}
          title={t("verlauf.bestellung.back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <ShoppingCart className="w-6 h-6 text-blue-700" />

        <div>
          <h1 className="text-lg font-semibold">
            {t("verlauf.bestellung.title", {
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

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left">
                {t("verlauf.bestellung.table.product")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("verlauf.bestellung.table.ean")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.bestellung.table.quantity")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.bestellung.table.price")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.bestellung.table.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.item_id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  {i.product_name ?? t("verlauf.bestellung.emptyValue")}
                </td>
                <td className="px-3 py-2 font-mono">
                  {i.ean ?? t("verlauf.bestellung.emptyValue")}
                </td>
                <td className="px-3 py-2 text-right">{i.menge ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  {(i.preis ?? 0).toLocaleString(locale, {
                    style: "currency",
                    currency: "CHF",
                  })}
                </td>
                <td className="px-3 py-2 text-right font-medium">
                  {(Number(i.menge || 0) * Number(i.preis || 0)).toLocaleString(
                    locale,
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