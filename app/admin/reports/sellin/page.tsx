"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  PackageSearch,
  RefreshCcw,
  Search,
  Store,
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SellinProductTotal = {
  product_id: number | null;
  sony_article: string | null;
  product_name: string | null;
  ean: string | null;

  position_count: number | null;
  order_count: number | null;
  total_quantity: number | null;
  total_revenue: number | null;
  unique_dealer_count: number | null;

  standard_quantity: number | null;
  display_quantity: number | null;
  messe_quantity: number | null;

  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;

  first_order_date: string | null;
  last_order_date: string | null;
};

type SellinDashboardTotals = {
  product_count: number | null;
  position_count: number | null;
  order_count: number | null;
  dealer_count: number | null;
  total_quantity: number | null;
  total_revenue: number | null;
  standard_quantity: number | null;
  display_quantity: number | null;
  messe_quantity: number | null;
};

type SellinDealerTotal = {
  dealer_id: number | null;
  dealer_name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;

  position_count: number | null;
  order_count: number | null;
  total_quantity: number | null;
  total_revenue: number | null;

  standard_quantity: number | null;
  display_quantity: number | null;
  messe_quantity: number | null;

  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;

  first_order_date: string | null;
  last_order_date: string | null;
};

type SellinOrderDetail = {
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
  order_number: string | null;

  created_at: string | null;
  order_date: string | null;
};

type DealerOption = {
  dealer_id: number;
  name: string | null;
  login_nr: string | null;
};

type AppliedFilters = {
  fromDate: string;
  toDate: string;
  mode: string;
  dealerId: string;
  search: string;
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

function formatDecimal(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";

  return new Date(`${value}T00:00:00`).toLocaleDateString("de-CH");
}

function getProductLabel(product: SellinProductTotal) {
  return (
    product.sony_article ||
    product.product_name ||
    product.ean ||
    `Produkt #${product.product_id ?? "-"}`
  );
}

function getProductKey(product: SellinProductTotal) {
  return (
    product.product_id?.toString() ||
    product.ean ||
    product.sony_article ||
    product.product_name ||
    "unknown-product"
  );
}

function getModeLabel(mode: string | null | undefined) {
  if (mode === "display") return "Display";
  if (mode === "messe") return "Messe";
  return "Standard";
}

function getModeClass(mode: string | null | undefined) {
  if (mode === "display") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (mode === "messe") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-700";
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

      <div className="mt-2 break-words text-xl font-semibold text-gray-900 2xl:text-2xl">
        {value}
      </div>

      {subtitle ? (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      ) : null}
    </div>
  );
}

function ModeBreakdown({
  standard,
  display,
  messe,
}: {
  standard: number | null | undefined;
  display: number | null | undefined;
  messe: number | null | undefined;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
        S {formatInteger(standard)}
      </span>

      <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
        D {formatInteger(display)}
      </span>

      <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
        M {formatInteger(messe)}
      </span>
    </div>
  );
}

