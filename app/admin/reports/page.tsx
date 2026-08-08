"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Download,
  RefreshCcw,
  Search,
  Loader2,
  BarChart3,
  Target,
  PackageSearch,
  FileSpreadsheet,
  Filter,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

import AdminReportKPIs from "@/components/admin/AdminReportKPIs";
import AdminRecentActivity from "@/components/admin/AdminRecentActivity";

type ReportType = "bestellung" | "verkauf" | "projekt" | "support";

type AppliedFilters = {
  search: string;
  type: ReportType;
  from: string;
  to: string;
};

function getDefaultFromDate() {
  return `${new Date().getFullYear()}-01-01`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getTypeLabel(type: ReportType) {
  if (type === "bestellung") return "Bestellungen";
  if (type === "verkauf") return "Verkäufe";
  if (type === "projekt") return "Projekte";
  if (type === "support") return "Support";
  return type;
}

export default function ReportsPage() {
  const { t } = useI18n();

  const defaultFromDate = useMemo(() => getDefaultFromDate(), []);
  const today = useMemo(() => getToday(), []);

  const [searchTerm, setSearchTerm] = useState("");
  const [exportType, setExportType] = useState<ReportType>("bestellung");
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(today);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    search: "",
    type: "bestellung",
    from: defaultFromDate,
    to: today,
  });

  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const hasPendingFilterChanges =
    searchTerm.trim() !== appliedFilters.search ||
    exportType !== appliedFilters.type ||
    fromDate !== appliedFilters.from ||
    toDate !== appliedFilters.to;

  const applyFilters = () => {
    if (!fromDate || !toDate) {
      alert("Bitte Von- und Bis-Datum auswählen.");
      return;
    }

    if (fromDate > toDate) {
      alert("Das Von-Datum darf nicht nach dem Bis-Datum liegen.");
      return;
    }

    setAppliedFilters({
      search: searchTerm.trim(),
      type: exportType,
      from: fromDate,
      to: toDate,
    });
  };

  const resetFilters = () => {
    setFromDate(defaultFromDate);
    setToDate(today);
    setSearchTerm("");
    setExportType("bestellung");

    setAppliedFilters({
      search: "",
      type: "bestellung",
      from: defaultFromDate,
      to: today,
    });
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/exports/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: appliedFilters.type,
          from: appliedFilters.from || null,
          to: appliedFilters.to || null,
          search: appliedFilters.search || null,
        }),
      });

      if (!res.ok) {
        throw new Error(t("adminReports.messages.exportError"));
      }

      const blob = await res.blob();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);

      const dateLabel =
        appliedFilters.from && appliedFilters.to
          ? `_${appliedFilters.from.replaceAll("-", "")}-${appliedFilters.to.replaceAll("-", "")}`
          : "";

      const searchLabel = appliedFilters.search
        ? `_suche_${appliedFilters.search
            .replaceAll("/", "-")
            .replaceAll("\\", "-")
            .replaceAll(":", "-")
            .replaceAll("*", "-")
            .replaceAll("?", "-")
            .replaceAll('"', "")
            .replaceAll("<", "")
            .replaceAll(">", "")
            .replaceAll("|", "")
            .replaceAll(" ", "_")}`
        : "";

      anchor.download = `${appliedFilters.type}_report${dateLabel}${searchLabel}.xlsx`;
      anchor.click();

      setTimeout(() => URL.revokeObjectURL(anchor.href), 3000);
      setLastExport(new Date().toLocaleString("de-CH"));
    } catch (error: any) {
      alert(error?.message || t("adminReports.messages.exportError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Datenexport & Berichte
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Standardauswertungen, schnelle Suche, Exporte und Detailberichte.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reports/campaigns"
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
          >
            <Target className="h-4 w-4" />
            Kampagnenreport
          </Link>

          <button
            type="button"
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading ? "Export läuft…" : "Exportieren (Excel)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-blue-800">
            <BarChart3 className="h-5 w-5" />
            Standard Reports
          </div>
          <p className="mt-2 text-sm text-blue-700">
            Übersicht und Export nach Bestellungen, Verkäufen, Projekten und
            Support.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Aktuelle Ansicht
          </div>
        </div>

        <Link
          href="/admin/reports/sellin"
          className="block rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm transition hover:bg-blue-100"
        >
          <div className="flex items-center gap-2 font-semibold text-blue-800">
            <PackageSearch className="h-5 w-5" />
            Sell-in Dashboard
          </div>
          <p className="mt-2 text-sm text-blue-700">
            Bestellungen nach Produkt, Händler und Konditionsart analysieren.
          </p>
          <div className="mt-3 inline-flex rounded-full border border-blue-100 bg-white/70 px-3 py-1 text-xs font-medium text-blue-700">
            Öffnen
          </div>
        </Link>

        <Link
          href="/admin/reports/sellout"
          className="block rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm transition hover:bg-green-100"
        >
          <div className="flex items-center gap-2 font-semibold text-green-800">
            <TrendingUp className="h-5 w-5" />
            Sell-out Dashboard
          </div>
          <p className="mt-2 text-sm text-green-700">
            Verkäufe, Lagerbestände, Top-Produkte und Händler-Drilldown.
          </p>
          <div className="mt-3 inline-flex rounded-full border border-green-100 bg-white/70 px-3 py-1 text-xs font-medium text-green-700">
            Öffnen
          </div>
        </Link>

        <Link
          href="/admin/reports/campaigns"
          className="block rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm transition hover:bg-emerald-100"
        >
          <div className="flex items-center gap-2 font-semibold text-emerald-800">
            <Target className="h-5 w-5" />
            Kampagnen Reports
          </div>
          <p className="mt-2 text-sm text-emerald-700">
            Umsatz, Mengen, Top-Händler, Top-Produkte und Display-Anteil pro
            Kampagne.
          </p>
          <div className="mt-3 inline-flex rounded-full border border-emerald-100 bg-white/70 px-3 py-1 text-xs font-medium text-emerald-700">
            Öffnen
          </div>
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Typ
            </label>
            <select
              value={exportType}
              onChange={(event) =>
                setExportType(event.target.value as ReportType)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="bestellung">Bestellungen</option>
              <option value="verkauf">Verkäufe</option>
              <option value="projekt">Projekte</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Von
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Bis
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
          </div>

          <div className="relative lg:col-span-6">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Suche
            </label>
            <Search className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Händler, Produkt, EAN, Bestell-Nr., Referenz oder Kundennummer"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
              Aktiv: {getTypeLabel(appliedFilters.type)}
            </span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
              {appliedFilters.from} bis {appliedFilters.to}
            </span>
            {appliedFilters.search ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700">
                Suche: {appliedFilters.search}
              </span>
            ) : null}
            {hasPendingFilterChanges ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                Filter geändert – noch nicht angewendet
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Filter className="h-4 w-4" />
              Filter anwenden
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-12">
          <AdminReportKPIs
            typ={appliedFilters.type}
            fromDate={appliedFilters.from}
            toDate={appliedFilters.to}
            search={appliedFilters.search}
          />
        </div>

        <div className="xl:col-span-12">
          <AdminRecentActivity
            typ={appliedFilters.type}
            fromDate={appliedFilters.from}
            toDate={appliedFilters.to}
            search={appliedFilters.search}
          />
        </div>
      </div>

      {lastExport ? (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          Letzter Export: {lastExport}
        </div>
      ) : null}

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <div className="flex items-start gap-2">
          <ShoppingCart className="mt-0.5 h-4 w-4" />
          <div>
            <b>Hinweis:</b> Für detaillierte Produkt-/Händleranalysen ist das
            Sell-in Dashboard besser geeignet. Dieser Standard Report ist für
            schnelle Übersicht und Excel-Export gedacht.
          </div>
        </div>
      </div>
    </div>
  );
}