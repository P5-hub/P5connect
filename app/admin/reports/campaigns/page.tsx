"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CampaignProgressChart from "@/components/admin/CampaignProgressChart";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Download,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  Store,
  Trophy,
  Users,
} from "lucide-react";

type Campaign = {
  campaign_id: number;
  code: string | null;
  name: string;
  campaign_type: string;
  start_date: string;
  end_date: string;
  active: boolean;
};

type ReportRow = {
  item_id: number;
  product_id: number | null;
  product_name: string | null;
  sony_article: string | null;
  menge: number | null;
  preis: number | null;
  pricing_mode: string | null;
  is_display_item: boolean | null;
  submission: {
    submission_id: number;
    campaign_id: number | null;
    dealer_id: number | null;
    typ: string | null;
    status: string | null;
    created_at: string | null;
    datum: string | null;
    dealer: {
      dealer_id: number;
      name: string | null;
      login_nr: string | null;
      kam: string | null;
      city: string | null;
    } | null;
  } | null;
};

type CampaignBonusTier = {
  id: number;
  campaign_id: number;
  dealer_id: number | null;
  tier_level: number;
  threshold_value: number;
  bonus_type: string;
  bonus_value: number;
  label: string | null;
  dealer: {
    dealer_id: number;
    name: string | null;
    login_nr: string | null;
    kam: string | null;
    city: string | null;
  } | null;
};

type DealerCampaignRow = {
  dealerId: number;
  dealerName: string;
  loginNr: string;
  kam: string;
  city: string;
  totalRevenue: number;
  messeRevenue: number;
  displayRevenue: number;
  standardRevenue: number;
  qty: number;
  positions: number;
  bonusStages: {
    tierLevel: number;
    threshold: number;
    label: string;
    reached: boolean;
    missing: number;
  }[];
  currentBonusLabel: string;
  currentBonusAmount: number;
};

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";

  return `${Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} CHF`;
}

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

function formatBonusValue(type: string, value: number) {
  if (type === "percent") {
    return `${value.toLocaleString("de-CH", {
      maximumFractionDigits: 2,
    })}%`;
  }

  if (type === "amount" || type === "credit") {
    return formatCurrency(value);
  }

  if (type === "gift") {
    return "Geschenk";
  }

  return value.toLocaleString("de-CH", {
    maximumFractionDigits: 2,
  });
}

