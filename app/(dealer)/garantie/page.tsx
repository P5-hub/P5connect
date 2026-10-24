"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { WARRANTY_URLS } from "@/lib/warranty-registration";

export default function GarantiePage() {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-24 md:px-6 md:pt-28">
      <div className="mb-8 flex items-start gap-3">
        <ShieldCheck className="mt-1 h-8 w-8 shrink-0 text-cyan-600" aria-hidden="true" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{t("garantie.title")}</h1>
          <p className="mt-2 text-gray-600">{t("garantie.description")}</p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-8">
        <h2 className="text-xl font-semibold text-gray-900">{t("garantie.section")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{t("garantie.info")}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={WARRANTY_URLS.de} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-3 text-center font-medium text-white transition hover:bg-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
            {t("garantie.german")} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a href={WARRANTY_URLS.fr} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-cyan-700 px-4 py-3 text-center font-medium text-cyan-800 transition hover:bg-cyan-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
            {t("garantie.french")} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-gray-500">{t("garantie.note")}</p>
      </section>
    </main>
  );
}
