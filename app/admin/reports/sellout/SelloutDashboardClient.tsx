"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    BarChart3,
    Box,
    CalendarDays,
    ChevronLeft,
    Eye,
    Loader2,
    PackageSearch,
    RefreshCcw,
    Search,
    Store,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type WeekSummary = {
    sellout_year: number;
    sellout_week: number;
    sold_qty: number | null;
    sellout_revenue: number | null;
    latest_stock_qty: number | null;
    reporting_dealer_count: number | null;
    selling_dealer_count: number | null;
    product_count: number | null;
    avg_sellout_price: number | null;
    missing_price_qty: number | null;
    zero_price_qty: number | null;
    priced_qty: number | null;
    last_reported_at: string | null;
};

type DealerWeek = {
    sellout_year: number;
    sellout_week: number;
    dealer_id: number;
    dealer_name: string | null;
    login_nr: string | null;
    kam: string | null;
    city: string | null;
    customer_type: string | null;
    customer_classification: string | null;
    distribution: string | null;
    sold_qty: number | null;
    sellout_revenue: number | null;
    latest_stock_qty: number | null;
    product_count: number | null;
    active_product_count: number | null;
    missing_price_qty: number | null;
    zero_price_qty: number | null;
    priced_qty: number | null;
    last_reported_at: string | null;
};

type ProductWeek = {
    sellout_year: number;
    sellout_week: number;
    product_id: number | null;
    ean: string | null;
    sony_article: string | null;
    product_name: string | null;
    brand: string | null;
    gruppe: string | null;
    category: string | null;
    model: string | null;
    ph2: string | null;
    ph3: string | null;
    ph4: string | null;
    season: string | null;
    ci_group: string | null;
    sold_qty: number | null;
    sellout_revenue: number | null;
    latest_stock_qty: number | null;
    dealer_count: number | null;
    selling_dealer_count: number | null;
    avg_sellout_price: number | null;
    missing_price_qty: number | null;
    zero_price_qty: number | null;
    priced_qty: number | null;
    last_reported_at: string | null;
};

type ProductDealerWeek = {
    sellout_year: number;
    sellout_week: number;
    product_id: number | null;
    ean: string | null;
    sony_article: string | null;
    product_name: string | null;
    category: string | null;
    dealer_id: number;
    dealer_name: string | null;
    login_nr: string | null;
    city: string | null;
    sold_qty: number | null;
    sellout_revenue: number | null;
    latest_stock_qty: number | null;
    latest_stock_date: string | null;
    missing_price_qty: number | null;
    zero_price_qty: number | null;
    priced_qty: number | null;
    last_reported_at: string | null;
};

type TabMode = "dealers" | "products";

