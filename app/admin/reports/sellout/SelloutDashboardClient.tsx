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
    avg_sellout_price: number | null;
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
    dealer_id: number;
    dealer_name: string | null;
    login_nr: string | null;
    kam: string | null;
    city: string | null;
    customer_type: string | null;
    customer_classification: string | null;
    distribution: string | null;
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
    latest_stock_date: string | null;
    missing_price_qty: number | null;
    zero_price_qty: number | null;
    priced_qty: number | null;
    avg_sellout_price: number | null;
    last_reported_at: string | null;
    item_rows?: number | null;
};

type SelloutPriceIssue = {
    item_id: number;
    submission_id: number;
    sellout_year: number;
    sellout_week: number;
    dealer_id: number;
    dealer_name: string | null;
    login_nr: string | null;
    kam: string | null;
    city: string | null;
    product_id: number | null;
    ean: string | null;
    sony_article: string | null;
    product_name: string | null;
    gruppe: string | null;
    category: string | null;
    model: string | null;
    sold_qty: number | null;
    sellout_price: number | null;
    sellout_revenue: number | null;
    stock_qty: number | null;
    stock_date: string | null;
    submission_source: string | null;
    item_source: string | null;
    status: string | null;
    typ: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type AggregatedData = {
    summary: WeekSummary;
    dealers: DealerWeek[];
    products: ProductWeek[];
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

function formatDecimal(value: number | null | undefined) {
    return Number(value ?? 0).toLocaleString("de-CH", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    });
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return "–";

    return new Date(value).toLocaleString("de-CH", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function formatPercent(value: number | null | undefined) {
    if (value === null || value === undefined || !Number.isFinite(value)) {
        return "–";
    }

    return `${value > 0 ? "+" : ""}${value.toLocaleString("de-CH", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

function getCurrentIsoWeek() {
    const now = new Date();
    const date = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
        ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );

    return {
        year: date.getUTCFullYear(),
        week,
    };
}

function isLeapYear(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function getIsoWeeksInYear(year: number) {
    const date = new Date(Date.UTC(year, 11, 31));
    const day = date.getUTCDay();

    if (day === 4 || (day === 5 && isLeapYear(year))) {
        return 53;
    }

    return 52;
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

function getDealerProductKey(row: ProductDealerWeek) {
    return `${row.dealer_id}-${getProductKey(row)}`;
}

function getWeekIndex(row: { sellout_year: number; sellout_week: number }) {
    return row.sellout_year * 100 + row.sellout_week;
}

function isNewerStockRow(
    candidate: ProductDealerWeek,
    current: ProductDealerWeek | undefined
) {
    if (!current) return true;

    const candidateWeek = getWeekIndex(candidate);
    const currentWeek = getWeekIndex(current);

    if (candidateWeek !== currentWeek) {
        return candidateWeek > currentWeek;
    }

    const candidateDate = candidate.latest_stock_date
        ? new Date(candidate.latest_stock_date).getTime()
        : 0;
    const currentDate = current.latest_stock_date
        ? new Date(current.latest_stock_date).getTime()
        : 0;

    if (candidateDate !== currentDate) {
        return candidateDate > currentDate;
    }

    const candidateReported = candidate.last_reported_at
        ? new Date(candidate.last_reported_at).getTime()
        : 0;
    const currentReported = current.last_reported_at
        ? new Date(current.last_reported_at).getTime()
        : 0;

    return candidateReported > currentReported;
}

function maxDateString(values: Array<string | null | undefined>) {
    const dates = values.filter(Boolean) as string[];

    if (dates.length === 0) return null;

    return dates.sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    )[0];
}

function getChangePercent(current: number, previous: number) {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return ((current - previous) / previous) * 100;
}

function getComparisonText(
    current: number,
    previous: number | null | undefined,
    formatter: (value: number) => string
) {
    if (previous === null || previous === undefined) {
        return "VJ: keine Daten";
    }

    if (previous === 0 && current !== 0) {
        return `VJ: ${formatter(previous)} · Diff: n/a`;
    }

    const diff = current - previous;
    const percent = getChangePercent(current, previous);

    return `VJ: ${formatter(previous)} · Diff: ${diff > 0 ? "+" : ""}${formatter(
        diff
    )} / ${formatPercent(percent)}`;
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

function aggregateSelloutRows(
    rows: ProductDealerWeek[],
    periodYear: number,
    periodWeekTo: number
): AggregatedData {
    const productMap = new Map<
        string,
        ProductWeek & {
            dealerIds: Set<number>;
            sellingDealerIds: Set<number>;
            latestStockRows: Map<number, ProductDealerWeek>;
        }
    >();

    const dealerMap = new Map<
        number,
        DealerWeek & {
            productKeys: Set<string>;
            activeProductKeys: Set<string>;
            latestStockRows: Map<string, ProductDealerWeek>;
        }
    >();

    const summaryDealerIds = new Set<number>();
    const summarySellingDealerIds = new Set<number>();
    const summaryProductKeys = new Set<string>();
    const summaryLatestStockRows = new Map<string, ProductDealerWeek>();

    let summarySoldQty = 0;
    let summaryRevenue = 0;
    let summaryMissingPriceQty = 0;
    let summaryZeroPriceQty = 0;
    let summaryPricedQty = 0;

    rows.forEach((row) => {
        const productKey = getProductKey(row);
        const dealerProductKey = getDealerProductKey(row);
        const soldQty = Number(row.sold_qty ?? 0);
        const revenue = Number(row.sellout_revenue ?? 0);
        const missingPriceQty = Number(row.missing_price_qty ?? 0);
        const zeroPriceQty = Number(row.zero_price_qty ?? 0);
        const pricedQty = Number(row.priced_qty ?? 0);

        summarySoldQty += soldQty;
        summaryRevenue += revenue;
        summaryMissingPriceQty += missingPriceQty;
        summaryZeroPriceQty += zeroPriceQty;
        summaryPricedQty += pricedQty;
        summaryDealerIds.add(row.dealer_id);
        summaryProductKeys.add(productKey);

        if (soldQty > 0) {
            summarySellingDealerIds.add(row.dealer_id);
        }

        const currentSummaryStockRow = summaryLatestStockRows.get(dealerProductKey);

        if (isNewerStockRow(row, currentSummaryStockRow)) {
            summaryLatestStockRows.set(dealerProductKey, row);
        }

        const currentProduct = productMap.get(productKey);

        if (!currentProduct) {
            productMap.set(productKey, {
                sellout_year: periodYear,
                sellout_week: periodWeekTo,
                product_id: row.product_id,
                ean: row.ean,
                sony_article: row.sony_article,
                product_name: row.product_name,
                brand: row.brand,
                gruppe: row.gruppe,
                category: row.category,
                model: row.model,
                ph2: row.ph2,
                ph3: row.ph3,
                ph4: row.ph4,
                season: row.season,
                ci_group: row.ci_group,
                sold_qty: soldQty,
                sellout_revenue: revenue,
                latest_stock_qty: 0,
                dealer_count: 0,
                selling_dealer_count: 0,
                avg_sellout_price: null,
                missing_price_qty: missingPriceQty,
                zero_price_qty: zeroPriceQty,
                priced_qty: pricedQty,
                last_reported_at: row.last_reported_at,
                dealerIds: new Set([row.dealer_id]),
                sellingDealerIds: soldQty > 0 ? new Set([row.dealer_id]) : new Set(),
                latestStockRows: new Map([[row.dealer_id, row]]),
            });
        } else {
            currentProduct.sold_qty = Number(currentProduct.sold_qty ?? 0) + soldQty;
            currentProduct.sellout_revenue =
                Number(currentProduct.sellout_revenue ?? 0) + revenue;
            currentProduct.missing_price_qty =
                Number(currentProduct.missing_price_qty ?? 0) + missingPriceQty;
            currentProduct.zero_price_qty =
                Number(currentProduct.zero_price_qty ?? 0) + zeroPriceQty;
            currentProduct.priced_qty =
                Number(currentProduct.priced_qty ?? 0) + pricedQty;
            currentProduct.last_reported_at = maxDateString([
                currentProduct.last_reported_at,
                row.last_reported_at,
            ]);
            currentProduct.dealerIds.add(row.dealer_id);

            if (soldQty > 0) {
                currentProduct.sellingDealerIds.add(row.dealer_id);
            }

            const currentStockRow = currentProduct.latestStockRows.get(row.dealer_id);

            if (isNewerStockRow(row, currentStockRow)) {
                currentProduct.latestStockRows.set(row.dealer_id, row);
            }
        }

        const currentDealer = dealerMap.get(row.dealer_id);

        if (!currentDealer) {
            dealerMap.set(row.dealer_id, {
                sellout_year: periodYear,
                sellout_week: periodWeekTo,
                dealer_id: row.dealer_id,
                dealer_name: row.dealer_name,
                login_nr: row.login_nr,
                kam: row.kam,
                city: row.city,
                customer_type: row.customer_type,
                customer_classification: row.customer_classification,
                distribution: row.distribution,
                sold_qty: soldQty,
                sellout_revenue: revenue,
                latest_stock_qty: 0,
                product_count: 0,
                active_product_count: 0,
                missing_price_qty: missingPriceQty,
                zero_price_qty: zeroPriceQty,
                priced_qty: pricedQty,
                avg_sellout_price: null,
                last_reported_at: row.last_reported_at,
                productKeys: new Set([productKey]),
                activeProductKeys: soldQty > 0 ? new Set([productKey]) : new Set(),
                latestStockRows: new Map([[productKey, row]]),
            });
        } else {
            currentDealer.sold_qty = Number(currentDealer.sold_qty ?? 0) + soldQty;
            currentDealer.sellout_revenue =
                Number(currentDealer.sellout_revenue ?? 0) + revenue;
            currentDealer.missing_price_qty =
                Number(currentDealer.missing_price_qty ?? 0) + missingPriceQty;
            currentDealer.zero_price_qty =
                Number(currentDealer.zero_price_qty ?? 0) + zeroPriceQty;
            currentDealer.priced_qty =
                Number(currentDealer.priced_qty ?? 0) + pricedQty;
            currentDealer.last_reported_at = maxDateString([
                currentDealer.last_reported_at,
                row.last_reported_at,
            ]);
            currentDealer.productKeys.add(productKey);

            if (soldQty > 0) {
                currentDealer.activeProductKeys.add(productKey);
            }

            const currentStockRow = currentDealer.latestStockRows.get(productKey);

            if (isNewerStockRow(row, currentStockRow)) {
                currentDealer.latestStockRows.set(productKey, row);
            }
        }
    });

    const aggregatedProducts = Array.from(productMap.values())
        .map((product) => {
            const latestStockQty = Array.from(product.latestStockRows.values()).reduce(
                (sum, row) => sum + Number(row.latest_stock_qty ?? 0),
                0
            );

            const pricedQty = Number(product.priced_qty ?? 0);
            const revenue = Number(product.sellout_revenue ?? 0);

            const { dealerIds, sellingDealerIds, latestStockRows, ...clean } =
                product;

            return {
                ...clean,
                latest_stock_qty: latestStockQty,
                dealer_count: dealerIds.size,
                selling_dealer_count: sellingDealerIds.size,
                avg_sellout_price: pricedQty > 0 ? revenue / pricedQty : null,
            };
        })
        .sort(
            (a, b) =>
                Number(b.sold_qty ?? 0) - Number(a.sold_qty ?? 0) ||
                Number(b.sellout_revenue ?? 0) - Number(a.sellout_revenue ?? 0)
        );

    const aggregatedDealers = Array.from(dealerMap.values())
        .map((dealer) => {
            const latestStockQty = Array.from(dealer.latestStockRows.values()).reduce(
                (sum, row) => sum + Number(row.latest_stock_qty ?? 0),
                0
            );

            const pricedQty = Number(dealer.priced_qty ?? 0);
            const revenue = Number(dealer.sellout_revenue ?? 0);

            const { productKeys, activeProductKeys, latestStockRows, ...clean } =
                dealer;

            return {
                ...clean,
                latest_stock_qty: latestStockQty,
                product_count: productKeys.size,
                active_product_count: activeProductKeys.size,
                avg_sellout_price: pricedQty > 0 ? revenue / pricedQty : null,
            };
        })
        .sort(
            (a, b) =>
                Number(b.sellout_revenue ?? 0) - Number(a.sellout_revenue ?? 0) ||
                Number(b.sold_qty ?? 0) - Number(a.sold_qty ?? 0)
        );

    const summaryLatestStockQty = Array.from(summaryLatestStockRows.values()).reduce(
        (sum, row) => sum + Number(row.latest_stock_qty ?? 0),
        0
    );

    const summary: WeekSummary = {
        sellout_year: periodYear,
        sellout_week: periodWeekTo,
        sold_qty: summarySoldQty,
        sellout_revenue: summaryRevenue,
        latest_stock_qty: summaryLatestStockQty,
        reporting_dealer_count: summaryDealerIds.size,
        selling_dealer_count: summarySellingDealerIds.size,
        product_count: summaryProductKeys.size,
        avg_sellout_price:
            summaryPricedQty > 0 ? summaryRevenue / summaryPricedQty : null,
        missing_price_qty: summaryMissingPriceQty,
        zero_price_qty: summaryZeroPriceQty,
        priced_qty: summaryPricedQty,
        last_reported_at: maxDateString(rows.map((row) => row.last_reported_at)),
    };

    return {
        summary,
        dealers: aggregatedDealers,
        products: aggregatedProducts,
    };
}

export default function SelloutDashboardClient() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const dealerIdParam = searchParams.get("dealer_id");
    const tabParam = searchParams.get("tab");

    const currentWeek = useMemo(() => getCurrentIsoWeek(), []);

    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(currentWeek.year);
    const [weekFrom, setWeekFrom] = useState(currentWeek.week);
    const [weekTo, setWeekTo] = useState(currentWeek.week);
    const [comparePreviousYear, setComparePreviousYear] = useState(false);
    const [search, setSearch] = useState("");
    const [tab, setTab] = useState<TabMode>(
        tabParam === "products" ? "products" : "dealers"
    );

    const [summary, setSummary] = useState<WeekSummary | null>(null);
    const [previousSummary, setPreviousSummary] = useState<WeekSummary | null>(
        null
    );
    const [dealers, setDealers] = useState<DealerWeek[]>([]);
    const [products, setProducts] = useState<ProductWeek[]>([]);
    const [selloutRows, setSelloutRows] = useState<ProductDealerWeek[]>([]);

    const [categoryFilter, setCategoryFilter] = useState("");
    const [gruppeFilter, setGruppeFilter] = useState("");
    const [onlySoldProducts, setOnlySoldProducts] = useState(false);
    const [onlyStockProducts, setOnlyStockProducts] = useState(false);
    const [onlyPriceIssues, setOnlyPriceIssues] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductWeek | null>(
        null
    );
    const [productDealers, setProductDealers] = useState<ProductDealerWeek[]>([]);
    const [drilldownLoading, setDrilldownLoading] = useState(false);

    const maxWeekForSelectedYear = useMemo(() => {
        return getIsoWeeksInYear(selectedYear);
    }, [selectedYear]);

    const normalizedWeekFrom = Math.min(weekFrom, weekTo);
    const normalizedWeekTo = Math.max(weekFrom, weekTo);
    const selectedWeekCount = normalizedWeekTo - normalizedWeekFrom + 1;

    const periodLabel =
        normalizedWeekFrom === normalizedWeekTo
            ? `KW ${normalizedWeekTo} / ${selectedYear}`
            : `KW ${normalizedWeekFrom}–${normalizedWeekTo} / ${selectedYear}`;

    const previousPeriodLabel =
        normalizedWeekFrom === normalizedWeekTo
            ? `KW ${normalizedWeekTo} / ${selectedYear - 1}`
            : `KW ${normalizedWeekFrom}–${normalizedWeekTo} / ${selectedYear - 1}`;

    const resetToCurrentWeek = () => {
        const current = getCurrentIsoWeek();

        setSelectedYear(current.year);
        setWeekFrom(current.week);
        setWeekTo(current.week);
        setComparePreviousYear(false);
        setSearch("");
        setCategoryFilter("");
        setGruppeFilter("");
        setOnlySoldProducts(false);
        setOnlyStockProducts(false);
        setOnlyPriceIssues(false);
        setSelectedProduct(null);
        setProductDealers([]);
    };

    const [priceIssues, setPriceIssues] = useState<SelloutPriceIssue[]>([]);
    const [priceIssueModalOpen, setPriceIssueModalOpen] = useState(false);
    const [selectedPriceIssueProduct, setSelectedPriceIssueProduct] =
        useState<ProductWeek | null>(null);
    const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});
    const [savingPriceItemId, setSavingPriceItemId] = useState<number | null>(null);


    const loadData = useCallback(async () => {
        setLoading(true);
        setSelectedProduct(null);
        setProductDealers([]);

        try {
            let currentQuery = supabase
                .from("v_sellout_product_dealer_week")
                .select("*")
                .eq("sellout_year", selectedYear)
                .gte("sellout_week", normalizedWeekFrom)
                .lte("sellout_week", normalizedWeekTo)
                .order("sellout_week", { ascending: false })
                .order("sold_qty", { ascending: false });

            if (dealerIdParam) {
                currentQuery = currentQuery.eq("dealer_id", Number(dealerIdParam));
            }

            let previousQuery = supabase
                .from("v_sellout_product_dealer_week")
                .select("*")
                .eq("sellout_year", selectedYear - 1)
                .gte("sellout_week", normalizedWeekFrom)
                .lte("sellout_week", normalizedWeekTo)
                .order("sellout_week", { ascending: false })
                .order("sold_qty", { ascending: false });

            if (dealerIdParam) {
                previousQuery = previousQuery.eq("dealer_id", Number(dealerIdParam));
            }

            let priceIssuesQuery = supabase
                .from("v_sellout_price_issues")
                .select("*")
                .eq("sellout_year", selectedYear)
                .gte("sellout_week", normalizedWeekFrom)
                .lte("sellout_week", normalizedWeekTo)
                .order("sellout_week", { ascending: false })
                .order("dealer_name", { ascending: true })
                .order("sony_article", { ascending: true });

            if (dealerIdParam) {
                priceIssuesQuery = priceIssuesQuery.eq("dealer_id", Number(dealerIdParam));
            }

            const [currentRes, previousRes, priceIssuesRes] = await Promise.all([
                currentQuery,
                comparePreviousYear ? previousQuery : Promise.resolve(null),
                priceIssuesQuery,
            ]);

            if (currentRes.error) throw currentRes.error;
            if (previousRes && previousRes.error) throw previousRes.error;
            if (priceIssuesRes.error) throw priceIssuesRes.error;

            const currentRows = (currentRes.data ?? []) as ProductDealerWeek[];
            const currentAggregated = aggregateSelloutRows(
                currentRows,
                selectedYear,
                normalizedWeekTo
            );

            setSelloutRows(currentRows);
            setPriceIssues((priceIssuesRes.data ?? []) as SelloutPriceIssue[]);
            setSummary(currentAggregated.summary);
            setDealers(currentAggregated.dealers);
            setProducts(currentAggregated.products);

            if (comparePreviousYear && previousRes) {
                const previousRows = (previousRes.data ?? []) as ProductDealerWeek[];
                const previousAggregated = aggregateSelloutRows(
                    previousRows,
                    selectedYear - 1,
                    normalizedWeekTo
                );

                setPreviousSummary(previousAggregated.summary);
            } else {
                setPreviousSummary(null);
            }
        } catch (error) {
            console.error("Sell-out Dashboard Fehler:", error);
            setSummary(null);
            setPreviousSummary(null);
            setDealers([]);
            setProducts([]);
            setSelloutRows([]);
            setPriceIssues([]);
        } finally {
            setLoading(false);
        }
    }, [
        supabase,
        selectedYear,
        normalizedWeekFrom,
        normalizedWeekTo,
        comparePreviousYear,
        dealerIdParam,
    ]);

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

    useEffect(() => {
        const maxWeek = getIsoWeeksInYear(selectedYear);

        if (weekFrom > maxWeek) {
            setWeekFrom(maxWeek);
        }

        if (weekTo > maxWeek) {
            setWeekTo(maxWeek);
        }
    }, [selectedYear, weekFrom, weekTo]);

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

    const categoryOptions = useMemo<string[]>(() => {
        return Array.from(
            new Set(
                products
                    .map((p) => p.category)
                    .filter((value): value is string => Boolean(value))
            )
        ).sort();
    }, [products]);


    
    const gruppeOptions = useMemo<string[]>(() => {
        return Array.from(
            new Set(
                products
                    .map((p) => p.gruppe)
                    .filter((value): value is string => Boolean(value))
            )
        ).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();

        return products.filter((row) => {
            const matchesSearch =
                !q ||
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
                    row.season,
                    row.ci_group,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));

            const matchesCategory =
                !categoryFilter || row.category === categoryFilter;

            const matchesGruppe = !gruppeFilter || row.gruppe === gruppeFilter;

            const matchesSold = !onlySoldProducts || Number(row.sold_qty ?? 0) > 0;

            const matchesStock =
                !onlyStockProducts || Number(row.latest_stock_qty ?? 0) > 0;

            const matchesPriceIssues =
                !onlyPriceIssues ||
                Number(row.zero_price_qty ?? 0) > 0 ||
                Number(row.missing_price_qty ?? 0) > 0;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesGruppe &&
                matchesSold &&
                matchesStock &&
                matchesPriceIssues
            );
        });
    }, [
        products,
        search,
        categoryFilter,
        gruppeFilter,
        onlySoldProducts,
        onlyStockProducts,
        onlyPriceIssues,
    ]);
    const activeSummary = useMemo(() => {
        if (tab === "products") {
            const visibleProductKeys = new Set(
                filteredProducts.map((product) => getProductKey(product))
            );
    
            const visibleRows = selloutRows.filter((row) =>
                visibleProductKeys.has(getProductKey(row))
            );
    
            return aggregateSelloutRows(
                visibleRows,
                selectedYear,
                normalizedWeekTo
            ).summary;
        }
    
        if (tab === "dealers") {
            const visibleDealerIds = new Set(
                filteredDealers.map((dealer) => dealer.dealer_id)
            );
    
            const visibleRows = selloutRows.filter((row) =>
                visibleDealerIds.has(row.dealer_id)
            );
    
            return aggregateSelloutRows(
                visibleRows,
                selectedYear,
                normalizedWeekTo
            ).summary;
        }
    
        return summary;
    }, [
        tab,
        filteredProducts,
        filteredDealers,
        selloutRows,
        selectedYear,
        normalizedWeekTo,
        summary,
    ]);
    const priceIssueCountByProduct = useMemo(() => {
        const map = new Map<string, number>();

        priceIssues.forEach((issue) => {
            const key = getProductKey(issue);
            map.set(key, (map.get(key) ?? 0) + 1);
        });

        return map;
    }, [priceIssues]);

    const visiblePriceIssues = useMemo(() => {
        if (!selectedPriceIssueProduct) {
            return priceIssues;
        }

        const selectedKey = getProductKey(selectedPriceIssueProduct);

        return priceIssues.filter((issue) => getProductKey(issue) === selectedKey);
    }, [priceIssues, selectedPriceIssueProduct]);

    const openPriceIssueModal = (product?: ProductWeek) => {
        setSelectedPriceIssueProduct(product ?? null);
        setPriceInputs({});
        setPriceIssueModalOpen(true);
    };

    const closePriceIssueModal = () => {
        setPriceIssueModalOpen(false);
        setSelectedPriceIssueProduct(null);
        setPriceInputs({});
        setSavingPriceItemId(null);
    };

    const updatePriceInput = (itemId: number, value: string) => {
        setPriceInputs((current) => ({
            ...current,
            [itemId]: value,
        }));
    };

    const saveSelloutPrice = async (issue: SelloutPriceIssue) => {
        const rawValue = priceInputs[issue.item_id];

        const normalizedValue = String(rawValue ?? "")
            .trim()
            .replace("'", "")
            .replace(",", ".");

        const price = Number(normalizedValue);

        if (Number.isNaN(price) || price < 0) {
            alert("Bitte einen gültigen Preis eingeben.");
            return;
        }

        setSavingPriceItemId(issue.item_id);

        try {
            const res = await fetch("/api/admin/sellout/update-price", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    item_id: issue.item_id,
                    preis: price,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || "Preis konnte nicht gespeichert werden.");
            }

            setPriceInputs((current) => {
                const next = { ...current };
                delete next[issue.item_id];
                return next;
            });

            await loadData();
        } catch (error) {
            console.error("Preis nachtragen Fehler:", error);
            alert("Der Preis konnte nicht gespeichert werden.");
        } finally {
            setSavingPriceItemId(null);
        }
    };

    const openProductDrilldown = (product: ProductWeek) => {
        setSelectedProduct(product);
        setProductDealers([]);
        setDrilldownLoading(true);

        try {
            const productKey = getProductKey(product);

            const matchingRows = selloutRows.filter(
                (row) => getProductKey(row) === productKey
            );

            const dealerMap = new Map<number, ProductDealerWeek>();

            matchingRows.forEach((row) => {
                const current = dealerMap.get(row.dealer_id);

                if (!current) {
                    dealerMap.set(row.dealer_id, {
                        ...row,
                        sellout_year: selectedYear,
                        sellout_week: normalizedWeekTo,
                    });
                    return;
                }

                const soldQty =
                    Number(current.sold_qty ?? 0) + Number(row.sold_qty ?? 0);
                const revenue =
                    Number(current.sellout_revenue ?? 0) +
                    Number(row.sellout_revenue ?? 0);
                const missingPriceQty =
                    Number(current.missing_price_qty ?? 0) +
                    Number(row.missing_price_qty ?? 0);
                const zeroPriceQty =
                    Number(current.zero_price_qty ?? 0) +
                    Number(row.zero_price_qty ?? 0);
                const pricedQty =
                    Number(current.priced_qty ?? 0) + Number(row.priced_qty ?? 0);

                const stockSource = isNewerStockRow(row, current) ? row : current;

                dealerMap.set(row.dealer_id, {
                    ...current,
                    sold_qty: soldQty,
                    sellout_revenue: revenue,
                    missing_price_qty: missingPriceQty,
                    zero_price_qty: zeroPriceQty,
                    priced_qty: pricedQty,
                    avg_sellout_price: pricedQty > 0 ? revenue / pricedQty : null,
                    latest_stock_qty: stockSource.latest_stock_qty,
                    latest_stock_date: stockSource.latest_stock_date,
                    last_reported_at: maxDateString([
                        current.last_reported_at,
                        row.last_reported_at,
                    ]),
                });
            });

            const aggregatedDealers = Array.from(dealerMap.values()).sort(
                (a, b) =>
                    Number(b.sold_qty ?? 0) - Number(a.sold_qty ?? 0) ||
                    Number(b.sellout_revenue ?? 0) - Number(a.sellout_revenue ?? 0)
            );

            setProductDealers(aggregatedDealers);
        } catch (error) {
            console.error("Sell-out Drilldown Fehler:", error);
        } finally {
            setDrilldownLoading(false);
        }
    };

    const hasZeroPriceSales = Number(activeSummary?.zero_price_qty ?? 0) > 0;

    const previousSoldQty = comparePreviousYear
        ? Number(previousSummary?.sold_qty ?? 0)
        : null;
    const previousRevenue = comparePreviousYear
        ? Number(previousSummary?.sellout_revenue ?? 0)
        : null;
    const previousStockQty = comparePreviousYear
        ? Number(previousSummary?.latest_stock_qty ?? 0)
        : null;
    const previousPricedQty = comparePreviousYear
        ? Number(previousSummary?.priced_qty ?? 0)
        : null;

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

                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={resetToCurrentWeek}>
                        Aktuelle KW
                    </Button>

                    <Button type="button" variant="outline" onClick={loadData}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Aktualisieren
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
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
                            KW von
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={maxWeekForSelectedYear}
                            value={weekFrom}
                            onChange={(e) => setWeekFrom(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            KW bis
                        </label>
                        <input
                            type="number"
                            min={1}
                            max={maxWeekForSelectedYear}
                            value={weekTo}
                            onChange={(e) => setWeekTo(Number(e.target.value))}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm md:mt-5">
                        <input
                            type="checkbox"
                            checked={comparePreviousYear}
                            onChange={(e) => setComparePreviousYear(e.target.checked)}
                        />
                        Vorjahr vergleichen
                    </label>

                    <div className="relative md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Suche
                        </label>
                        <Search className="absolute left-3 top-8 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                tab === "products"
                                    ? "Produkt, Modell, EAN, Sony Artikel, Kategorie suchen..."
                                    : "Händler, Login, Ort, KAM, Kundentyp suchen..."
                            }
                            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    Aktuelle Auswahl: {periodLabel}
                    {comparePreviousYear ? ` · Vergleich: ${previousPeriodLabel}` : ""}
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
                            value={formatInteger(activeSummary?.sold_qty)}
                            subtitle={
                                comparePreviousYear
                                    ? getComparisonText(
                                        Number(activeSummary?.sold_qty ?? 0),
                                        previousSoldQty,
                                        (value) => formatInteger(value)
                                    )
                                    : periodLabel
                            }
                        />
                        <StatCard
                            title="Ø Stück / Woche"
                            value={formatDecimal(
                                Number(activeSummary?.sold_qty ?? 0) / selectedWeekCount
                            )}
                            subtitle={`${selectedWeekCount} KW Schnitt`}
                        />
                        <StatCard
                            title="Sell-out Umsatz"
                            value={formatCurrency(activeSummary?.sellout_revenue)}
                            subtitle={
                                comparePreviousYear
                                    ? getComparisonText(
                                        Number(activeSummary?.sellout_revenue ?? 0),
                                        previousRevenue,
                                        (value) => formatCurrency(value)
                                    )
                                    : "gemeldete VK-Preise"
                            }
                        />
                        <StatCard
                            title="Ø Umsatz / Woche"
                            value={formatCurrency(
                                Number(activeSummary?.sellout_revenue ?? 0) /
                                selectedWeekCount
                            )}
                            subtitle={`${selectedWeekCount} KW Schnitt`}
                        />
                        <StatCard
                            title="Lagerbestand"
                            value={formatInteger(activeSummary?.latest_stock_qty)}
                            subtitle={
                                comparePreviousYear
                                    ? getComparisonText(
                                        Number(activeSummary?.latest_stock_qty ?? 0),
                                        previousStockQty,
                                        (value) => formatInteger(value)
                                    )
                                    : "neuester Snapshot im Zeitraum"
                            }
                        />
                        <StatCard
                            title="Preisqualität"
                            value={`${formatInteger(activeSummary?.priced_qty)} / ${formatInteger(
                                activeSummary?.sold_qty
                            )}`}
                            subtitle={
                                comparePreviousYear
                                    ? getComparisonText(
                                        Number(activeSummary?.priced_qty ?? 0),
                                        previousPricedQty,
                                        (value) => formatInteger(value)
                                    )
                                    : `${formatInteger(
                                        activeSummary?.zero_price_qty
                                    )} Stk. ohne Preis`
                            }
                        />
                    </div>

                    {hasZeroPriceSales ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <div>
                                ⚠️ Einige Verkäufe wurden ohne Verkaufspreis oder mit CHF 0
                                gemeldet. Stückzahlen und Lager sind nutzbar, der Umsatz kann aber
                                unvollständig sein.
                            </div>

                            {priceIssues.length > 0 ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openPriceIssueModal()}
                                >
                                    Preisfehler anzeigen ({priceIssues.length})
                                </Button>
                            ) : null}
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
                                            <th className="px-3 py-2">Ø/KW</th>
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
                                                <td
                                                    colSpan={9}
                                                    className="px-3 py-6 text-sm text-gray-500"
                                                >
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
                                                            {row.dealer_name ||
                                                                `Dealer #${row.dealer_id}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {row.dealer_id} · Login:{" "}
                                                            {row.login_nr || "–"}
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
                                                                {formatInteger(row.zero_price_qty)} Stk.
                                                                ohne Preis
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatDecimal(
                                                            Number(row.sold_qty ?? 0) /
                                                            selectedWeekCount
                                                        )}
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
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                            >
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

                            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        Kategorie
                                    </label>
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) =>
                                            setCategoryFilter(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Alle Kategorien</option>
                                        {categoryOptions.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        Gruppe
                                    </label>
                                    <select
                                        value={gruppeFilter}
                                        onChange={(e) =>
                                            setGruppeFilter(e.target.value)
                                        }
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Alle Gruppen</option>
                                        {gruppeOptions.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={onlySoldProducts}
                                        onChange={(e) =>
                                            setOnlySoldProducts(e.target.checked)
                                        }
                                    />
                                    Nur mit Verkauf
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={onlyStockProducts}
                                        onChange={(e) =>
                                            setOnlyStockProducts(e.target.checked)
                                        }
                                    />
                                    Nur mit Lager
                                </label>

                                <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm md:col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={onlyPriceIssues}
                                        onChange={(e) =>
                                            setOnlyPriceIssues(e.target.checked)
                                        }
                                    />
                                    Nur Preisfehler / fehlende Preise
                                </label>

                                <div className="flex items-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setCategoryFilter("");
                                            setGruppeFilter("");
                                            setOnlySoldProducts(false);
                                            setOnlyStockProducts(false);
                                            setOnlyPriceIssues(false);
                                        }}
                                    >
                                        Filter zurücksetzen
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th className="px-3 py-2">Produkt</th>
                                            <th className="px-3 py-2">Kategorie</th>
                                            <th className="px-3 py-2">Stück</th>
                                            <th className="px-3 py-2">Ø/KW</th>
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
                                                <td
                                                    colSpan={9}
                                                    className="px-3 py-6 text-sm text-gray-500"
                                                >
                                                    Keine Produktdaten für diese Auswahl.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProducts.map((row) => {
                                                const issueCount = priceIssueCountByProduct.get(getProductKey(row)) ?? 0;

                                                return (
                                                    <tr
                                                        key={`${row.sellout_year}-${row.sellout_week}-${row.product_id ??
                                                            row.ean ??
                                                            row.sony_article
                                                            }`}
                                                        className="bg-gray-50 text-sm"
                                                    >
                                                        <td className="px-3 py-3">
                                                            <div className="font-semibold text-gray-900">
                                                                {row.sony_article ||
                                                                    row.product_name ||
                                                                    "–"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Gruppe: {row.gruppe || "–"} · Modell:{" "}
                                                                {row.model || "–"}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                EAN: {row.ean || "–"}
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
                                                                    {formatInteger(row.zero_price_qty)} Stk.
                                                                    ohne Preis
                                                                </div>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatDecimal(
                                                                Number(row.sold_qty ?? 0) /
                                                                selectedWeekCount
                                                            )}
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
                                                                : `${formatInteger(
                                                                    row.selling_dealer_count
                                                                )} / ${formatInteger(row.dealer_count)}`}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            {formatCurrency(row.avg_sellout_price)}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex flex-col gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => openProductDrilldown(row)}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Händler anzeigen
                                                                </Button>

                                                                {issueCount > 0 ? (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => openPriceIssueModal(row)}
                                                                    >
                                                                        Preis nachtragen ({issueCount})
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
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
                                        {selectedProduct.sony_article ||
                                            selectedProduct.product_name}
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {periodLabel} · EAN {selectedProduct.ean || "–"}
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
                                            <th className="px-3 py-2">Ø/KW</th>
                                            <th className="px-3 py-2">Umsatz</th>
                                            <th className="px-3 py-2">Lager</th>
                                            <th className="px-3 py-2">Lagerdatum</th>
                                            <th className="px-3 py-2">Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {productDealers.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="px-3 py-6 text-sm text-gray-500"
                                                >
                                                    Keine Händlerdaten zu diesem Produkt.
                                                </td>
                                            </tr>
                                        ) : (
                                            productDealers.map((row) => (
                                                <tr
                                                    key={`${row.dealer_id}-${row.product_id ?? row.ean
                                                        }`}
                                                    className="bg-gray-50 text-sm"
                                                >
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-gray-900">
                                                            {row.dealer_name ||
                                                                `Dealer #${row.dealer_id}`}
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
                                                                {formatInteger(row.zero_price_qty)} Stk.
                                                                ohne Preis
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatDecimal(
                                                            Number(row.sold_qty ?? 0) /
                                                            selectedWeekCount
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatCurrency(row.sellout_revenue)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {formatInteger(row.latest_stock_qty)}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        {row.latest_stock_date
                                                            ? new Date(
                                                                row.latest_stock_date
                                                            ).toLocaleDateString("de-CH")
                                                            : "–"}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Link href={`/admin/dealers/${row.dealer_id}`}>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                            >
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
                            Lagerbestand ist ein Snapshot. Bei mehreren Wochen wird der
                            zuletzt gemeldete Lagerwert im gewählten Zeitraum verwendet.
                        </div>
                    </div>
                </div>
            ) : null}


            {priceIssueModalOpen ? (
                <div className="fixed inset-0 z-[95] flex justify-end bg-black/30">
                    <div className="h-full w-full max-w-5xl overflow-y-auto bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <PackageSearch className="h-5 w-5 text-amber-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Preise nachtragen
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedPriceIssueProduct
                                        ? `${selectedPriceIssueProduct.sony_article || selectedPriceIssueProduct.product_name} · ${periodLabel}`
                                        : `${periodLabel} · alle Preisfehler`}
                                </p>
                            </div>

                            <Button type="button" variant="outline" onClick={closePriceIssueModal}>
                                Schließen
                            </Button>
                        </div>

                        {visiblePriceIssues.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                                Keine offenen Preisfehler für diese Auswahl.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th className="px-3 py-2">KW</th>
                                            <th className="px-3 py-2">Händler</th>
                                            <th className="px-3 py-2">Produkt</th>
                                            <th className="px-3 py-2">Menge</th>
                                            <th className="px-3 py-2">Aktueller Preis</th>
                                            <th className="px-3 py-2">Neuer Preis</th>
                                            <th className="px-3 py-2">Quelle</th>
                                            <th className="px-3 py-2">Aktion</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visiblePriceIssues.map((issue) => (
                                            <tr
                                                key={issue.item_id}
                                                className="bg-gray-50 text-sm"
                                            >
                                                <td className="px-3 py-3">
                                                    KW {issue.sellout_week} / {issue.sellout_year}
                                                </td>

                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-gray-900">
                                                        {issue.dealer_name || `Dealer #${issue.dealer_id}`}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Login: {issue.login_nr || "–"} · {issue.city || "–"}
                                                    </div>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-gray-900">
                                                        {issue.sony_article || issue.product_name || "–"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Gruppe: {issue.gruppe || "–"} · Modell: {issue.model || "–"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        EAN: {issue.ean || "–"} · Item ID: {issue.item_id}
                                                    </div>
                                                </td>

                                                <td className="px-3 py-3 font-semibold">
                                                    {formatInteger(issue.sold_qty)}
                                                </td>

                                                <td className="px-3 py-3">
                                                    {issue.sellout_price === null
                                                        ? "Fehlt"
                                                        : formatCurrency(issue.sellout_price)}
                                                </td>

                                                <td className="px-3 py-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={priceInputs[issue.item_id] ?? ""}
                                                        onChange={(e) =>
                                                            updatePriceInput(issue.item_id, e.target.value)
                                                        }
                                                        placeholder="z.B. 699.00"
                                                        className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                                    />
                                                </td>

                                                <td className="px-3 py-3">
                                                    <div>{issue.submission_source || "manuell"}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {issue.item_source || "–"}
                                                    </div>
                                                </td>

                                                <td className="px-3 py-3">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => saveSelloutPrice(issue)}
                                                        disabled={savingPriceItemId === issue.item_id}
                                                    >
                                                        {savingPriceItemId === issue.item_id ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Speichern...
                                                            </>
                                                        ) : (
                                                            "Speichern"
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            <CalendarDays className="mr-1 inline h-4 w-4" />
                            Beim Speichern wird der Preis direkt auf der Originalposition in
                            submission_items aktualisiert. Danach wird der Sell-out Report neu geladen.
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
