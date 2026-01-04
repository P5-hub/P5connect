"use client";

import { useState } from "react";
import { Download, RefreshCcw, Search, Loader2 } from "lucide-react";

import AdminReportKPIs from "@/components/admin/AdminReportKPIs";
import AdminRecentActivity from "@/components/admin/AdminRecentActivity";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [exportType, setExportType] = useState("bestellung");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  /* ================= EXPORT ================= */
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
          search: searchTerm || null, // ✅ NEU
        }),
      });

      if (!res.ok) throw new Error("Export fehlgeschlagen");

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

      setLastExport(new Date().toLocaleString("de-CH"));
    } catch (e: any) {
      alert(e?.message || "Export fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          📊 Datenexport & Berichte
        </h1>

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
          {loading ? "Export läuft…" : "Exportieren (Excel)"}
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="flex flex-wrap gap-4 items-center bg-gray-50 border border-gray-200 rounded-md p-4">

        {/* Typ */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Typ:</span>
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="bestellung">Bestellungen</option>
            <option value="verkauf">Verkäufe</option>
            <option value="projekt">Projekte</option>
            <option value="support">Support</option>
          </select>
        </div>

        {/* Zeitraum */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Von:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-2 py-1 rounded-md text-sm"
          />
          <span>Bis:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-2 py-1 rounded-md text-sm"
          />
        </div>

        {/* Suche (nur optisch, noch nicht angebunden) */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Produkt oder Händler suchen…"
            className="pl-9 pr-3 py-2 text-sm border rounded-md w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
            setSearchTerm("");
            setExportType("bestellung");
          }}
          className="flex items-center gap-2 text-sm border px-3 py-1.5 rounded-md hover:bg-gray-100"
        >
          <RefreshCcw className="w-4 h-4" />
          Reset
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
          Letzter Export: {lastExport}
        </p>
      )}

      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm rounded-md p-4">
        💡 <b>Hinweis:</b>  
        Anzeige, KPIs und Excel-Export basieren auf exakt denselben Filtern.
      </div>
    </div>
  );
}
