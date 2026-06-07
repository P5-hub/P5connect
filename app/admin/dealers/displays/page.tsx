"use client";

import Link from "next/link";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  MonitorSmartphone,
  RefreshCcw,
  Search,
  Store,
} from "lucide-react";

type DealerDisplayItem = {
  display_item_id: number;
  dealer_id: number;
  product_id: number | null;
  product_name_snapshot: string | null;
  ordered_as_display: boolean | null;
  ordered_qty: number | null;
  is_displayed: boolean | null;
  status: "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed";
  source_submission_item_id: number | null;
  display_checked_at: string | null;
  display_checked_by: string | null;
  removed_at: string | null;
  removed_by: string | null;
  note: string | null;
  created_at: string | null;
  created_by: string | null;
};

type Dealer = {
  dealer_id: number;
  name: string | null;
  login_nr: string | null;
  email: string | null;
  kam: string | null;
  city: string | null;
};

type DisplayRow = DealerDisplayItem & {
  dealer?: Dealer | null;
};

type ProductSummary = {
  productKey: string;
  productId: number | null;
  productName: string;
  totalRows: number;
  totalQty: number;
  activeRows: number;
  activeQty: number;
  displayedRows: number;
  displayedQty: number;
  openRows: number;
  openQty: number;
  soldOrRemovedRows: number;
  soldOrRemovedQty: number;
  dealerCount: number;
  rows: DisplayRow[];
};