function formatCurrency(value: number | null | undefined) {
    const n = Number(value ?? 0);

    return n.toLocaleString("de-CH", {
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

function formatDateTime(value: string | null | undefined) {
    if (!value) return "–";

    return new Date(value).toLocaleString("de-CH", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function getCurrentIsoWeek() {
    const now = new Date();
    const date = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
        (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
    );

    return {
        year: date.getUTCFullYear(),
        week,
    };
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

export default function SelloutDashboardClient() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const dealerIdParam = searchParams.get("dealer_id");

    const tabParam = searchParams.get("tab");

    const currentWeek = useMemo(() => getCurrentIsoWeek(), []);

    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(currentWeek.year);
    const [selectedWeek, setSelectedWeek] = useState(currentWeek.week);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabMode>(
        tabParam === "products" ? "products" : "dealers"
    );
    const [summary, setSummary] = useState<WeekSummary | null>(null);
    const [dealers, setDealers] = useState<DealerWeek[]>([]);
    const [products, setProducts] = useState<ProductWeek[]>([]);

    const [selectedProduct, setSelectedProduct] = useState<ProductWeek | null>(
        null
    );
    const [productDealers, setProductDealers] = useState<ProductDealerWeek[]>([]);
    const [drilldownLoading, setDrilldownLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            let dealerQuery = supabase
                .from("v_sellout_by_dealer_week")
                .select("*")
                .eq("sellout_year", selectedYear)
                .eq("sellout_week", selectedWeek)
                .order("sellout_revenue", { ascending: false });

            let productsQuery: any = supabase
                .from("v_sellout_by_product_week")
                .select("*")
                .eq("sellout_year", selectedYear)
                .eq("sellout_week", selectedWeek)
                .order("sold_qty", { ascending: false });

            if (dealerIdParam) {
                dealerQuery = dealerQuery.eq("dealer_id", Number(dealerIdParam));

                productsQuery = supabase
                    .from("v_sellout_product_dealer_week")
                    .select("*")
                    .eq("sellout_year", selectedYear)
                    .eq("sellout_week", selectedWeek)
                    .eq("dealer_id", Number(dealerIdParam))
                    .order("sold_qty", { ascending: false });
            }

            const [summaryRes, dealersRes, productsRes] = await Promise.all([
                supabase
                    .from("v_sellout_week_summary")
                    .select("*")
                    .eq("sellout_year", selectedYear)
                    .eq("sellout_week", selectedWeek)
                    .maybeSingle(),

                dealerQuery,

                productsQuery,
            ]);

            if (summaryRes.error) throw summaryRes.error;
            if (dealersRes.error) throw dealersRes.error;
            if (productsRes.error) throw productsRes.error;

            setSummary((summaryRes.data ?? null) as WeekSummary | null);
            setDealers((dealersRes.data ?? []) as DealerWeek[]);
            setProducts((productsRes.data ?? []) as ProductWeek[]);
        } catch (error) {
            console.error("Sell-out Dashboard Fehler:", error);
        } finally {
            setLoading(false);
        }
    }, [supabase, selectedYear, selectedWeek, dealerIdParam]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (tabParam === "products") {
            setTab("products");
        }

        if (tabParam === "dealers") {
            setTab("dealers");
        }
    }, [tabParam]);

    const filteredDealers = useMemo(() => {
        const q = search.trim().toLowerCase();

        return dealers.filter((row) => {
            const matchesDealerParam =
                !dealerIdParam || Number(row.dealer_id) === Number(dealerIdParam);

            const matchesSearch =
                !q ||
                [
                    row.dealer_name,
                    row.login_nr,
                    row.city,
                    row.kam,
                    row.customer_type,
                    row.customer_classification,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));

            return matchesDealerParam && matchesSearch;
        });
    }, [dealers, search, dealerIdParam]);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();

        if (!q) return products;

        return products.filter((row) =>
            [
                row.product_name,
                row.sony_article,
                row.ean,
                row.model,
                row.category,
                row.gruppe,
                row.ph2,
                row.ph3,
                row.ph4,
            ]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q))
        );
    }, [products, search]);

    const openProductDrilldown = async (product: ProductWeek) => {
        setSelectedProduct(product);
        setProductDealers([]);
        setDrilldownLoading(true);

        try {
            let query = supabase
                .from("v_sellout_product_dealer_week")
                .select("*")
                .eq("sellout_year", selectedYear)
                .eq("sellout_week", selectedWeek)
                .order("sold_qty", { ascending: false });

            if (product.product_id) {
                query = query.eq("product_id", product.product_id);
            } else if (product.ean) {
                query = query.eq("ean", product.ean);
            } else if (product.sony_article) {
                query = query.eq("sony_article", product.sony_article);
            }

            const res = await query;

            if (res.error) throw res.error;

            setProductDealers((res.data ?? []) as ProductDealerWeek[]);
        } catch (error) {
            console.error("Sell-out Drilldown Fehler:", error);
        } finally {
            setDrilldownLoading(false);
        }
    };

    const hasZeroPriceSales = Number(summary?.zero_price_qty ?? 0) > 0;

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
                        <BarChart3 className="h-6 w-6 text-green-600" />
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Sell-out Dashboard
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Verkäufe, Umsatz, Lagerbestand und Drilldown nach Händler und
                        Produkt.
                    </p>
                </div>

                <Button type="button" variant="outline" onClick={loadData}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Aktualisieren
                </Button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Jahr
                        </label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Kalenderwoche
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={53}
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div className="relative md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Suche
                        </label>
                        <Search className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Händler, Produkt, EAN, Modell, Kategorie..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>
            {dealerIdParam ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Händlerfilter aktiv: Dealer ID {dealerIdParam}
                </div>
            ) : null}
            {loading ? (
                <div className="flex items-center gap-2 rounded-xl border bg-white p-5 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sell-out Daten werden geladen...
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                        <StatCard
                            title="Verkaufte Stück"
                            value={formatInteger(summary?.sold_qty)}
                            subtitle={`KW ${selectedWeek} / ${selectedYear}`}
                        />
                        <StatCard
                            title="Sell-out Umsatz"
                            value={formatCurrency(summary?.sellout_revenue)}
                            subtitle="gemeldete VK-Preise"
                        />
                        <StatCard
                            title="Lagerbestand"
                            value={formatInteger(summary?.latest_stock_qty)}
                            subtitle="neuester Snapshot"
                        />
                        <StatCard
                            title="Meldende Händler"
                            value={formatInteger(summary?.reporting_dealer_count)}
                            subtitle={`${formatInteger(summary?.selling_dealer_count)} mit Verkauf`}
                        />
                        <StatCard
                            title="Produkte"
                            value={formatInteger(summary?.product_count)}
                            subtitle="mit Meldung"
                        />
                        <StatCard
                            title="Preisqualität"
                            value={`${formatInteger(summary?.priced_qty)} / ${formatInteger(
                                summary?.sold_qty
                            )}`}
                            subtitle={`${formatInteger(summary?.zero_price_qty)} Stk. ohne Preis`}
                        />
                    </div>

                    {hasZeroPriceSales ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            ⚠️ Einige Verkäufe wurden ohne Verkaufspreis oder mit CHF 0
                            gemeldet. Stückzahlen und Lager sind nutzbar, der Umsatz kann aber
                            unvollständig sein.
                        </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={tab === "dealers" ? "default" : "outline"}
                            onClick={() => setTab("dealers")}
                        >
                            <Store className="mr-2 h-4 w-4" />
                            Händler
                        </Button>

                        <Button
                            type="button"
                            variant={tab === "products" ? "default" : "outline"}
                            onClick={() => setTab("products")}
                        >
                            <PackageSearch className="mr-2 h-4 w-4" />
                            Produkte
                        </Button>
                    </div>

                    {tab === "dealers" ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Händlerauswertung
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th className="px-3 py-2">Händler</th>
                                            <th className="px-3 py-2">Ort</th>
                                            <th className="px-3 py-2">Stück</th>
                                            <th className="px-3 py-2">Umsatz</th>
                                            <th className="px-3 py-2">Lager</th>
                                            <th className="px-3 py-2">Produkte</th>
                                            <th className="px-3 py-2">Letzte Meldung</th>
                                            <th className="px-3 py-2">Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredDealers.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-3 py-6 text-sm text-gray-500">
                                                    Keine Händlerdaten für diese Auswahl.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDealers.map((row) => (
                                                <tr
                                                    key={`${row.sellout_year}-${row.sellout_week}-${row.dealer_id}`}
                                                    className="bg-gray-50 text-sm"
                                                >
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {row.dealer_name || `Dealer #${row.dealer_id}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {row.dealer_id} · Login: {row.login_nr || "–"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.customer_type || "–"} · Klasse{" "}
                                                            {row.customer_classification || "–"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">{row.city || "–"}</td>
                                                    <td className="px-3 py-3 font-semibold">
                                                        {formatInteger(row.sold_qty)}
                                                        {Number(row.zero_price_qty ?? 0) > 0 ? (
                                                            <div className="mt-1 text-xs font-medium text-amber-700">
                                                                {formatInteger(row.zero_price_qty)} Stk. ohne
                                                                Preis
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold">
                                                        {formatCurrency(row.sellout_revenue)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatInteger(row.latest_stock_qty)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatInteger(row.product_count)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatDateTime(row.last_reported_at)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Link href={`/admin/dealers/${row.dealer_id}`}>
                                                            <Button type="button" size="sm" variant="outline">
                                                                Händler öffnen
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Box className="h-5 w-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Produktauswertung
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th className="px-3 py-2">Produkt</th>
                                            <th className="px-3 py-2">Kategorie</th>
                                            <th className="px-3 py-2">Stück</th>
                                            <th className="px-3 py-2">Umsatz</th>
                                            <th className="px-3 py-2">Lager</th>
                                            <th className="px-3 py-2">Händler</th>
                                            <th className="px-3 py-2">Ø Preis</th>
                                            <th className="px-3 py-2">Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-3 py-6 text-sm text-gray-500">
                                                    Keine Produktdaten für diese Auswahl.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((row) => (
                                                <tr
                                                    key={`${row.sellout_year}-${row.sellout_week}-${row.product_id ?? row.ean ?? row.sony_article
                                                        }`}
                                                    className="bg-gray-50 text-sm"
                                                >
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {row.sony_article || row.product_name || "–"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            EAN: {row.ean || "–"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Modell: {row.model || "–"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <div>{row.category || "–"}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.ph2 || "–"} / {row.ph3 || "–"} /{" "}
                                                            {row.ph4 || "–"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold">
                                                        {formatInteger(row.sold_qty)}
                                                        {Number(row.zero_price_qty ?? 0) > 0 ? (
                                                            <div className="mt-1 text-xs font-medium text-amber-700">
                                                                {formatInteger(row.zero_price_qty)} Stk. ohne
                                                                Preis
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-3 font-semibold">
                                                        {formatCurrency(row.sellout_revenue)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatInteger(row.latest_stock_qty)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {dealerIdParam
                                                            ? "1 / 1"
                                                            : `${formatInteger(row.selling_dealer_count)} / ${formatInteger(row.dealer_count)}`}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatCurrency(row.avg_sellout_price)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openProductDrilldown(row)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Händler anzeigen
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedProduct ? (
                <div className="fixed inset-0 z-[90] flex justify-end bg-black/30">
                    <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <PackageSearch className="h-5 w-5 text-green-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {selectedProduct.sony_article || selectedProduct.product_name}
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    KW {selectedWeek} / {selectedYear} · EAN{" "}
                                    {selectedProduct.ean || "–"}
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setProductDealers([]);
                                }}
                            >
                                Schließen
                            </Button>
                        </div>

                        {drilldownLoading ? (
                            <div className="flex items-center gap-2 rounded-xl border p-4 text-sm text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Händler werden geladen...
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th className="px-3 py-2">Händler</th>
                                            <th className="px-3 py-2">Ort</th>
                                            <th className="px-3 py-2">Stück</th>
                                            <th className="px-3 py-2">Umsatz</th>
                                            <th className="px-3 py-2">Lager</th>
                                            <th className="px-3 py-2">Lagerdatum</th>
                                            <th className="px-3 py-2">Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {productDealers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="px-3 py-6 text-sm text-gray-500">
                                                    Keine Händlerdaten zu diesem Produkt.
                                                </td>
                                            </tr>
                                        ) : (
                                            productDealers.map((row) => (
                                                <tr
                                                    key={`${row.dealer_id}-${row.product_id ?? row.ean}`}
                                                    className="bg-gray-50 text-sm"
                                                >
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {row.dealer_name || `Dealer #${row.dealer_id}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Login: {row.login_nr || "–"}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3">{row.city || "–"}</td>
                                                    <td className="px-3 py-3 font-semibold">
                                                        {formatInteger(row.sold_qty)}
                                                        {Number(row.zero_price_qty ?? 0) > 0 ? (
                                                            <div className="mt-1 text-xs font-medium text-amber-700">
                                                                {formatInteger(row.zero_price_qty)} Stk. ohne
                                                                Preis
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatCurrency(row.sellout_revenue)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatInteger(row.latest_stock_qty)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {row.latest_stock_date
                                                            ? new Date(row.latest_stock_date).toLocaleDateString(
                                                                "de-CH"
                                                            )
                                                            : "–"}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Link href={`/admin/dealers/${row.dealer_id}`}>
                                                            <Button type="button" size="sm" variant="outline">
                                                                Händlerakte
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            <CalendarDays className="mr-1 inline h-4 w-4" />
                            Lagerbestand ist ein Snapshot. Es wird der zuletzt gemeldete
                            Lagerwert pro Händler und Produkt angezeigt.
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}