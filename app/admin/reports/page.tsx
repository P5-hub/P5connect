"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Download,
  RefreshCcw,
  Search,
  Loader2,
  BarChart3,
  Target,
  FileSpreadsheet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

import AdminReportKPIs from "@/components/admin/AdminReportKPIs";
import AdminRecentActivity from "@/components/admin/AdminRecentActivity";

export default function ReportsPage() {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState("");
  const [exportType, setExportType] = useState("bestellung");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/exports/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: exportType,
          from: fromDate || null,
          to: toDate || null,
          search: searchTerm || null,
        }),
      });

      if (!res.ok) throw new Error(t("adminReports.messages.exportError"));

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);

      const dateLabel =
        fromDate && toDate
          ? `_${fromDate.replaceAll("-", "")}-${toDate.replaceAll("-", "")}`
          : "";

      a.download = `${exportType}_alle${dateLabel}.xlsx`;
      a.click();

      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
      setLastExport(new Date().toLocaleString());
    } catch (e: any) {
      alert(e?.message || t("adminReports.messages.exportError"));
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFromDate("");
    setToDate("");
    setSearchTerm("");
    setExportType("bestellung");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            📊 {t("adminReports.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Standardauswertungen, Exporte und Kampagnen-Reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/reports/campaigns"
            className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-md hover:bg-blue-100 transition"
          >
            <Target className="w-4 h-4" />
            Kampagnenreport
          </Link>

          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md hover:bg-green-100 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {loading
              ? t("adminReports.actions.exportRunning")
              : t("adminReports.actions.exportExcel")}
          </button>
        </div>
      </div>

      {/* ================= REPORT NAVIGATION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-blue-100 bg-blue-50 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-800 font-semibold">
            <BarChart3 className="w-5 h-5" />
            Standard Reports
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Übersicht und Export nach Bestellungen, Verkäufen, Projekten und Support.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-blue-700 bg-white/70 border border-blue-100 rounded-full px-3 py-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Aktuelle Ansicht
          </div>
        </div>

        <Link
          href="/admin/reports/campaigns"
          className="border border-emerald-100 bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition shadow-sm block"
        >
          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
            <Target className="w-5 h-5" />
            Kampagnen Reports
          </div>
          <p className="text-sm text-emerald-700 mt-2">
            Umsatz, Mengen, Top-Händler, Top-Produkte und Display-Anteil pro Kampagne.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-white/70 border border-emerald-100 rounded-full px-3 py-1">
            Öffnen
          </div>
        </Link>
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex flex-wrap gap-4 items-center bg-gray-50 border border-gray-200 rounded-md p-4">
        {/* Typ */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {t("adminReports.fields.type")}:
          </span>

          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white"
          >
            <option value="bestellung">
              {t("adminReports.types.bestellung")}
            </option>
            <option value="verkauf">{t("adminReports.types.verkauf")}</option>
            <option value="projekt">{t("adminReports.types.projekt")}</option>
            <option value="support">{t("adminReports.types.support")}</option>
          </select>
        </div>

        {/* Zeitraum */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>{t("adminReports.fields.from")}:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded-md text-sm bg-white"
          />

          <span>{t("adminReports.fields.to")}:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded-md text-sm bg-white"
          />
        </div>

        {/* Suche */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("adminReports.placeholders.search")}
            className="pl-9 pr-3 py-2 text-sm border rounded-md w-64 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Reset */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-2 text-sm border px-3 py-1.5 rounded-md hover:bg-gray-100 bg-white"
        >
          <RefreshCcw className="w-4 h-4" />
          {t("adminReports.actions.reset")}
        </button>
      </div>

      {/* ================= KPIs ================= */}
      <AdminReportKPIs
        typ={exportType}
        fromDate={fromDate}
        toDate={toDate}
        search={searchTerm}
      />

      {/* ================= VERLAUF ================= */}
      <AdminRecentActivity
        typ={exportType}
        fromDate={fromDate}
        toDate={toDate}
        search={searchTerm}
      />

      {/* ================= FOOTER ================= */}
      {lastExport && (
        <p className="text-xs text-gray-500 italic">
          {t("adminReports.labels.lastExport")}: {lastExport}
        </p>
      )}

      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-md p-4">
        💡 <b>{t("adminReports.labels.hint")}:</b>{" "}
        {t("adminReports.labels.hintText")}
      </div>
    </div>
  );
}