function calculateBonusAmount(
  bonusType: string,
  bonusValue: number,
  revenue: number
) {
  if (bonusType === "percent") {
    return (revenue * bonusValue) / 100;
  }

  if (bonusType === "amount" || bonusType === "credit") {
    return bonusValue;
  }

  return 0;
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

export default function CampaignReportsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [bonusTiers, setBonusTiers] = useState<CampaignBonusTier[]>([]);

  const [dealerSearch, setDealerSearch] = useState("");
  const [kamFilter, setKamFilter] = useState("");
  const [dealerStatusFilter, setDealerStatusFilter] = useState<
    "all" | "active" | "needsAction"
  >("all");
  const [sortMode, setSortMode] = useState<
    "messeRevenue" | "totalRevenue" | "bonusAmount" | "dealerName"
  >("messeRevenue");

  const selectedCampaign = campaigns.find(
    (campaign) => String(campaign.campaign_id) === selectedCampaignId
  );

  const loadCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from("campaigns")
      .select("campaign_id, code, name, campaign_type, start_date, end_date, active")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden der Kampagnen:", error);
      return;
    }

    const list = (data ?? []) as Campaign[];
    setCampaigns(list);

    if (!selectedCampaignId && list.length > 0) {
      setSelectedCampaignId(String(list[0].campaign_id));
    }
  }, [supabase, selectedCampaignId]);

  const loadReport = useCallback(async () => {
    if (!selectedCampaignId) return;

    setLoading(true);

    try {
      const [itemsRes, tiersRes] = await Promise.all([
        supabase
          .from("submission_items")
          .select(`
            item_id,
            product_id,
            product_name,
            sony_article,
            menge,
            preis,
            pricing_mode,
            is_display_item,
            submission:submission_id (
              submission_id,
              campaign_id,
              dealer_id,
              typ,
              status,
              created_at,
              datum,
              dealer:dealer_id (
                dealer_id,
                name,
                login_nr,
                kam,
                city
              )
            )
          `)
          .eq("submission.campaign_id", Number(selectedCampaignId)),

        supabase
          .from("campaign_bonus_tiers")
          .select(`
            id,
            campaign_id,
            dealer_id,
            tier_level,
            threshold_value,
            bonus_type,
            bonus_value,
            label,
            dealer:dealer_id (
              dealer_id,
              name,
              login_nr,
              kam,
              city
            )
          `)
          .eq("campaign_id", Number(selectedCampaignId))
          .order("dealer_id", { ascending: true })
          .order("tier_level", { ascending: true }),
      ]);

      const { data, error } = itemsRes;

      if (error) {
        console.error("Fehler beim Laden des Kampagnenreports:", error);
        setRows([]);
        return;
      }

      if (tiersRes.error) {
        console.error("Fehler beim Laden der Bonus-Tiers:", tiersRes.error);
        setBonusTiers([]);
      } else {
        const normalizedTiers = (tiersRes.data ?? []).map((tier: any) => ({
          ...tier,
          dealer: Array.isArray(tier.dealer) ? tier.dealer[0] ?? null : tier.dealer,
        }));

        setBonusTiers(normalizedTiers as CampaignBonusTier[]);
      }

      const cleanRows = ((data ?? []) as unknown as ReportRow[]).filter(
        (row) => Number(row.submission?.campaign_id) === Number(selectedCampaignId)
      );

      setRows(cleanRows);
    } finally {
      setLoading(false);
    }
  }, [supabase, selectedCampaignId]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const approvedRows = useMemo(() => {
    return rows.filter((row) => row.submission?.status === "approved");
  }, [rows]);

  const pendingRows = useMemo(() => {
    return rows.filter((row) => row.submission?.status === "pending");
  }, [rows]);

  const rejectedRows = useMemo(() => {
    return rows.filter((row) => row.submission?.status === "rejected");
  }, [rows]);

  const totalRevenue = useMemo(() => {
    return approvedRows.reduce(
      (sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0),
      0
    );
  }, [approvedRows]);

  const totalQty = useMemo(() => {
    return approvedRows.reduce((sum, row) => sum + Number(row.menge ?? 0), 0);
  }, [approvedRows]);

  const dealerCount = useMemo(() => {
    return new Set(
      approvedRows
        .map((row) => row.submission?.dealer_id)
        .filter((id): id is number => typeof id === "number")
    ).size;
  }, [approvedRows]);

  const displayRevenue = useMemo(() => {
    return approvedRows
      .filter((row) => row.pricing_mode === "display" || row.is_display_item === true)
      .reduce(
        (sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0),
        0
      );
  }, [approvedRows]);

  const messeRevenue = useMemo(() => {
    return approvedRows
      .filter((row) => row.pricing_mode === "messe")
      .reduce(
        (sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0),
        0
      );
  }, [approvedRows]);

  const standardRevenue = totalRevenue - displayRevenue - messeRevenue;

  const topProducts = useMemo(() => {
    const map = new Map<string, { label: string; qty: number; revenue: number }>();

    for (const row of approvedRows) {
      const label =
        row.sony_article ||
        row.product_name ||
        (row.product_id ? `Produkt #${row.product_id}` : `Item #${row.item_id}`);

      if (!map.has(label)) {
        map.set(label, { label, qty: 0, revenue: 0 });
      }

      const item = map.get(label)!;
      item.qty += Number(row.menge ?? 0);
      item.revenue += Number(row.menge ?? 0) * Number(row.preis ?? 0);
    }

    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [approvedRows]);

  const topDealers = useMemo(() => {
    const map = new Map<string, { label: string; qty: number; revenue: number }>();

    for (const row of approvedRows) {
      const dealerName =
        row.submission?.dealer?.name || `Dealer #${row.submission?.dealer_id ?? "-"}`;

      if (!map.has(dealerName)) {
        map.set(dealerName, { label: dealerName, qty: 0, revenue: 0 });
      }

      const item = map.get(dealerName)!;
      item.qty += Number(row.menge ?? 0);
      item.revenue += Number(row.menge ?? 0) * Number(row.preis ?? 0);
    }

    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [approvedRows]);

  const dealerCampaignRows = useMemo<DealerCampaignRow[]>(() => {
    const map = new Map<number, DealerCampaignRow>();

    for (const row of approvedRows) {
      const dealerId = row.submission?.dealer_id;
      if (!dealerId) continue;

      const dealer = row.submission?.dealer;
      const qty = Number(row.menge ?? 0);
      const price = Number(row.preis ?? 0);
      const revenue = qty * price;

      if (!map.has(dealerId)) {
        map.set(dealerId, {
          dealerId,
          dealerName: dealer?.name || `Dealer #${dealerId}`,
          loginNr: dealer?.login_nr || "-",
          kam: dealer?.kam || "-",
          city: dealer?.city || "-",
          totalRevenue: 0,
          messeRevenue: 0,
          displayRevenue: 0,
          standardRevenue: 0,
          qty: 0,
          positions: 0,
          bonusStages: [],
          currentBonusLabel: "Noch kein Bonus",
          currentBonusAmount: 0,
        });
      }

      const item = map.get(dealerId)!;

      item.totalRevenue += revenue;
      item.qty += qty;
      item.positions += 1;

      if (row.pricing_mode === "messe") {
        item.messeRevenue += revenue;
      } else if (row.pricing_mode === "display" || row.is_display_item === true) {
        item.displayRevenue += revenue;
      } else {
        item.standardRevenue += revenue;
      }
    }

    for (const tier of bonusTiers) {
      const dealerId = Number(tier.dealer_id);
      if (!dealerId || map.has(dealerId)) continue;

      const dealer = tier.dealer;

      map.set(dealerId, {
        dealerId,
        dealerName: dealer?.name || `Dealer #${dealerId}`,
        loginNr: dealer?.login_nr || "-",
        kam: dealer?.kam || "-",
        city: dealer?.city || "-",
        totalRevenue: 0,
        messeRevenue: 0,
        displayRevenue: 0,
        standardRevenue: 0,
        qty: 0,
        positions: 0,
        bonusStages: [],
        currentBonusLabel: "Noch kein Bonus",
        currentBonusAmount: 0,
      });
    }

    const result = [...map.values()].map((dealerRow) => {
      const dealerTiers = bonusTiers
        .filter(
          (tier) =>
            Number(tier.campaign_id) === Number(selectedCampaignId) &&
            Number(tier.dealer_id) === Number(dealerRow.dealerId)
        )
        .sort((a, b) => Number(a.threshold_value) - Number(b.threshold_value));

      const reachedTiers = dealerTiers.filter(
        (tier) => dealerRow.totalRevenue >= Number(tier.threshold_value)
      );

      const currentTier = reachedTiers[reachedTiers.length - 1] ?? null;

      const currentBonusAmount = currentTier
        ? calculateBonusAmount(
            currentTier.bonus_type,
            Number(currentTier.bonus_value),
            dealerRow.totalRevenue
          )
        : 0;

      return {
        ...dealerRow,
        bonusStages: dealerTiers.map((tier) => {
          const threshold = Number(tier.threshold_value);
          const reached = dealerRow.totalRevenue >= threshold;
          const bonusLabel = formatBonusValue(tier.bonus_type, Number(tier.bonus_value));

          return {
            tierLevel: Number(tier.tier_level),
            threshold,
            label: `${bonusLabel} ab ${formatCurrency(threshold)}`,
            reached,
            missing: Math.max(0, threshold - dealerRow.totalRevenue),
          };
        }),
        currentBonusLabel: currentTier
          ? `${formatBonusValue(
              currentTier.bonus_type,
              Number(currentTier.bonus_value)
            )} Bonus = ${formatCurrency(currentBonusAmount)}`
          : "Noch kein Bonus",
        currentBonusAmount,
      };
    });

    return result.sort((a, b) => {
      if (b.messeRevenue !== a.messeRevenue) {
        return b.messeRevenue - a.messeRevenue;
      }

      return b.totalRevenue - a.totalRevenue;
    });
  }, [approvedRows, bonusTiers, selectedCampaignId]);

  const activeDealerCount = useMemo(() => {
    return dealerCampaignRows.filter((dealer) => dealer.totalRevenue > 0).length;
  }, [dealerCampaignRows]);

  const needsActionDealerCount = Math.max(
    0,
    dealerCampaignRows.length - activeDealerCount
  );

  const avgRevenuePerActiveDealer =
    activeDealerCount > 0 ? totalRevenue / activeDealerCount : 0;

  const conversionRate =
    dealerCampaignRows.length > 0
      ? (activeDealerCount / dealerCampaignRows.length) * 100
      : 0;

  const kamOptions = useMemo(() => {
    return [...new Set(dealerCampaignRows.map((dealer) => dealer.kam).filter(Boolean))]
      .filter((kam) => kam !== "-")
      .sort((a, b) => a.localeCompare(b, "de-CH"));
  }, [dealerCampaignRows]);

  const filteredDealerRows = useMemo(() => {
    const search = dealerSearch.trim().toLowerCase();

    let result = dealerCampaignRows.filter((dealer) => {
      const matchesSearch =
        !search ||
        dealer.dealerName.toLowerCase().includes(search) ||
        dealer.loginNr.toLowerCase().includes(search) ||
        dealer.city.toLowerCase().includes(search) ||
        dealer.kam.toLowerCase().includes(search);

      const matchesKam = !kamFilter || dealer.kam === kamFilter;

      const matchesStatus =
        dealerStatusFilter === "all" ||
        (dealerStatusFilter === "active" && dealer.totalRevenue > 0) ||
        (dealerStatusFilter === "needsAction" && dealer.totalRevenue === 0);

      return matchesSearch && matchesKam && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      if (sortMode === "totalRevenue") return b.totalRevenue - a.totalRevenue;
      if (sortMode === "bonusAmount") return b.currentBonusAmount - a.currentBonusAmount;
      if (sortMode === "dealerName") {
        return a.dealerName.localeCompare(b.dealerName, "de-CH");
      }

      if (b.messeRevenue !== a.messeRevenue) {
        return b.messeRevenue - a.messeRevenue;
      }

      return b.totalRevenue - a.totalRevenue;
    });

    return result;
  }, [dealerCampaignRows, dealerSearch, kamFilter, dealerStatusFilter, sortMode]);

  const exportCsv = () => {
    const header = [
      "Kampagne",
      "Dealer",
      "Login",
      "KAM",
      "Ort",
      "Produkt",
      "Menge",
      "Preis",
      "Umsatz",
      "Pricing Mode",
      "Status",
      "Datum",
    ];

    const lines = approvedRows.map((row) => {
      const qty = Number(row.menge ?? 0);
      const price = Number(row.preis ?? 0);
      const revenue = qty * price;
      const dealer = row.submission?.dealer;

      return [
        selectedCampaign?.name ?? "",
        dealer?.name ?? "",
        dealer?.login_nr ?? "",
        dealer?.kam ?? "",
        dealer?.city ?? "",
        row.sony_article || row.product_name || "",
        qty,
        price,
        revenue,
        row.pricing_mode ?? "",
        row.submission?.status ?? "",
        row.submission?.datum || row.submission?.created_at || "",
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";");
    });

    const csv = [header.join(";"), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kampagnenreport_${selectedCampaign?.code || selectedCampaignId}.csv`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  const exportDealerRankingCsv = () => {
    const header = [
      "Kampagne",
      "Rang",
      "Dealer ID",
      "Händler",
      "Login",
      "KAM",
      "Ort",
      "Status",
      "Kampagnenumsatz",
      "Messeumsatz",
      "Displayumsatz",
      "Standardumsatz",
      "Menge",
      "Positionen",
      "Aktueller Bonus",
      "Bonusbetrag",
      "Bonus-Stufen",
    ];

    const lines = filteredDealerRows.map((dealerRow, index) => {
      const bonusStagesText = dealerRow.bonusStages
        .map((stage) => {
          if (stage.reached) {
            return `Erreicht: ${stage.label}`;
          }

          return `Offen: ${stage.label} / Fehlt: ${formatCurrency(stage.missing)}`;
        })
        .join(" | ");

      return [
        selectedCampaign?.name ?? "",
        index + 1,
        dealerRow.dealerId,
        dealerRow.dealerName,
        dealerRow.loginNr,
        dealerRow.kam,
        dealerRow.city,
        dealerRow.totalRevenue > 0 ? "AKTIV" : "HANDLUNGSBEDARF",
        dealerRow.totalRevenue,
        dealerRow.messeRevenue,
        dealerRow.displayRevenue,
        dealerRow.standardRevenue,
        dealerRow.qty,
        dealerRow.positions,
        dealerRow.currentBonusLabel,
        dealerRow.currentBonusAmount,
        bonusStagesText,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";");
    });

    const csv = [header.join(";"), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kampagnenranking_${selectedCampaign?.code || selectedCampaignId}.csv`;
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  };

  const resetDealerFilters = () => {
    setDealerSearch("");
    setKamFilter("");
    setDealerStatusFilter("all");
    setSortMode("messeRevenue");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Kampagnenreport</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Umsatz, Mengen, Händler, Bonus-Status und Kampagnen-Fortschritt.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadReport}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>

          <Button type="button" onClick={exportCsv} disabled={!approvedRows.length}>
            <Download className="mr-2 h-4 w-4" />
            Positionen CSV
          </Button>

          <Button
            type="button"
            onClick={exportDealerRankingCsv}
            disabled={!filteredDealerRows.length}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Händler-Ranking CSV
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kampagne
            </label>

            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.campaign_id} value={String(campaign.campaign_id)}>
                  {campaign.name} {campaign.code ? `(${campaign.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start
            </label>
            <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {formatDate(selectedCampaign?.start_date)}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ende
            </label>
            <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              {formatDate(selectedCampaign?.end_date)}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Report wird geladen...
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {/* ===================== */}
            {/* 💰 UMSATZ BLOCK */}
            {/* ===================== */}
            <StatCard title="Total Umsatz" value={formatCurrency(totalRevenue)} />

            <StatCard title="Display Umsatz" value={formatCurrency(displayRevenue)} />

            <StatCard title="Messe Umsatz" value={formatCurrency(messeRevenue)} />

            <StatCard title="Standard Umsatz" value={formatCurrency(standardRevenue)} />


            {/* ===================== */}
            {/* 👥 HÄNDLER PERFORMANCE */}
            {/* ===================== */}
            <StatCard title="Aktive Händler" value={formatInteger(activeDealerCount)} />

            <StatCard
              title="Handlungsbedarf"
              value={formatInteger(needsActionDealerCount)}
              subtitle="noch keine approved Bestellung"
            />

            <StatCard
              title="Teilnahmequote"
              value={`${conversionRate.toFixed(1)}%`}
              subtitle={`${activeDealerCount} von ${dealerCampaignRows.length} aktiv`}
            />

            <StatCard
              title="Ø Umsatz / aktiver Händler"
              value={formatCurrency(avgRevenuePerActiveDealer)}
            />


            {/* ===================== */}
            {/* ⚙️ PROZESS / QUALITÄT */}
            {/* ===================== */}
            <StatCard title="Menge approved" value={formatInteger(totalQty)} />

            <StatCard title="Pending Positionen" value={formatInteger(pendingRows.length)} />

            <StatCard title="Rejected Positionen" value={formatInteger(rejectedRows.length)} />

            <StatCard
              title="Approval Quote"
              value={
                rows.length
                  ? `${((approvedRows.length / rows.length) * 100).toLocaleString(
                      "de-CH",
                      { maximumFractionDigits: 1 }
                    )}%`
                  : "–"
              }
            />
          </div>

          <Card className="rounded-2xl border border-gray-200 p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold">Kampagnen-Fortschritt</h2>
            </div>

            <CampaignProgressChart
              rows={rows}
              startDate={selectedCampaign?.start_date}
              endDate={selectedCampaign?.end_date}
              target={null}
            />
          </Card>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Top Produkte</h2>
              </div>

              <div className="space-y-3">
                {topProducts.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine Daten vorhanden.</p>
                ) : (
                  topProducts.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border bg-gray-50 p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {index + 1}. {item.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          Menge: {formatInteger(item.qty)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="rounded-2xl border border-gray-200 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Top Händler</h2>
              </div>

              <div className="space-y-3">
                {topDealers.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine Daten vorhanden.</p>
                ) : (
                  topDealers.map((item, index) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border bg-gray-50 p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {index + 1}. {item.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          Menge: {formatInteger(item.qty)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <Card className="rounded-2xl border border-gray-200 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold">Händler-Ranking Kampagne</h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {filteredDealerRows.length} von {dealerCampaignRows.length} Händlern
                  angezeigt.
                </p>
              </div>

              <Button type="button" variant="outline" onClick={resetDealerFilters}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Filter zurücksetzen
              </Button>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-[1.2fr_220px_220px_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  value={dealerSearch}
                  onChange={(event) => setDealerSearch(event.target.value)}
                  placeholder="Händler, Login, KAM oder Ort suchen..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={kamFilter}
                onChange={(event) => setKamFilter(event.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle KAM</option>
                {kamOptions.map((kam) => (
                  <option key={kam} value={kam}>
                    {kam}
                  </option>
                ))}
              </select>

              <select
                value={dealerStatusFilter}
                onChange={(event) =>
                  setDealerStatusFilter(
                    event.target.value as "all" | "active" | "needsAction"
                  )
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alle Händler</option>
                <option value="active">Nur mit Bestellung</option>
                <option value="needsAction">Nur Handlungsbedarf</option>
              </select>

              <select
                value={sortMode}
                onChange={(event) =>
                  setSortMode(
                    event.target.value as
                      | "messeRevenue"
                      | "totalRevenue"
                      | "bonusAmount"
                      | "dealerName"
                  )
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="messeRevenue">Sortierung: Messeumsatz</option>
                <option value="totalRevenue">Sortierung: Gesamtumsatz</option>
                <option value="bonusAmount">Sortierung: Bonusbetrag</option>
                <option value="dealerName">Sortierung: Händlername</option>
              </select>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              <Filter className="h-4 w-4" />
              Tipp: Filtere nach Handlungsbedarf für schnelle KAM-Follow-ups.
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">Rang</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Händler</th>
                    <th className="px-3 py-2">KAM</th>
                    <th className="px-3 py-2">Kampagnenumsatz</th>
                    <th className="px-3 py-2">Messeumsatz</th>
                    <th className="px-3 py-2">Display</th>
                    <th className="px-3 py-2">Bonus-Stufen</th>
                    <th className="px-3 py-2">Aktueller Bonus</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDealerRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-3 py-6 text-sm text-gray-500">
                        Keine Händlerdaten mit diesen Filtern vorhanden.
                      </td>
                    </tr>
                  ) : (
                    filteredDealerRows.map((dealerRow, index) => {
                      const needsAction = dealerRow.totalRevenue === 0;

                      return (
                        <tr
                          key={dealerRow.dealerId}
                          className={`text-sm ${
                            needsAction ? "bg-red-50 text-red-800" : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {index + 1}
                          </td>

                          <td className="px-3 py-3">
                            {needsAction ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                                <AlertTriangle className="h-3 w-3" />
                                Handlungsbedarf
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                Bestellung vorhanden
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3">
                            <div className="font-semibold text-gray-900">
                              {dealerRow.dealerName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Login: {dealerRow.loginNr} · {dealerRow.city}
                            </div>
                          </td>

                          <td className="px-3 py-3">{dealerRow.kam}</td>

                          <td className="px-3 py-3 font-semibold text-gray-900">
                            {formatCurrency(dealerRow.totalRevenue)}
                          </td>

                          <td className="px-3 py-3 font-semibold text-emerald-700">
                            {formatCurrency(dealerRow.messeRevenue)}
                          </td>

                          <td className="px-3 py-3">
                            {formatCurrency(dealerRow.displayRevenue)}
                          </td>

                          <td className="px-3 py-3 min-w-[260px]">
                            {dealerRow.bonusStages.length === 0 ? (
                              "–"
                            ) : (
                              <div className="space-y-1">
                                {dealerRow.bonusStages.map((stage) => (
                                  <div
                                    key={stage.tierLevel}
                                    className={`rounded-md border px-2 py-1 text-xs ${
                                      stage.reached
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-gray-200 bg-white text-gray-600"
                                    }`}
                                  >
                                    <div className="font-medium">
                                      {stage.reached ? "✅" : "⬜"} {stage.label}
                                    </div>

                                    {!stage.reached && (
                                      <div className="mt-0.5 text-gray-500">
                                        Fehlt: {formatCurrency(stage.missing)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 font-medium text-gray-900">
                            {dealerRow.currentBonusLabel}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}