function formatInteger(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return Number(value).toLocaleString("de-CH", {
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
}

function getStatusLabel(status: DealerDisplayItem["status"]) {
  if (status === "ordered") return "Bestellt / offen";
  if (status === "displayed") return "Ausgestellt";
  if (status === "not_displayed") return "Nicht ausgestellt";
  if (status === "sold_off") return "Abverkauft";
  if (status === "removed") return "Entfernt";
  return status;
}

function getStatusClass(status: DealerDisplayItem["status"]) {
  if (status === "displayed") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (status === "ordered") {
    return "bg-amber-50 text-amber-700 ring-amber-100";
  }

  if (status === "not_displayed") {
    return "bg-red-50 text-red-700 ring-red-100";
  }

  if (status === "sold_off" || status === "removed") {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return "bg-gray-50 text-gray-700 ring-gray-100";
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
      {subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}
    </div>
  );
}

export default function AdminDealerDisplaysPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [displayItems, setDisplayItems] = useState<DealerDisplayItem[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "active" | "all" | "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed"
  >("active");
  const [expandedProductKey, setExpandedProductKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [displayRes, dealersRes] = await Promise.all([
        supabase
          .from("dealer_display_items")
          .select(`
            display_item_id,
            dealer_id,
            product_id,
            product_name_snapshot,
            ordered_as_display,
            ordered_qty,
            is_displayed,
            status,
            source_submission_item_id,
            display_checked_at,
            display_checked_by,
            removed_at,
            removed_by,
            note,
            created_at,
            created_by
          `)
          .order("product_name_snapshot", { ascending: true })
          .order("created_at", { ascending: false }),

        supabase
          .from("dealers")
          .select("dealer_id, name, login_nr, email, kam, city")
          .order("name", { ascending: true }),
      ]);

      if (displayRes.error) throw displayRes.error;
      if (dealersRes.error) throw dealersRes.error;

      setDisplayItems((displayRes.data ?? []) as DealerDisplayItem[]);
      setDealers((dealersRes.data ?? []) as Dealer[]);
    } catch (error) {
      console.error("Fehler beim Laden der Display-/Ranging-Daten:", error);
      setDisplayItems([]);
      setDealers([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dealerById = useMemo(() => {
    const map = new Map<number, Dealer>();
    dealers.forEach((dealer) => map.set(Number(dealer.dealer_id), dealer));
    return map;
  }, [dealers]);

  const rows = useMemo<DisplayRow[]>(() => {
    return displayItems.map((item) => ({
      ...item,
      dealer: dealerById.get(Number(item.dealer_id)) ?? null,
    }));
  }, [displayItems, dealerById]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          (row.status === "ordered" || row.status === "displayed")) ||
        row.status === statusFilter;

      const dealer = row.dealer;

      const matchesSearch =
        !q ||
        row.product_name_snapshot?.toLowerCase().includes(q) ||
        dealer?.name?.toLowerCase().includes(q) ||
        dealer?.login_nr?.toLowerCase().includes(q) ||
        dealer?.kam?.toLowerCase().includes(q) ||
        dealer?.city?.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [rows, search, statusFilter]);

  const productSummaries = useMemo<ProductSummary[]>(() => {
    const map = new Map<string, ProductSummary>();

    for (const row of filteredRows) {
      const productName =
        row.product_name_snapshot ||
        (row.product_id ? `Produkt #${row.product_id}` : `Display #${row.display_item_id}`);

      const productKey = row.product_id
        ? `product-${row.product_id}`
        : `name-${productName}`;

      const qty = Number(row.ordered_qty ?? 0);

      if (!map.has(productKey)) {
        map.set(productKey, {
          productKey,
          productId: row.product_id ?? null,
          productName,
          totalRows: 0,
          totalQty: 0,
          activeRows: 0,
          activeQty: 0,
          displayedRows: 0,
          displayedQty: 0,
          openRows: 0,
          openQty: 0,
          soldOrRemovedRows: 0,
          soldOrRemovedQty: 0,
          dealerCount: 0,
          rows: [],
        });
      }

      const item = map.get(productKey)!;

      item.totalRows += 1;
      item.totalQty += qty;
      item.rows.push(row);

      if (row.status === "ordered" || row.status === "displayed") {
        item.activeRows += 1;
        item.activeQty += qty;
      }

      if (row.status === "displayed") {
        item.displayedRows += 1;
        item.displayedQty += qty;
      }

      if (row.status === "ordered" || row.is_displayed == null || !row.display_checked_at) {
        item.openRows += 1;
        item.openQty += qty;
      }

      if (row.status === "sold_off" || row.status === "removed") {
        item.soldOrRemovedRows += 1;
        item.soldOrRemovedQty += qty;
      }
    }

    const result = [...map.values()].map((item) => ({
      ...item,
      dealerCount: new Set(item.rows.map((row) => row.dealer_id)).size,
      rows: [...item.rows].sort((a, b) =>
        (a.dealer?.name || "").localeCompare(b.dealer?.name || "", "de-CH")
      ),
    }));

    return result.sort((a, b) => {
      if (b.activeRows !== a.activeRows) return b.activeRows - a.activeRows;
      if (b.activeQty !== a.activeQty) return b.activeQty - a.activeQty;
      return a.productName.localeCompare(b.productName, "de-CH");
    });
  }, [filteredRows]);

  const totalActiveRows = rows.filter(
    (row) => row.status === "ordered" || row.status === "displayed"
  ).length;

  const totalActiveQty = rows
    .filter((row) => row.status === "ordered" || row.status === "displayed")
    .reduce((sum, row) => sum + Number(row.ordered_qty ?? 0), 0);

  const totalOpenRows = rows.filter(
    (row) => row.status === "ordered" || row.is_displayed == null || !row.display_checked_at
  ).length;

  const totalDisplayedRows = rows.filter((row) => row.status === "displayed").length;

  const totalProducts = productSummaries.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <MonitorSmartphone className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Display / Ranging Übersicht</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Übersicht nach Produkt: Welche Displays/Rangings sind aktiv und bei welchen Händlern stehen sie.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/dealers">
            <Button type="button" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zur Händlerübersicht
            </Button>
          </Link>

          <Button type="button" variant="outline" onClick={loadData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Aktive Displays"
          value={formatInteger(totalActiveRows)}
          subtitle={`Menge total: ${formatInteger(totalActiveQty)}`}
        />
        <StatCard
          title="Produkte / Rangings"
          value={formatInteger(totalProducts)}
          subtitle="nach Produkt gruppiert"
        />
        <StatCard
          title="Offen / ungeprüft"
          value={formatInteger(totalOpenRows)}
          subtitle="Status ordered oder nicht geprüft"
        />
        <StatCard
          title="Ausgestellt"
          value={formatInteger(totalDisplayedRows)}
          subtitle="Status displayed"
        />
      </div>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Produkt, Händler, Login, KAM oder Ort suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Nur aktive Displays</option>
            <option value="all">Alle Status</option>
            <option value="ordered">Nur bestellt / offen</option>
            <option value="displayed">Nur ausgestellt</option>
            <option value="not_displayed">Nur nicht ausgestellt</option>
            <option value="sold_off">Nur abverkauft</option>
            <option value="removed">Nur entfernt</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Display-/Ranging-Daten werden geladen...
          </div>
        ) : productSummaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Keine Display-/Ranging-Daten mit diesen Filtern vorhanden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Produkt / Ranging</th>
                  <th className="px-3 py-2 text-right">Aktiv</th>
                  <th className="px-3 py-2 text-right">Menge aktiv</th>
                  <th className="px-3 py-2 text-right">Ausgestellt</th>
                  <th className="px-3 py-2 text-right">Offen</th>
                  <th className="px-3 py-2 text-right">Händler</th>
                </tr>
              </thead>

              <tbody>
                {productSummaries.map((product) => {
                  const expanded = expandedProductKey === product.productKey;

                  return (
                    <Fragment key={product.productKey}>
                      <tr
                        onClick={() =>
                          setExpandedProductKey(expanded ? null : product.productKey)
                        }
                        className="cursor-pointer bg-gray-50 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <td className="rounded-l-xl px-3 py-3">
                          <div className="flex items-center gap-2">
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}

                            <div>
                              <div className="font-semibold text-gray-900">
                                {product.productName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.productId ? `Produkt-ID: ${product.productId}` : "ohne Produkt-ID"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-right font-semibold text-gray-900">
                          {formatInteger(product.activeRows)}
                        </td>

                        <td className="px-3 py-3 text-right">
                          {formatInteger(product.activeQty)}
                        </td>

                        <td className="px-3 py-3 text-right text-emerald-700">
                          {formatInteger(product.displayedRows)}
                        </td>

                        <td className="px-3 py-3 text-right text-amber-700">
                          {formatInteger(product.openRows)}
                        </td>

                        <td className="rounded-r-xl px-3 py-3 text-right">
                          {formatInteger(product.dealerCount)}
                        </td>
                      </tr>

                      {expanded && (
                        <tr key={`${product.productKey}-details`}>
                          <td colSpan={6} className="px-3 pb-4">
                            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-900">
                                <Store className="h-4 w-4" />
                                Händler mit diesem Display/Ranging
                              </div>

                              <div className="overflow-x-auto">
                                <table className="min-w-full">
                                  <thead>
                                    <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                      <th className="px-2 py-2">Händler</th>
                                      <th className="px-2 py-2">Login</th>
                                      <th className="px-2 py-2">KAM</th>
                                      <th className="px-2 py-2">Ort</th>
                                      <th className="px-2 py-2 text-right">Menge</th>
                                      <th className="px-2 py-2">Status</th>
                                      <th className="px-2 py-2">Geprüft</th>
                                      <th className="px-2 py-2 text-right">Aktion</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {product.rows.map((row) => (
                                      <tr
                                        key={row.display_item_id}
                                        className="border-t border-indigo-100 bg-white text-sm"
                                      >
                                        <td className="px-2 py-2 font-medium text-gray-900">
                                          {row.dealer?.name || `Dealer #${row.dealer_id}`}
                                        </td>

                                        <td className="px-2 py-2 text-gray-600">
                                          {row.dealer?.login_nr || "–"}
                                        </td>

                                        <td className="px-2 py-2 text-gray-600">
                                          {row.dealer?.kam || "–"}
                                        </td>

                                        <td className="px-2 py-2 text-gray-600">
                                          {row.dealer?.city || "–"}
                                        </td>

                                        <td className="px-2 py-2 text-right font-medium">
                                          {formatInteger(row.ordered_qty ?? 0)}
                                        </td>

                                        <td className="px-2 py-2">
                                          <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                                              row.status
                                            )}`}
                                          >
                                            {getStatusLabel(row.status)}
                                          </span>
                                        </td>

                                        <td className="px-2 py-2 text-gray-600">
                                          {formatDate(row.display_checked_at)}
                                        </td>

                                        <td className="px-2 py-2 text-right">
                                          <Link href={`/admin/dealers/${row.dealer_id}`}>
                                            <Button type="button" size="sm" variant="outline">
                                              Händlerakte
                                            </Button>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}