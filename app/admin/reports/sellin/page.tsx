"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  Download,
  Loader2,
  PackageSearch,
  RefreshCcw,
  Search,
  Store,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SellinProductSummary = {
  product_id: number | null;
  sony_article: string | null;
  product_name: string | null;
  ean: string | null;
  sellin_mode: string | null;
  positionen: number | null;
  menge: number | null;
  umsatz: number | null;
  avg_preis: number | null;
  min_preis: number | null;
  max_preis: number | null;
  dealer_count: number | null;
  first_order_date: string | null;
  last_order_date: string | null;
};

type SellinDealerDetail = {
  item_id: number;
  submission_id: number;
  dealer_id: number | null;
  dealer_name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;
  product_id: number | null;
  sony_article: string | null;
  product_name: string | null;
  ean: string | null;
  sellin_mode: string | null;
  menge: number | null;
  preis: number | null;
  umsatz: number | null;
  invest: number | null;
  total_invest: number | null;
  distributor: string | null;
  dealer_reference: string | null;
  customer_number: string | null;
  created_at: string | null;
  order_date: string | null;
};

type DealerOption = {
  dealer_id: number;
  dealer_name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;
};

function formatCurrency(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("de-CH", {
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
}

function getProductKey(row: {
  product_id: number | null;
  ean: string | null;
  sony_article: string | null;
  product_name: string | null;
}) {
  return (
    row.product_id?.toString() ||
    row.ean ||
    row.sony_article ||
    row.product_name ||
    "unknown-product"
  );
}

function getProductLabel(row: {
  sony_article: string | null;
  product_name: string | null;
  product_id: number | null;
}) {
  return (
    row.sony_article ||
    row.product_name ||
    (row.product_id ? `Produkt #${row.product_id}` : "Unbekanntes Produkt")
  );
}

function getSelectionKey(row: {
  product_id: number | null;
  ean: string | null;
  sony_article: string | null;
  product_name: string | null;
  sellin_mode: string | null;
}) {
  return `${getProductKey(row)}-${row.sellin_mode || "standard"}`;
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      ) : null}
    </div>
  );
}

