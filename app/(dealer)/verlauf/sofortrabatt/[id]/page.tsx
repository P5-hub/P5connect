"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { ArrowLeft, Percent, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

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

export default function SofortrabattDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const { t, lang } = useI18n();

  const { dealer, loading: dealerLoading, isImpersonated } = useActiveDealer();

  const [data, setData] = useState<SofortrabattHeader | null>(null);
  const [loading, setLoading] = useState(true);

  const locale = useMemo(() => getLocale(lang), [lang]);

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
    return (
      <p className="text-gray-500">⏳ {t("verlauf.sofortrabatt.loading")}</p>
    );
  }

  if (!data) {
    return (
      <p className="text-red-600">{t("verlauf.sofortrabatt.notFound")}</p>
    );
  }

  const invoiceUrl = data.invoice_file_url
    ? supabase.storage
        .from("sofortrabatt-invoices")
        .getPublicUrl(data.invoice_file_url).data.publicUrl
    : null;

  const displayDate = data.submission_date || data.created_at;

  const backUrl = isImpersonated
    ? `/verlauf?dealer_id=${dealer?.dealer_id}`
    : "/verlauf";

  const statusLabel =
    data.status === "approved"
      ? t("verlauf.sofortrabatt.status.approved")
      : data.status === "rejected"
      ? t("verlauf.sofortrabatt.status.rejected")
      : data.status === "pending"
      ? t("verlauf.sofortrabatt.status.pending")
      : t("verlauf.sofortrabatt.emptyValue");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(backUrl)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label={t("verlauf.sofortrabatt.back")}
          title={t("verlauf.sofortrabatt.back")}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <Percent className="w-6 h-6 text-orange-600" />

        <div>
          <h1 className="text-lg font-semibold">
            {t("verlauf.sofortrabatt.title", {
              id: String(data.claim_id),
            })}
          </h1>
          <p className="text-sm text-gray-500">
            {t("verlauf.sofortrabatt.discountLevel")} {data.rabatt_level ?? t("verlauf.sofortrabatt.emptyValue")} ·{" "}
            {(data.rabatt_betrag ?? 0).toLocaleString(locale, {
              style: "currency",
              currency: "CHF",
            })}{" "}
            ·{" "}
            {displayDate
              ? new Date(displayDate).toLocaleString(locale)
              : t("verlauf.sofortrabatt.emptyValue")}
          </p>
        </div>
      </div>

      <div className="text-sm">
        {t("verlauf.sofortrabatt.status.label")}:{" "}
        <span className="font-medium capitalize">{statusLabel}</span>
      </div>

      {data.comment && (
        <div className="rounded-md border bg-gray-50 p-3 text-sm">
          💬 {data.comment}
        </div>
      )}

      {data.products && data.products.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left">
                  {t("verlauf.sofortrabatt.table.product")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("verlauf.sofortrabatt.table.ean")}
                </th>
                <th className="px-3 py-2 text-left">
                  {t("verlauf.sofortrabatt.table.category")}
                </th>
                <th className="px-3 py-2 text-right">
                  {t("verlauf.sofortrabatt.table.quantity")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((p, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    {p.product_name || t("verlauf.sofortrabatt.emptyValue")}
                  </td>
                  <td className="px-3 py-2 font-mono">
                    {p.ean || t("verlauf.sofortrabatt.emptyValue")}
                  </td>
                  <td className="px-3 py-2">
                    {p.category ?? t("verlauf.sofortrabatt.emptyValue")}
                  </td>
                  <td className="px-3 py-2 text-right">{p.qty ?? 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        data.product_list && (
          <div className="text-sm text-gray-700">{data.product_list}</div>
        )
      )}

      {invoiceUrl && (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
        >
          <Download className="w-4 h-4" />
          {t("verlauf.sofortrabatt.downloadInvoice")}
        </a>
      )}
    </div>
  );
}