export default function SellinReportsPage() {
  const supabase = useMemo(() => createClient(), []);

  const today = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState(yearStart);
  const [toDate, setToDate] = useState(today);
  const [modeFilter, setModeFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    fromDate: yearStart,
    toDate: today,
    mode: "all",
    dealerId: "all",
    search: "",
  });

  const [dealerOptions, setDealerOptions] = useState<DealerOption[]>([]);

  const [products, setProducts] = useState<SellinProductTotal[]>([]);
  const [dashboardTotals, setDashboardTotals] =
    useState<SellinDashboardTotals | null>(null);
  const [dealerTotals, setDealerTotals] = useState<SellinDealerTotal[]>([]);
  const [orderDetails, setOrderDetails] = useState<SellinOrderDetail[]>([]);

  const [selectedProduct, setSelectedProduct] =
    useState<SellinProductTotal | null>(null);

    

  const [selectedDealer, setSelectedDealer] =
    useState<SellinDealerTotal | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadDealerOptions = useCallback(async () => {
    const { data, error } = await supabase
      .from("dealers")
      .select("dealer_id, name, login_nr")
      .order("name", { ascending: true });

    if (error) {
      console.error("Händleroptionen laden:", error);
      setDealerOptions([]);
      return;
    }

    setDealerOptions((data ?? []) as DealerOption[]);
  }, [supabase]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setSelectedProduct(null);
    setSelectedDealer(null);
    setDealerTotals([]);
    setOrderDetails([]);
    setDashboardTotals(null);

    try {
      const rpcParams = {
        p_from: appliedFilters.fromDate,
        p_to: appliedFilters.toDate,
        p_mode:
          appliedFilters.mode === "all"
            ? null
            : appliedFilters.mode,
        p_dealer_id:
          appliedFilters.dealerId === "all"
            ? null
            : Number(appliedFilters.dealerId),
        p_search: appliedFilters.search.trim() || null,
      };

      const [productsResult, totalsResult] = await Promise.all([
        supabase.rpc("get_sellin_product_totals", rpcParams),
        supabase.rpc("get_sellin_dashboard_totals", rpcParams),
      ]);

      if (productsResult.error) throw productsResult.error;
      if (totalsResult.error) throw totalsResult.error;

      setProducts(
        (productsResult.data ?? []) as SellinProductTotal[]
      );

      setDashboardTotals(
        ((totalsResult.data ?? [])[0] ??
          null) as SellinDashboardTotals | null
      );
    } catch (error) {
      console.error("Sell-in Produktdaten laden:", error);
      setProducts([]);
      setDashboardTotals(null);
    } finally {
      setLoadingProducts(false);
    }
  }, [supabase, appliedFilters]);

  useEffect(() => {
    loadDealerOptions();
  }, [loadDealerOptions]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openProduct = async (product: SellinProductTotal) => {
    const clickedKey = getProductKey(product);
    const selectedKey = selectedProduct
      ? getProductKey(selectedProduct)
      : null;

    if (clickedKey === selectedKey) {
      setSelectedProduct(null);
      setSelectedDealer(null);
      setDealerTotals([]);
      setOrderDetails([]);
      return;
    }

    setSelectedProduct(product);
    setSelectedDealer(null);
    setDealerTotals([]);
    setOrderDetails([]);
    setLoadingDealers(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_sellin_product_dealer_totals",
        {
          p_from: appliedFilters.fromDate,
          p_to: appliedFilters.toDate,
          p_product_id: product.product_id,
          p_ean: product.product_id ? null : product.ean,
          p_mode:
            appliedFilters.mode === "all"
              ? null
              : appliedFilters.mode,
          p_dealer_id:
            appliedFilters.dealerId === "all"
              ? null
              : Number(appliedFilters.dealerId),
        }
      );

      if (error) throw error;

      setDealerTotals((data ?? []) as SellinDealerTotal[]);
    } catch (error) {
      console.error("Sell-in Händlerdaten laden:", error);
      setDealerTotals([]);
    } finally {
      setLoadingDealers(false);
    }
  };

  const openDealer = async (dealer: SellinDealerTotal) => {
    if (!selectedProduct || !dealer.dealer_id) return;

    if (selectedDealer?.dealer_id === dealer.dealer_id) {
      setSelectedDealer(null);
      setOrderDetails([]);
      return;
    }

    setSelectedDealer(dealer);
    setOrderDetails([]);
    setLoadingOrders(true);

    try {
      const { data, error } = await supabase.rpc(
        "get_sellin_order_details",
        {
          p_from: appliedFilters.fromDate,
          p_to: appliedFilters.toDate,
          p_product_id: selectedProduct.product_id,
          p_ean: selectedProduct.product_id
            ? null
            : selectedProduct.ean,
          p_dealer_id: dealer.dealer_id,
          p_mode:
            appliedFilters.mode === "all"
              ? null
              : appliedFilters.mode,
        }
      );

      if (error) throw error;

      setOrderDetails((data ?? []) as SellinOrderDetail[]);
    } catch (error) {
      console.error("Sell-in Bestelldetails laden:", error);
      setOrderDetails([]);
    } finally {
      setLoadingOrders(false);
    }
  };

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
      fromDate,
      toDate,
      mode: modeFilter,
      dealerId: dealerFilter,
      search: search.trim(),
    });
  };

  const resetFilters = () => {
    setFromDate(yearStart);
    setToDate(today);
    setModeFilter("all");
    setDealerFilter("all");
    setSearch("");

    setAppliedFilters({
      fromDate: yearStart,
      toDate: today,
      mode: "all",
      dealerId: "all",
      search: "",
    });
  };

  const exportProductsCsv = () => {
    const header = [
      "Produkt",
      "Produktname",
      "EAN",
      "Menge Total",
      "Standard",
      "Display",
      "Messe",
      "Umsatz",
      "Händler",
      "Bestellungen",
      "Positionen",
      "Durchschnittspreis",
      "Min Preis",
      "Max Preis",
      "Erste Bestellung",
      "Letzte Bestellung",
    ];

    const rows = products.map((row) => [
      row.sony_article ?? "",
      row.product_name ?? "",
      row.ean ? `="${row.ean}"` : "",
      row.total_quantity ?? 0,
      row.standard_quantity ?? 0,
      row.display_quantity ?? 0,
      row.messe_quantity ?? 0,
      row.total_revenue ?? 0,
      row.unique_dealer_count ?? 0,
      row.order_count ?? 0,
      row.position_count ?? 0,
      row.avg_price ?? 0,
      row.min_price ?? 0,
      row.max_price ?? 0,
      row.first_order_date ?? "",
      row.last_order_date ?? "",
    ]);

    downloadCsv(
      header,
      rows,
      `sellin_produkte_${appliedFilters.fromDate}_${appliedFilters.toDate}.csv`
    );
  };

  const exportDealersCsv = () => {
    if (!selectedProduct) return;

    const header = [
      "Produkt",
      "EAN",
      "Händler",
      "Login",
      "KAM",
      "Ort",
      "Menge Total",
      "Standard",
      "Display",
      "Messe",
      "Umsatz",
      "Bestellungen",
      "Positionen",
      "Durchschnittspreis",
      "Erste Bestellung",
      "Letzte Bestellung",
    ];

    const rows = dealerTotals.map((row) => [
      getProductLabel(selectedProduct),
      selectedProduct.ean ? `="${selectedProduct.ean}"` : "",
      row.dealer_name ?? "",
      row.login_nr ?? "",
      row.kam ?? "",
      row.city ?? "",
      row.total_quantity ?? 0,
      row.standard_quantity ?? 0,
      row.display_quantity ?? 0,
      row.messe_quantity ?? 0,
      row.total_revenue ?? 0,
      row.order_count ?? 0,
      row.position_count ?? 0,
      row.avg_price ?? 0,
      row.first_order_date ?? "",
      row.last_order_date ?? "",
    ]);

    downloadCsv(
      header,
      rows,
      `sellin_haendler_${getProductLabel(selectedProduct)}_${appliedFilters.fromDate}_${appliedFilters.toDate}.csv`
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
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
            Produkte total analysieren und nach Händler sowie Bestellung
            aufschlüsseln.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadProducts}
            disabled={loadingProducts}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${
                loadingProducts ? "animate-spin" : ""
              }`}
            />
            Aktualisieren
          </Button>

          <Button
            type="button"
            onClick={exportProductsCsv}
            disabled={!products.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Produkte CSV
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={exportDealersCsv}
            disabled={!selectedProduct || !dealerTotals.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Händler CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Von
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Kondition
            </label>

            <select
              value={modeFilter}
              onChange={(event) => setModeFilter(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Alle Konditionen</option>
              <option value="standard">Standard</option>
              <option value="display">Display</option>
              <option value="messe">Messe</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Händler
            </label>

            <select
              value={dealerFilter}
              onChange={(event) => setDealerFilter(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">Alle Händler</option>

              {dealerOptions.map((dealer) => (
                <option
                  key={dealer.dealer_id}
                  value={String(dealer.dealer_id)}
                >
                  {dealer.name || `Dealer #${dealer.dealer_id}`}
                  {dealer.login_nr ? ` · ${dealer.login_nr}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="relative lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Produkt
            </label>

            <Search className="absolute left-3 top-8 h-4 w-4 text-gray-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              placeholder="Produkt, Artikel oder EAN"
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetFilters}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Zurücksetzen
          </Button>

          <Button type="button" onClick={applyFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Filter anwenden
          </Button>
        </div>
      </Card>

      {loadingProducts ? (
        <Card className="rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sell-in-Daten werden geladen…
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-10">
            <StatCard
              title="Produkte"
              value={formatInteger(dashboardTotals?.product_count)}
            />

            <StatCard
              title="Menge total"
              value={formatInteger(dashboardTotals?.total_quantity)}
            />

            <div className="xl:col-span-2">
              <StatCard
                title="Umsatz"
                value={formatCurrency(dashboardTotals?.total_revenue)}
              />
            </div>

            <StatCard
              title="Händler"
              value={formatInteger(dashboardTotals?.dealer_count)}
            />

            <StatCard
              title="Bestellungen"
              value={formatInteger(dashboardTotals?.order_count)}
            />

            <StatCard
              title="Positionen"
              value={formatInteger(dashboardTotals?.position_count)}
            />

            <StatCard
              title="Standard"
              value={formatInteger(dashboardTotals?.standard_quantity)}
            />

            <StatCard
              title="Display"
              value={formatInteger(dashboardTotals?.display_quantity)}
            />

            <StatCard
              title="Messe"
              value={formatInteger(dashboardTotals?.messe_quantity)}
            />
          </div>

          <Card className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">
                  Produkte total
                </h2>
                <span className="text-sm text-gray-500">
                  ({products.length})
                </span>
              </div>

              <div className="text-xs text-gray-500">
                {formatDate(appliedFilters.fromDate)} bis{" "}
                {formatDate(appliedFilters.toDate)}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="w-10 px-3 py-3" />
                    <th className="px-4 py-3 text-left">Produkt</th>
                    <th className="px-4 py-3 text-left">EAN</th>
                    <th className="px-4 py-3 text-right">
                      Menge total
                    </th>
                    <th className="px-4 py-3 text-right">Umsatz</th>
                    <th className="px-4 py-3 text-right">Händler</th>
                    <th className="px-4 py-3 text-right">
                      Konditionsmix
                    </th>
                    <th className="px-4 py-3 text-right">Ø Preis</th>
                    <th className="px-4 py-3 text-left">
                      Letzte Bestellung
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => {
                    const key = getProductKey(product);
                    const isSelected =
                      selectedProduct !== null &&
                      getProductKey(selectedProduct) === key;

                    return (
                      <Fragment key={key}>
                        <tr
                          onClick={() => openProduct(product)}
                          className={`cursor-pointer transition hover:bg-blue-50 ${
                            isSelected ? "bg-blue-50" : "bg-white"
                          }`}
                        >
                          <td className="px-3 py-3 text-center">
                            {isSelected ? (
                              <ChevronDown className="h-4 w-4 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {product.sony_article || "–"}
                            </div>

                            {product.product_name !==
                            product.sony_article ? (
                              <div className="text-xs text-gray-500">
                                {product.product_name || "–"}
                              </div>
                            ) : null}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {product.ean || "–"}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold">
                            {formatInteger(product.total_quantity)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(product.total_revenue)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatInteger(
                              product.unique_dealer_count
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <ModeBreakdown
                              standard={product.standard_quantity}
                              display={product.display_quantity}
                              messe={product.messe_quantity}
                            />
                          </td>

                          <td className="px-4 py-3 text-right">
                            {formatCurrency(product.avg_price)}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(product.last_order_date)}
                          </td>
                        </tr>

                        {isSelected ? (
                          <tr className="bg-blue-50/40">
                            <td colSpan={9} className="p-4">
                              <ProductDealerSection
                                product={product}
                                dealers={dealerTotals}
                                selectedDealer={selectedDealer}
                                orders={orderDetails}
                                loadingDealers={loadingDealers}
                                loadingOrders={loadingOrders}
                                onDealerClick={openDealer}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}

                  {!products.length ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-10 text-center text-gray-500"
                      >
                        Keine Sell-in-Daten für die gewählten Filter
                        gefunden.
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

function ProductDealerSection({
  product,
  dealers,
  selectedDealer,
  orders,
  loadingDealers,
  loadingOrders,
  onDealerClick,
}: {
  product: SellinProductTotal;
  dealers: SellinDealerTotal[];
  selectedDealer: SellinDealerTotal | null;
  orders: SellinOrderDetail[];
  loadingDealers: boolean;
  loadingOrders: boolean;
  onDealerClick: (dealer: SellinDealerTotal) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
      <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-600" />

          <div>
            <div className="font-semibold text-gray-900">
              Händler: {getProductLabel(product)}
            </div>

            <div className="mt-0.5 text-xs text-gray-500">
              {formatInteger(product.total_quantity)} Stück ·{" "}
              {formatInteger(product.unique_dealer_count)} Händler ·{" "}
              {formatCurrency(product.total_revenue)}
            </div>
          </div>
        </div>
      </div>

      {loadingDealers ? (
        <div className="flex items-center gap-2 p-5 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Händlerdaten werden geladen…
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3 text-left">Händler</th>
                <th className="px-4 py-3 text-left">KAM</th>
                <th className="px-4 py-3 text-right">Menge</th>
                <th className="px-4 py-3 text-right">Umsatz</th>
                <th className="px-4 py-3 text-right">
                  Konditionsmix
                </th>
                <th className="px-4 py-3 text-right">
                  Bestellungen
                </th>
                <th className="px-4 py-3 text-left">
                  Letzte Bestellung
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {dealers.map((dealer) => {
                const isSelected =
                  selectedDealer?.dealer_id === dealer.dealer_id;

                return (
                  <Fragment
                    key={dealer.dealer_id ?? dealer.login_nr ?? "dealer"}
                  >
                    <tr
                      onClick={() => onDealerClick(dealer)}
                      className={`cursor-pointer hover:bg-gray-50 ${
                        isSelected ? "bg-gray-50" : ""
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        {isSelected ? (
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {dealer.dealer_name ||
                            `Dealer #${dealer.dealer_id ?? "-"}`}
                        </div>

                        <div className="text-xs text-gray-500">
                          {dealer.login_nr || "–"} ·{" "}
                          {dealer.city || "–"}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {dealer.kam || "–"}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {formatInteger(dealer.total_quantity)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatCurrency(dealer.total_revenue)}
                      </td>

                      <td className="px-4 py-3">
                        <ModeBreakdown
                          standard={dealer.standard_quantity}
                          display={dealer.display_quantity}
                          messe={dealer.messe_quantity}
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        {formatInteger(dealer.order_count)}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(dealer.last_order_date)}
                      </td>
                    </tr>

                    {isSelected ? (
                      <tr className="bg-gray-50/70">
                        <td colSpan={8} className="p-4">
                          <OrderDetailsTable
                            orders={orders}
                            loading={loadingOrders}
                          />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}

              {!dealers.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Keine Händler für dieses Produkt gefunden.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderDetailsTable({
  orders,
  loading,
}: {
  orders: SellinOrderDetail[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border bg-white p-5 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Bestelldetails werden geladen…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800">
        Einzelbestellungen
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Datum</th>
              <th className="px-4 py-3 text-left">Kondition</th>
              <th className="px-4 py-3 text-right">Menge</th>
              <th className="px-4 py-3 text-right">Preis</th>
              <th className="px-4 py-3 text-right">Umsatz</th>
              <th className="px-4 py-3 text-right">Invest</th>
              <th className="px-4 py-3 text-left">Distributor</th>
              <th className="px-4 py-3 text-left">Referenz</th>
              <th className="px-4 py-3 text-right">
                Bestell-ID
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.item_id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {formatDate(order.order_date)}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getModeClass(
                      order.sellin_mode
                    )}`}
                  >
                    {getModeLabel(order.sellin_mode)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right font-medium">
                  {formatInteger(order.menge)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(order.preis)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(order.umsatz)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(order.total_invest)}
                </td>

                <td className="px-4 py-3">
                  {order.distributor || "–"}
                </td>

                <td className="px-4 py-3">
                  {order.dealer_reference ||
                    order.order_number ||
                    "–"}
                </td>

                <td className="px-4 py-3 text-right">
                  {order.submission_id}
                </td>
              </tr>
            ))}

            {!orders.length ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  Keine Bestelldetails gefunden.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function downloadCsv(
  header: string[],
  rows: Array<Array<string | number>>,
  filename: string
) {
  const lines = rows.map((row) =>
    row
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(";")
  );

  const csv = ["\uFEFF" + header.join(";"), ...lines].join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();

  setTimeout(() => URL.revokeObjectURL(anchor.href), 3000);
}