export default function SellinReportsPage() {
  const supabase = createClient();

  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [loading, setLoading] = useState(true);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const [fromDate, setFromDate] = useState(yearStart);
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [dealerOptions, setDealerOptions] = useState<DealerOption[]>([]);

  const [products, setProducts] = useState<SellinProductSummary[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<SellinProductSummary | null>(null);
  const [dealerDetails, setDealerDetails] = useState<SellinDealerDetail[]>([]);

  const loadDealers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("v_sellin_product_dealer_detail")
        .select("dealer_id, dealer_name, login_nr, kam, city")
        .gte("order_date", fromDate)
        .lte("order_date", toDate)
        .order("dealer_name", { ascending: true });

      if (error) throw error;

      const map = new Map<number, DealerOption>();

      (data ?? []).forEach((row: any) => {
        if (!row.dealer_id) return;

        if (!map.has(Number(row.dealer_id))) {
          map.set(Number(row.dealer_id), {
            dealer_id: Number(row.dealer_id),
            dealer_name: row.dealer_name,
            login_nr: row.login_nr,
            kam: row.kam,
            city: row.city,
          });
        }
      });

      setDealerOptions(
        Array.from(map.values()).sort((a, b) =>
          String(a.dealer_name ?? "").localeCompare(
            String(b.dealer_name ?? ""),
            "de-CH"
          )
        )
      );
    } catch (error) {
      console.error("Sell-in Händler laden Fehler:", error);
      setDealerOptions([]);
    }
  }, [supabase, fromDate, toDate]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setSelectedProduct(null);
    setDealerDetails([]);

    try {
      const tableName =
        dealerFilter === "all"
          ? "v_sellin_product_summary"
          : "v_sellin_product_dealer_summary";

      let query = supabase
        .from(tableName)
        .select("*")
        .gte("last_order_date", fromDate)
        .lte("first_order_date", toDate)
        .order("menge", { ascending: false });

      if (modeFilter !== "all") {
        query = query.eq("sellin_mode", modeFilter);
      }

      if (dealerFilter !== "all") {
        query = query.eq("dealer_id", Number(dealerFilter));
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts((data ?? []) as SellinProductSummary[]);
    } catch (error) {
      console.error("Sell-in Produkte laden Fehler:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, fromDate, toDate, modeFilter, dealerFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadDealers();
  }, [loadDealers]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((row) => {
      if (!q) return true;

      return [row.sony_article, row.product_name, row.ean, row.sellin_mode]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [products, search]);

  const activeSummary = useMemo(() => {
    return filteredProducts.reduce(
      (acc, row) => {
        const qty = Number(row.menge ?? 0);
        const revenue = Number(row.umsatz ?? 0);

        acc.qty += qty;
        acc.revenue += revenue;
        acc.positions += Number(row.positionen ?? 0);
        acc.dealerCount += Number(row.dealer_count ?? 0);

        if (row.sellin_mode === "display") acc.displayQty += qty;
        if (row.sellin_mode === "messe") acc.messeQty += qty;
        if (row.sellin_mode === "standard") acc.standardQty += qty;

        return acc;
      },
      {
        qty: 0,
        revenue: 0,
        positions: 0,
        dealerCount: 0,
        displayQty: 0,
        messeQty: 0,
        standardQty: 0,
      }
    );
  }, [filteredProducts]);

  const openProductDrilldown = async (product: SellinProductSummary) => {
    const clickedKey = getSelectionKey(product);
    const selectedKey = selectedProduct ? getSelectionKey(selectedProduct) : null;

    if (clickedKey === selectedKey) {
      setSelectedProduct(null);
      setDealerDetails([]);
      setDrilldownLoading(false);
      return;
    }

    setSelectedProduct(product);
    setDealerDetails([]);
    setDrilldownLoading(true);

    try {
      let query = supabase
        .from("v_sellin_product_dealer_detail")
        .select("*")
        .gte("order_date", fromDate)
        .lte("order_date", toDate)
        .order("menge", { ascending: false });

      if (product.product_id) {
        query = query.eq("product_id", product.product_id);
      } else if (product.ean) {
        query = query.eq("ean", product.ean);
      } else if (product.sony_article) {
        query = query.eq("sony_article", product.sony_article);
      } else if (product.product_name) {
        query = query.eq("product_name", product.product_name);
      }

      if (modeFilter !== "all") {
        query = query.eq("sellin_mode", modeFilter);
      } else if (product.sellin_mode) {
        query = query.eq("sellin_mode", product.sellin_mode);
      }

      if (dealerFilter !== "all") {
        query = query.eq("dealer_id", Number(dealerFilter));
      }

      const { data, error } = await query;

      if (error) throw error;

      setDealerDetails((data ?? []) as SellinDealerDetail[]);
    } catch (error) {
      console.error("Sell-in Drilldown Fehler:", error);
      setDealerDetails([]);
    } finally {
      setDrilldownLoading(false);
    }
  };

  const exportProductCsv = () => {
    const header = [
      "Produkt",
      "Produktname",
      "EAN",
      "Kondition",
      "Menge",
      "Umsatz",
      "Positionen",
      "Händler",
      "Durchschnittspreis",
      "Min Preis",
      "Max Preis",
      "Erste Bestellung",
      "Letzte Bestellung",
    ];

    const lines = filteredProducts.map((row) =>
      [
        row.sony_article ?? "",
        row.product_name ?? "",
        row.ean ? `="${row.ean}"` : "",
        row.sellin_mode ?? "",
        row.menge ?? 0,
        row.umsatz ?? 0,
        row.positionen ?? 0,
        row.dealer_count ?? 0,
        row.avg_preis ?? "",
        row.min_preis ?? "",
        row.max_preis ?? "",
        row.first_order_date ?? "",
        row.last_order_date ?? "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";")
    );

    const csv = ["\uFEFF" + header.join(";"), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sellin_produkte_${fromDate}_${toDate}.csv`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  const exportDealerCsv = () => {
    if (!selectedProduct) return;

    const header = [
      "Produkt",
      "Produktname",
      "EAN",
      "Händler",
      "Login",
      "KAM",
      "Ort",
      "Menge",
      "Preis",
      "Umsatz",
      "Invest",
      "Total Invest",
      "Kondition",
      "Distributor",
      "Bestell-Nr",
      "Datum",
    ];

    const lines = dealerDetails.map((row) =>
      [
        row.sony_article ?? "",
        row.product_name ?? "",
        row.ean ? `="${row.ean}"` : "",
        row.dealer_name ?? "",
        row.login_nr ?? "",
        row.kam ?? "",
        row.city ?? "",
        row.menge ?? 0,
        row.preis ?? 0,
        row.umsatz ?? 0,
        row.invest ?? "",
        row.total_invest ?? "",
        row.sellin_mode ?? "",
        row.distributor ?? "",
        row.submission_id ?? "",
        row.order_date ?? "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";")
    );

    const csv = ["\uFEFF" + header.join(";"), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sellin_${getProductLabel(selectedProduct)}_${fromDate}_${toDate}.csv`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/reports"
            className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück zu Reports
          </Link>

          <div className="flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Sell-in Dashboard
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Bestellungen nach Produkt, Händler und Konditionsart auswerten.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadProducts}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>

          <Button
            type="button"
            onClick={exportProductCsv}
            disabled={!filteredProducts.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Produkte CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={exportDealerCsv}
            disabled={!selectedProduct || !dealerDetails.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Händler CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-8">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Von
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Bis
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Kondition
            </label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle</option>
              <option value="standard">Standard</option>
              <option value="display">Display</option>
              <option value="messe">Messe</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Händler
            </label>
            <select
              value={dealerFilter}
              onChange={(e) => setDealerFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Händler</option>
              {dealerOptions.map((dealer) => (
                <option key={dealer.dealer_id} value={String(dealer.dealer_id)}>
                  {dealer.dealer_name || `Dealer #${dealer.dealer_id}`}
                  {dealer.login_nr ? ` · ${dealer.login_nr}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Suche
            </label>
            <Search className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Produkt, Sony Artikel, EAN oder Kondition suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sell-in Daten werden geladen...
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard title="Menge" value={formatInteger(activeSummary.qty)} />
            <StatCard
              title="Umsatz"
              value={formatCurrency(activeSummary.revenue)}
            />
            <StatCard
              title="Positionen"
              value={formatInteger(activeSummary.positions)}
            />
            <StatCard
              title="Standard Menge"
              value={formatInteger(activeSummary.standardQty)}
            />
            <StatCard
              title="Display Menge"
              value={formatInteger(activeSummary.displayQty)}
            />
            <StatCard
              title="Messe Menge"
              value={formatInteger(activeSummary.messeQty)}
            />
          </div>

          <Card className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-semibold text-gray-900">
                Produkte
              </h2>
              <span className="text-sm text-gray-500">
                ({filteredProducts.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Produkt</th>
                    <th className="px-4 py-3 text-left">EAN</th>
                    <th className="px-4 py-3 text-left">Kondition</th>
                    <th className="px-4 py-3 text-right">Menge</th>
                    <th className="px-4 py-3 text-right">Umsatz</th>
                    <th className="px-4 py-3 text-right">Ø Preis</th>
                    <th className="px-4 py-3 text-right">Händler</th>
                    <th className="px-4 py-3 text-left">
                      Letzte Bestellung
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((row, index) => {
                    const key = [
                      getProductKey(row),
                      row.sellin_mode || "standard",
                      row.ean || "",
                      row.sony_article || "",
                      row.product_name || "",
                      index,
                    ].join("-");

                    const isSelected =
                      selectedProduct !== null &&
                      getSelectionKey(selectedProduct) === getSelectionKey(row);

                    return (
                      <Fragment key={key}>
                        <tr
                          onClick={() => openProductDrilldown(row)}
                          className={`cursor-pointer hover:bg-blue-50 ${
                            isSelected ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {row.sony_article || "–"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {row.product_name || "–"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {row.ean || "–"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                              {row.sellin_mode || "standard"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatInteger(row.menge)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(row.umsatz)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrency(row.avg_preis)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatInteger(row.dealer_count)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(row.last_order_date)}
                          </td>
                        </tr>

                        {isSelected ? (
                          <tr className="bg-blue-50/40">
                            <td colSpan={8} className="px-4 py-4">
                              <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 bg-blue-50 px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <Store className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">
                                        Händlerdetails: {getProductLabel(row)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Kondition:{" "}
                                        {row.sellin_mode || "standard"} ·
                                        Zeitraum: {formatDate(fromDate)} bis{" "}
                                        {formatDate(toDate)}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      exportDealerCsv();
                                    }}
                                    disabled={!dealerDetails.length}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Händler CSV
                                  </Button>
                                </div>

                                {drilldownLoading ? (
                                  <div className="flex items-center gap-2 p-5 text-sm text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Händlerdetails werden geladen...
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                          <th className="px-4 py-3 text-left">
                                            Händler
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                            Login
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                            KAM
                                          </th>
                                          <th className="px-4 py-3 text-right">
                                            Menge
                                          </th>
                                          <th className="px-4 py-3 text-right">
                                            Preis
                                          </th>
                                          <th className="px-4 py-3 text-right">
                                            Umsatz
                                          </th>
                                          <th className="px-4 py-3 text-right">
                                            Invest
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                            Distributor
                                          </th>
                                          <th className="px-4 py-3 text-left">
                                            Datum
                                          </th>
                                        </tr>
                                      </thead>

                                      <tbody className="divide-y divide-gray-100 bg-white">
                                        {dealerDetails.map((detail) => (
                                          <tr
                                            key={detail.item_id}
                                            className="hover:bg-gray-50"
                                          >
                                            <td className="px-4 py-3">
                                              <div className="font-medium text-gray-900">
                                                {detail.dealer_name ||
                                                  `Dealer #${
                                                    detail.dealer_id ?? "-"
                                                  }`}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {detail.city || "–"}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3">
                                              {detail.login_nr || "–"}
                                            </td>
                                            <td className="px-4 py-3">
                                              {detail.kam || "–"}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                              {formatInteger(detail.menge)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              {formatCurrency(detail.preis)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              {formatCurrency(detail.umsatz)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                              {formatCurrency(
                                                detail.total_invest
                                              )}
                                            </td>
                                            <td className="px-4 py-3">
                                              {detail.distributor || "–"}
                                            </td>
                                            <td className="px-4 py-3">
                                              {formatDate(detail.order_date)}
                                            </td>
                                          </tr>
                                        ))}

                                        {!dealerDetails.length ? (
                                          <tr>
                                            <td
                                              colSpan={9}
                                              className="px-4 py-6 text-center text-gray-500"
                                            >
                                              Keine Händlerdetails gefunden.
                                            </td>
                                          </tr>
                                        ) : null}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}

                  {!filteredProducts.length ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Keine Sell-in Daten gefunden.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}