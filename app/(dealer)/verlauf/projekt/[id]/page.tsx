"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, Briefcase } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

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
export default function ProjektDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } = useActiveDealer();

  const [header, setHeader] = useState<ProjectHeader | null>(null);
  const [items, setItems] = useState<ProjectItem[]>([]);
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
    return <p className="text-gray-500">⏳ {t("verlauf.projekt.loading")}</p>;
  }

  if (!header) {
    return <p className="text-red-600">{t("verlauf.projekt.notFound")}</p>;
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
      ? t("verlauf.projekt.positionSingle")
      : t("verlauf.projekt.positionPlural");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label={t("verlauf.projekt.back")}
          title={t("verlauf.projekt.back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <Briefcase className="w-6 h-6 text-purple-700" />

        <div>
          <h1 className="text-lg font-semibold">
            {t("verlauf.projekt.title", {
              id: String(header.submission_id),
            })}
          </h1>
          {header.project_name && (
            <p className="text-sm text-purple-700 font-medium">
              {header.project_name}
            </p>
          )}
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
                {t("verlauf.projekt.table.product")}
              </th>
              <th className="px-3 py-2 text-left">
                {t("verlauf.projekt.table.ean")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.projekt.table.quantity")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.projekt.table.price")}
              </th>
              <th className="px-3 py-2 text-right">
                {t("verlauf.projekt.table.total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.item_id} className="border-b last:border-b-0">
                <td className="px-3 py-2">
                  {i.product_name ?? t("verlauf.projekt.emptyValue")}
                </td>
                <td className="px-3 py-2 font-mono">
                  {i.ean ?? t("verlauf.projekt.emptyValue")}
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