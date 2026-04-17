"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Save,
  Store,
  Tag,
  Clock3,
  BarChart3,
  MessageSquare,
  UserRound,
  XCircle,
  MonitorSmartphone,
  Trophy,
} from "lucide-react";

type DealerRow = {
  dealer_id: number;
  name: string | null;
  email: string | null;
  login_nr: string | null;
};

type DealerProfile = {
  profile_id: number;
  dealer_id: number;
  contact_person_name: string | null;
  contact_person_role: string | null;
  customer_type: string | null;
  region: string | null;
  partner_status: string | null;
  last_login_at: string | null;
  last_visit_date: string | null;
  birthdays_notes: string | null;
  personal_notes: string | null;
  general_notes: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

type DealerKpi = {
  kpi_id: number;
  dealer_id: number;
  sony_sales_q: number | null;
  total_sales_q: number | null;
  sony_share_percent: number | null;
  tv_total_all: number | null;
  tv_total_sony: number | null;
  tv_sony_share_percent: number | null;
  sb_total_all: number | null;
  sb_total_sony: number | null;
  sb_sony_share_percent: number | null;
  updated_at: string | null;
  updated_by: string | null;
};

type DealerTag = {
  tag_id: number;
  label: string;
  category: "interest" | "crm" | "custom";
  is_active: boolean;
  sort_order: number;
};

type DealerTagAssignmentRow = {
  tag_id: number;
};

type DealerTask = {
  task_id: number;
  dealer_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
  created_at: string;
  done_at: string | null;
};

type VisitReport = {
  visit_report_id: number;
  dealer_id: number;
  visit_date: string;
  visited_by: string | null;
  contact_persons: string | null;
  discussed: string | null;
  agreed: string | null;
  next_steps: string | null;
  open_points: string | null;
  what_went_well: string | null;
  what_went_less_well: string | null;
  competition_market_info: string | null;
  branding_visibility: string | null;
  created_at: string;
};

type DealerDisplayItem = {
  display_item_id: number;
  dealer_id: number;
  product_id: number | null;
  product_name_snapshot: string;
  ordered_as_display: boolean;
  ordered_qty: number | null;
  is_displayed: boolean | null;
  status: "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed";
  source_submission_item_id: number | null;
  display_checked_at: string | null;
  display_checked_by: string | null;
  removed_at: string | null;
  removed_by: string | null;
  note: string | null;
  created_at: string;
  created_by: string | null;
};

type AutoMetricRow = {
  item_id: number;
  product_id: number | null;
  sony_article: string | null;
  product_name: string | null;
  menge: number | null;
  preis: number | null;
  pricing_mode: string | null;
  is_display_item: boolean;
  submission_created_at: string | null;
  submission_datum: string | null;
  submission_status: string | null;
  submission_typ: string | null;
  dealer_id: number | null;
};

type PeriodMode =
  | "month"
  | "quarter"
  | "halfyear"
  | "year"
  | "ytd_calendar"
  | "ytd_fiscal";

type TopProduct = {
  label: string;
  qty: number;
  revenue: number;
};

const FISCAL_YEAR_START_MONTH = 4; // April = 1. Monat Geschäftsjahr

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

function Textarea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
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

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return `${Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} CHF`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return `${Number(value).toLocaleString("de-CH", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function formatInteger(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return Number(value).toLocaleString("de-CH", {
    maximumFractionDigits: 0,
  });
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function shiftOneYear(date: Date) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - 1);
  return d;
}

function getPeriodLabel(periodMode: PeriodMode) {
  switch (periodMode) {
    case "month":
      return "Monat";
    case "quarter":
      return "Quartal";
    case "halfyear":
      return "Halbjahr";
    case "year":
      return "Jahr";
    case "ytd_calendar":
      return "YTD Kalenderjahr";
    case "ytd_fiscal":
      return "YTD Fiscal Year";
    default:
      return "Zeitraum";
  }
}

function getDateRange(periodMode: PeriodMode, now = new Date()) {
  const current = new Date(now);
  const year = current.getFullYear();
  const month = current.getMonth() + 1; // 1-12

  let start: Date;
  let end = endOfDay(current);

  if (periodMode === "month") {
    start = new Date(year, current.getMonth(), 1);
  } else if (periodMode === "quarter") {
    const quarterStartMonth = Math.floor(current.getMonth() / 3) * 3;
    start = new Date(year, quarterStartMonth, 1);
  } else if (periodMode === "halfyear") {
    const halfStartMonth = current.getMonth() < 6 ? 0 : 6;
    start = new Date(year, halfStartMonth, 1);
  } else if (periodMode === "year") {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31, 23, 59, 59, 999);
  } else if (periodMode === "ytd_calendar") {
    start = new Date(year, 0, 1);
  } else {
    const fyStartYear = month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
    start = new Date(fyStartYear, FISCAL_YEAR_START_MONTH - 1, 1);
  }

  return {
    start: startOfDay(start),
    end,
  };
}

function isDateWithin(dateValue: string | null | undefined, start: Date, end: Date) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  return d >= start && d <= end;
}

export default function AdminDealerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const dealerId = Number(params?.dealerId);

  const [loading, setLoading] = useState(true);
  const [savingMain, setSavingMain] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [addingVisit, setAddingVisit] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [addingDisplayItem, setAddingDisplayItem] = useState(false);
  const [loadingAutoKpis, setLoadingAutoKpis] = useState(false);

  const [dealer, setDealer] = useState<DealerRow | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [kpiId, setKpiId] = useState<number | null>(null);

  const [allTags, setAllTags] = useState<DealerTag[]>([]);
  const [assignedTagIds, setAssignedTagIds] = useState<number[]>([]);
  const [tasks, setTasks] = useState<DealerTask[]>([]);
  const [visits, setVisits] = useState<VisitReport[]>([]);
  const [displayItems, setDisplayItems] = useState<DealerDisplayItem[]>([]);

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<"interest" | "crm">("crm");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("quarter");

  const [autoSonyRevenue, setAutoSonyRevenue] = useState(0);
  const [autoSonyRevenuePrevYear, setAutoSonyRevenuePrevYear] = useState(0);
  const [autoDisplayOrderCount, setAutoDisplayOrderCount] = useState(0);
  const [autoPositionsCount, setAutoPositionsCount] = useState(0);
  const [autoTopProducts, setAutoTopProducts] = useState<TopProduct[]>([]);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const [profileForm, setProfileForm] = useState({
    contact_person_name: "",
    contact_person_role: "",
    customer_type: "",
    region: "",
    partner_status: "",
    last_login_at: "",
    last_visit_date: "",
    birthdays_notes: "",
    personal_notes: "",
    general_notes: "",
  });

  const [kpiForm, setKpiForm] = useState({
    total_sales_q: "",
    tv_total_all: "",
    tv_total_sony: "",
    sb_total_all: "",
    sb_total_sony: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });

  const [visitForm, setVisitForm] = useState({
    visit_date: new Date().toISOString().slice(0, 10),
    visited_by: "",
    contact_persons: "",
    discussed: "",
    agreed: "",
    next_steps: "",
    open_points: "",
    what_went_well: "",
    what_went_less_well: "",
    competition_market_info: "",
    branding_visibility: "",
  });

  const [displayForm, setDisplayForm] = useState({
    product_name_snapshot: "",
    ordered_qty: "1",
    is_displayed: "yes" as "yes" | "no" | "unknown",
    note: "",
  });

  const marketTotalSales = useMemo(() => {
    const n = Number(kpiForm.total_sales_q?.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }, [kpiForm.total_sales_q]);

  const tvTotalAll = useMemo(() => {
    const n = parseInt(kpiForm.tv_total_all || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [kpiForm.tv_total_all]);

  const tvTotalSony = useMemo(() => {
    const n = parseInt(kpiForm.tv_total_sony || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [kpiForm.tv_total_sony]);

  const sbTotalAll = useMemo(() => {
    const n = parseInt(kpiForm.sb_total_all || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [kpiForm.sb_total_all]);

  const sbTotalSony = useMemo(() => {
    const n = parseInt(kpiForm.sb_total_sony || "0", 10);
    return Number.isFinite(n) ? n : 0;
  }, [kpiForm.sb_total_sony]);

  const sonySharePercentComputed = useMemo(() => {
    if (!marketTotalSales || marketTotalSales <= 0) return null;
    return (autoSonyRevenue / marketTotalSales) * 100;
  }, [autoSonyRevenue, marketTotalSales]);

  const tvSharePercentComputed = useMemo(() => {
    if (!tvTotalAll || tvTotalAll <= 0) return null;
    return (tvTotalSony / tvTotalAll) * 100;
  }, [tvTotalSony, tvTotalAll]);

  const sbSharePercentComputed = useMemo(() => {
    if (!sbTotalAll || sbTotalAll <= 0) return null;
    return (sbTotalSony / sbTotalAll) * 100;
  }, [sbTotalSony, sbTotalAll]);

  const yoyPercent = useMemo(() => {
    if (!autoSonyRevenuePrevYear || autoSonyRevenuePrevYear <= 0) return null;
    return ((autoSonyRevenue - autoSonyRevenuePrevYear) / autoSonyRevenuePrevYear) * 100;
  }, [autoSonyRevenue, autoSonyRevenuePrevYear]);

  const displayActiveCount = useMemo(
    () =>
      displayItems.filter(
        (item) => item.status === "ordered" || item.status === "displayed"
      ).length,
    [displayItems]
  );

  const displayDisplayedCount = useMemo(
    () => displayItems.filter((item) => item.status === "displayed").length,
    [displayItems]
  );

  const loadData = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [
        dealerRes,
        profileRes,
        kpiRes,
        tagsRes,
        assignmentsRes,
        tasksRes,
        visitsRes,
        displayItemsRes,
      ] = await Promise.all([
        supabase
          .from("dealers")
          .select("dealer_id, name, email, login_nr")
          .eq("dealer_id", dealerId)
          .single(),
        supabase
          .from("dealer_profiles")
          .select("*")
          .eq("dealer_id", dealerId)
          .maybeSingle(),
        supabase
          .from("dealer_kpis")
          .select("*")
          .eq("dealer_id", dealerId)
          .maybeSingle(),
        supabase
          .from("dealer_tags")
          .select("tag_id, label, category, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("label", { ascending: true }),
        supabase
          .from("dealer_tag_assignments")
          .select("tag_id")
          .eq("dealer_id", dealerId),
        supabase
          .from("dealer_tasks")
          .select("*")
          .eq("dealer_id", dealerId)
          .order("created_at", { ascending: false }),
        supabase
          .from("dealer_visit_reports")
          .select("*")
          .eq("dealer_id", dealerId)
          .order("visit_date", { ascending: false })
          .order("created_at", { ascending: false }),
        supabase
          .from("dealer_display_items")
          .select("*")
          .eq("dealer_id", dealerId)
          .order("created_at", { ascending: false }),
      ]);

      if (dealerRes.error) throw dealerRes.error;
      if (profileRes.error) throw profileRes.error;
      if (kpiRes.error) throw kpiRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (visitsRes.error) throw visitsRes.error;
      if (displayItemsRes.error) throw displayItemsRes.error;

      setDealer(dealerRes.data as DealerRow);

      const profile = profileRes.data as DealerProfile | null;
      if (profile) {
        setProfileId(profile.profile_id);
        setProfileForm({
          contact_person_name: profile.contact_person_name ?? "",
          contact_person_role: profile.contact_person_role ?? "",
          customer_type: profile.customer_type ?? "",
          region: profile.region ?? "",
          partner_status: profile.partner_status ?? "",
          last_login_at: profile.last_login_at
            ? new Date(profile.last_login_at).toISOString().slice(0, 16)
            : "",
          last_visit_date: profile.last_visit_date ?? "",
          birthdays_notes: profile.birthdays_notes ?? "",
          personal_notes: profile.personal_notes ?? "",
          general_notes: profile.general_notes ?? "",
        });
      } else {
        setProfileId(null);
      }

      const kpi = kpiRes.data as DealerKpi | null;
      if (kpi) {
        setKpiId(kpi.kpi_id);
        setKpiForm({
          total_sales_q: kpi.total_sales_q?.toString() ?? "",
          tv_total_all: kpi.tv_total_all?.toString() ?? "",
          tv_total_sony: kpi.tv_total_sony?.toString() ?? "",
          sb_total_all: kpi.sb_total_all?.toString() ?? "",
          sb_total_sony: kpi.sb_total_sony?.toString() ?? "",
        });
      } else {
        setKpiId(null);
      }

      setAllTags((tagsRes.data ?? []) as DealerTag[]);
      setAssignedTagIds(
        ((assignmentsRes.data ?? []) as DealerTagAssignmentRow[]).map((x) =>
          Number(x.tag_id)
        )
      );
      setTasks((tasksRes.data ?? []) as DealerTask[]);
      setVisits((visitsRes.data ?? []) as VisitReport[]);
      setDisplayItems((displayItemsRes.data ?? []) as DealerDisplayItem[]);
    } catch (error) {
      console.error("Fehler beim Laden CRM:", error);
      showToast("error", "CRM-Daten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [dealerId, supabase]);

  const syncDisplayItemsFromOrders = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) return;

    try {
      const { data: displayOrderItems, error } = await supabase
        .from("submission_items")
        .select(`
          item_id,
          product_id,
          product_name,
          sony_article,
          menge,
          pricing_mode,
          is_display_item,
          submission:submission_id (
            submission_id,
            dealer_id
          )
        `)
        .or("pricing_mode.eq.display,is_display_item.eq.true");

      if (error) {
        console.error("Fehler beim Laden Display-Bestellungen:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      const rows = (displayOrderItems || []).filter((row: any) => {
        const submission = Array.isArray(row.submission)
          ? row.submission[0]
          : row.submission;

        return Number(submission?.dealer_id) === Number(dealerId);
      });

      if (!rows.length) return;

      const sourceIds = rows.map((row: any) => Number(row.item_id)).filter(Boolean);

      const { data: existingItems, error: existingError } = await supabase
        .from("dealer_display_items")
        .select("source_submission_item_id")
        .eq("dealer_id", dealerId)
        .in("source_submission_item_id", sourceIds);

      if (existingError) {
        console.error("Fehler beim Laden bestehender Display-Tracker-Einträge:", {
          message: existingError.message,
          details: existingError.details,
          hint: existingError.hint,
          code: existingError.code,
        });
        return;
      }

      const existingIds = new Set(
        (existingItems || [])
          .map((item: any) => item.source_submission_item_id)
          .filter(Boolean)
          .map((id: any) => Number(id))
      );

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const inserts = rows
        .filter((row: any) => !existingIds.has(Number(row.item_id)))
        .map((row: any) => ({
          dealer_id: dealerId,
          source_submission_item_id: Number(row.item_id),
          product_id: row.product_id ?? null,
          product_name_snapshot:
            row.sony_article || row.product_name || `Artikel #${row.item_id}`,
          ordered_as_display: true,
          ordered_qty: row.menge ?? 1,
          is_displayed: null,
          status: "ordered",
          note: null,
          created_by: currentUser,
        }));

      if (!inserts.length) return;

      const { error: insertError } = await supabase
        .from("dealer_display_items")
        .insert(inserts);

      if (insertError) {
        console.error("Fehler beim Sync der Display-Tracker-Einträge:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
          inserts,
        });
      }
    } catch (error) {
      console.error("Unbekannter Fehler beim Display-Sync:", error);
    }
  }, [dealerId, supabase]);

  const loadAutoKpis = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) return;

    setLoadingAutoKpis(true);

    try {
      const { start, end } = getDateRange(periodMode);
      const prevYearStart = shiftOneYear(start);
      const prevYearEnd = shiftOneYear(end);

      const { data, error } = await supabase
        .from("submission_items")
        .select(`
          item_id,
          product_id,
          sony_article,
          product_name,
          menge,
          preis,
          pricing_mode,
          is_display_item,
          submission:submission_id (
            dealer_id,
            typ,
            status,
            created_at,
            datum
          )
        `);

      if (error) {
        console.error("Auto KPI Fehler beim Laden:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      const rows: AutoMetricRow[] = (data || [])
        .map((row: any) => {
          const submission = Array.isArray(row.submission)
            ? row.submission[0]
            : row.submission;

          return {
            item_id: Number(row.item_id),
            product_id: row.product_id ?? null,
            sony_article: row.sony_article ?? null,
            product_name: row.product_name ?? null,
            menge: row.menge ?? 0,
            preis: row.preis ?? 0,
            pricing_mode: row.pricing_mode ?? null,
            is_display_item: Boolean(row.is_display_item),
            submission_created_at: submission?.created_at ?? null,
            submission_datum: submission?.datum ?? null,
            submission_status: submission?.status ?? null,
            submission_typ: submission?.typ ?? null,
            dealer_id: submission?.dealer_id ?? null,
          };
        })
        .filter((row) => Number(row.dealer_id) === Number(dealerId))
        .filter((row) => row.submission_typ === "bestellung")
        .filter((row) => String(row.submission_status || "").toLowerCase() !== "rejected");

      const currentRows = rows.filter((row) => {
        const compareDate = row.submission_created_at || row.submission_datum;
        return isDateWithin(compareDate, start, end);
      });

      const prevYearRows = rows.filter((row) => {
        const compareDate = row.submission_created_at || row.submission_datum;
        return isDateWithin(compareDate, prevYearStart, prevYearEnd);
      });

      const currentSonyRevenue = currentRows.reduce(
        (sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0),
        0
      );

      const prevSonyRevenue = prevYearRows.reduce(
        (sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0),
        0
      );

      const currentDisplayOrders = currentRows.filter(
        (row) => row.pricing_mode === "display" || row.is_display_item === true
      ).length;

      const currentPositions = currentRows.length;

      const productMap = new Map<string, TopProduct>();

      for (const row of currentRows) {
        const label =
          row.sony_article ||
          row.product_name ||
          (row.product_id ? `Produkt #${row.product_id}` : `Item #${row.item_id}`);

        if (!productMap.has(label)) {
          productMap.set(label, {
            label,
            qty: 0,
            revenue: 0,
          });
        }

        const current = productMap.get(label)!;
        current.qty += Number(row.menge ?? 0);
        current.revenue += Number(row.menge ?? 0) * Number(row.preis ?? 0);
      }

      const topProducts = [...productMap.values()]
        .sort((a, b) => {
          if (b.revenue !== a.revenue) return b.revenue - a.revenue;
          return b.qty - a.qty;
        })
        .slice(0, 3);

      setAutoSonyRevenue(currentSonyRevenue);
      setAutoSonyRevenuePrevYear(prevSonyRevenue);
      setAutoDisplayOrderCount(currentDisplayOrders);
      setAutoPositionsCount(currentPositions);
      setAutoTopProducts(topProducts);
    } catch (error) {
      console.error("Unbekannter Fehler Auto KPI:", error);
    } finally {
      setLoadingAutoKpis(false);
    }
  }, [dealerId, periodMode, supabase]);

  useEffect(() => {
    const run = async () => {
      await syncDisplayItemsFromOrders();
      await loadData();
    };

    run();
  }, [loadData, syncDisplayItemsFromOrders]);

  useEffect(() => {
    loadAutoKpis();
  }, [loadAutoKpis]);

  const interestTags = useMemo(
    () => allTags.filter((tag) => tag.category === "interest"),
    [allTags]
  );

  const crmTags = useMemo(
    () => allTags.filter((tag) => tag.category === "crm" || tag.category === "custom"),
    [allTags]
  );

  const selectedInterestTags = useMemo(
    () => interestTags.filter((tag) => assignedTagIds.includes(Number(tag.tag_id))),
    [interestTags, assignedTagIds]
  );

  const selectedCrmTags = useMemo(
    () => crmTags.filter((tag) => assignedTagIds.includes(Number(tag.tag_id))),
    [crmTags, assignedTagIds]
  );

  const openTasks = useMemo(
    () => tasks.filter((task) => task.status === "open"),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((task) => task.status === "done"),
    [tasks]
  );
  const cancelledTasks = useMemo(
    () => tasks.filter((task) => task.status === "cancelled"),
    [tasks]
  );

  const saveMainData = async () => {
    if (!dealerId || Number.isNaN(dealerId)) {
      showToast("error", "Ungültige Händler-ID.");
      return;
    }

    try {
      setSavingMain(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const profilePayload = {
        dealer_id: dealerId,
        contact_person_name: profileForm.contact_person_name || null,
        contact_person_role: profileForm.contact_person_role || null,
        customer_type: profileForm.customer_type || null,
        region: profileForm.region || null,
        partner_status: profileForm.partner_status || null,
        last_login_at: profileForm.last_login_at || null,
        last_visit_date: profileForm.last_visit_date || null,
        birthdays_notes: profileForm.birthdays_notes || null,
        personal_notes: profileForm.personal_notes || null,
        general_notes: profileForm.general_notes || null,
        updated_by: currentUser,
      };

      if (profileId) {
        const { error } = await supabase
          .from("dealer_profiles")
          .update(profilePayload)
          .eq("profile_id", profileId);

        if (error) {
          console.error("dealer_profiles update error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("dealer_profiles")
          .insert(profilePayload)
          .select("profile_id")
          .single();

        if (error) {
          console.error("dealer_profiles insert error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        setProfileId(Number(data.profile_id));
      }

      const toNumberOrNull = (value: string) => {
        if (!value.trim()) return null;
        const n = Number(value.replace(",", "."));
        return Number.isFinite(n) ? n : null;
      };

      const toIntOrNull = (value: string) => {
        if (!value.trim()) return null;
        const n = parseInt(value, 10);
        return Number.isFinite(n) ? n : null;
      };

      const kpiPayload = {
        dealer_id: dealerId,
        sony_sales_q: autoSonyRevenue || null,
        total_sales_q: toNumberOrNull(kpiForm.total_sales_q),
        sony_share_percent: sonySharePercentComputed,
        tv_total_all: toIntOrNull(kpiForm.tv_total_all),
        tv_total_sony: toIntOrNull(kpiForm.tv_total_sony),
        tv_sony_share_percent: tvSharePercentComputed,
        sb_total_all: toIntOrNull(kpiForm.sb_total_all),
        sb_total_sony: toIntOrNull(kpiForm.sb_total_sony),
        sb_sony_share_percent: sbSharePercentComputed,
        updated_by: currentUser,
      };

      if (kpiId) {
        const { error } = await supabase
          .from("dealer_kpis")
          .update(kpiPayload)
          .eq("kpi_id", kpiId);

        if (error) {
          console.error("dealer_kpis update error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("dealer_kpis")
          .insert(kpiPayload)
          .select("kpi_id")
          .single();

        if (error) {
          console.error("dealer_kpis insert error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }

        setKpiId(Number(data.kpi_id));
      }

      showToast("success", "Händlerakte gespeichert.");
      await loadData();
      await loadAutoKpis();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      showToast("error", "Händlerakte konnte nicht gespeichert werden.");
    } finally {
      setSavingMain(false);
    }
  };

  const toggleTag = async (tagId: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const alreadyAssigned = assignedTagIds.includes(tagId);

      if (alreadyAssigned) {
        const { error } = await supabase
          .from("dealer_tag_assignments")
          .delete()
          .eq("dealer_id", dealerId)
          .eq("tag_id", tagId);

        if (error) throw error;

        setAssignedTagIds((prev) => prev.filter((id) => id !== tagId));
      } else {
        const { error } = await supabase.from("dealer_tag_assignments").insert({
          dealer_id: dealerId,
          tag_id: tagId,
          created_by: currentUser,
        });

        if (error) throw error;

        setAssignedTagIds((prev) => [...prev, tagId]);
      }
    } catch (error) {
      console.error("Fehler beim Umschalten Tag:", error);
      showToast("error", "Tag konnte nicht gespeichert werden.");
    }
  };

  const createCustomTag = async () => {
    const label = newTagLabel.trim();

    if (!label) {
      showToast("error", "Bitte zuerst einen Tag-Namen eingeben.");
      return;
    }

    try {
      setCreatingTag(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const existingTag = allTags.find(
        (tag) => tag.label.trim().toLowerCase() === label.toLowerCase()
      );

      if (existingTag) {
        const alreadyAssigned = assignedTagIds.includes(Number(existingTag.tag_id));

        if (!alreadyAssigned) {
          const { error: assignError } = await supabase
            .from("dealer_tag_assignments")
            .insert({
              dealer_id: dealerId,
              tag_id: existingTag.tag_id,
              created_by: currentUser,
            });

          if (assignError) throw assignError;

          setAssignedTagIds((prev) => [...prev, Number(existingTag.tag_id)]);
        }

        setNewTagLabel("");
        setNewTagCategory("crm");
        showToast("success", "Vorhandener Tag wurde zugeordnet.");
        return;
      }

      const categoryToSave: "interest" | "crm" = newTagCategory;

      const { data: insertedTag, error: tagError } = await supabase
        .from("dealer_tags")
        .insert({
          label,
          category: categoryToSave,
          is_active: true,
          sort_order: 9999,
          created_by: currentUser,
        })
        .select("tag_id, label, category, is_active, sort_order")
        .single();

      if (tagError) {
        console.error("dealer_tags insert error:", {
          message: tagError.message,
          details: tagError.details,
          hint: tagError.hint,
          code: tagError.code,
        });
        throw tagError;
      }

      const tag = insertedTag as DealerTag;

      const { error: assignError } = await supabase
        .from("dealer_tag_assignments")
        .insert({
          dealer_id: dealerId,
          tag_id: tag.tag_id,
          created_by: currentUser,
        });

      if (assignError) {
        console.error("dealer_tag_assignments insert error:", {
          message: assignError.message,
          details: assignError.details,
          hint: assignError.hint,
          code: assignError.code,
        });
        throw assignError;
      }

      setAllTags((prev) =>
        [...prev, tag].sort((a, b) => {
          if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
          return a.label.localeCompare(b.label, "de-CH");
        })
      );

      setAssignedTagIds((prev) => [...prev, Number(tag.tag_id)]);
      setNewTagLabel("");
      setNewTagCategory("crm");

      showToast("success", "Neuer Tag erstellt und zugeordnet.");
    } catch (error) {
      console.error("Fehler beim Erstellen Tag:", {
        message: (error as { message?: string })?.message,
        details: (error as { details?: string })?.details,
        hint: (error as { hint?: string })?.hint,
        code: (error as { code?: string })?.code,
        raw: error,
      });
      showToast("error", "Tag konnte nicht erstellt werden.");
    } finally {
      setCreatingTag(false);
    }
  };

  const addTask = async () => {
    if (!dealerId || Number.isNaN(dealerId)) {
      showToast("error", "Ungültige Händler-ID.");
      return;
    }

    if (!taskForm.title.trim()) {
      showToast("error", "Bitte einen Task-Titel eingeben.");
      return;
    }

    try {
      setAddingTask(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const { error } = await supabase.from("dealer_tasks").insert({
        dealer_id: dealerId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || null,
        due_date: taskForm.due_date || null,
        status: "open",
        created_by: currentUser,
      });

      if (error) throw error;

      setTaskForm({
        title: "",
        description: "",
        due_date: "",
      });

      showToast("success", "Task hinzugefügt.");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Hinzufügen Task:", error);
      showToast("error", "Task konnte nicht gespeichert werden.");
    } finally {
      setAddingTask(false);
    }
  };

  const updateTaskStatus = async (
    taskId: number,
    status: "open" | "done" | "cancelled"
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const payload: Record<string, string | null> = {
        status,
        done_at: null,
        done_by: null,
      };

      if (status === "done") {
        payload.done_at = new Date().toISOString();
        payload.done_by = currentUser;
      }

      const { error } = await supabase
        .from("dealer_tasks")
        .update(payload)
        .eq("task_id", taskId);

      if (error) throw error;

      showToast("success", "Task aktualisiert.");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Aktualisieren Task:", error);
      showToast("error", "Task konnte nicht aktualisiert werden.");
    }
  };

  const addVisit = async () => {
    try {
      setAddingVisit(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const { error } = await supabase.from("dealer_visit_reports").insert({
        dealer_id: dealerId,
        visit_date: visitForm.visit_date || new Date().toISOString().slice(0, 10),
        visited_by: visitForm.visited_by || null,
        contact_persons: visitForm.contact_persons || null,
        discussed: visitForm.discussed || null,
        agreed: visitForm.agreed || null,
        next_steps: visitForm.next_steps || null,
        open_points: visitForm.open_points || null,
        what_went_well: visitForm.what_went_well || null,
        what_went_less_well: visitForm.what_went_less_well || null,
        competition_market_info: visitForm.competition_market_info || null,
        branding_visibility: visitForm.branding_visibility || null,
        created_by: currentUser,
      });

      if (error) throw error;

      setVisitForm({
        visit_date: new Date().toISOString().slice(0, 10),
        visited_by: "",
        contact_persons: "",
        discussed: "",
        agreed: "",
        next_steps: "",
        open_points: "",
        what_went_well: "",
        what_went_less_well: "",
        competition_market_info: "",
        branding_visibility: "",
      });

      showToast("success", "Besuchsbericht gespeichert.");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Speichern Besuch:", error);
      showToast("error", "Besuchsbericht konnte nicht gespeichert werden.");
    } finally {
      setAddingVisit(false);
    }
  };

  const addDisplayItem = async () => {
    const productName = displayForm.product_name_snapshot.trim();

    if (!productName) {
      showToast("error", "Bitte zuerst einen Produktnamen eingeben.");
      return;
    }

    try {
      setAddingDisplayItem(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const qty = parseInt(displayForm.ordered_qty || "0", 10);

      const { error } = await supabase.from("dealer_display_items").insert({
        dealer_id: dealerId,
        product_name_snapshot: productName,
        ordered_as_display: true,
        ordered_qty: Number.isFinite(qty) ? qty : 1,
        is_displayed:
          displayForm.is_displayed === "yes"
            ? true
            : displayForm.is_displayed === "no"
            ? false
            : null,
        status:
          displayForm.is_displayed === "yes"
            ? "displayed"
            : displayForm.is_displayed === "no"
            ? "not_displayed"
            : "ordered",
        display_checked_at: new Date().toISOString(),
        display_checked_by: currentUser,
        note: displayForm.note.trim() || null,
        created_by: currentUser,
      });

      if (error) {
        console.error("dealer_display_items insert error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      setDisplayForm({
        product_name_snapshot: "",
        ordered_qty: "1",
        is_displayed: "yes",
        note: "",
      });

      showToast("success", "Display-Produkt gespeichert.");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Speichern Display-Produkt:", error);
      showToast("error", "Display-Produkt konnte nicht gespeichert werden.");
    } finally {
      setAddingDisplayItem(false);
    }
  };

  const updateDisplayStatus = async (
    displayItemId: number,
    nextStatus: "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed"
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const payload: Record<string, unknown> = {
        status: nextStatus,
        display_checked_at: new Date().toISOString(),
        display_checked_by: currentUser,
      };

      if (nextStatus === "displayed") {
        payload.is_displayed = true;
        payload.removed_at = null;
        payload.removed_by = null;
      } else if (nextStatus === "not_displayed") {
        payload.is_displayed = false;
        payload.removed_at = null;
        payload.removed_by = null;
      } else if (nextStatus === "sold_off" || nextStatus === "removed") {
        payload.is_displayed = false;
        payload.removed_at = new Date().toISOString();
        payload.removed_by = currentUser;
      } else {
        payload.is_displayed = null;
        payload.removed_at = null;
        payload.removed_by = null;
      }

      const { error } = await supabase
        .from("dealer_display_items")
        .update(payload)
        .eq("display_item_id", displayItemId);

      if (error) {
        console.error("dealer_display_items update error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      showToast("success", "Display-Status aktualisiert.");
      await loadData();
    } catch (error) {
      console.error("Fehler beim Aktualisieren Display-Status:", error);
      showToast("error", "Display-Status konnte nicht aktualisiert werden.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Händlerakte wird geladen...
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="p-6">
        <div className="rounded-xl border bg-white p-4 text-sm text-red-600">
          Händler nicht gefunden.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 md:p-6">
      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-gray-900">
              <Store className="h-5 w-5 text-indigo-600" />
              <h1 className="text-xl font-semibold">Händlerakte</h1>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-gray-600 md:grid-cols-2">
              <p>
                <span className="font-medium text-gray-800">Händler:</span>{" "}
                {dealer.name ?? "-"}
              </p>
              <p>
                <span className="font-medium text-gray-800">Dealer ID:</span>{" "}
                {dealer.dealer_id}
              </p>
              <p>
                <span className="font-medium text-gray-800">Login:</span>{" "}
                {dealer.login_nr ?? "-"}
              </p>
              <p>
                <span className="font-medium text-gray-800">E-Mail:</span>{" "}
                {dealer.email ?? "-"}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {selectedInterestTags.slice(0, 5).map((tag) => (
                <span
                  key={tag.tag_id}
                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100"
                >
                  {tag.label}
                </span>
              ))}
              {selectedCrmTags.slice(0, 5).map((tag) => (
                <span
                  key={tag.tag_id}
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>

            <Button type="button" onClick={saveMainData} disabled={savingMain}>
              {savingMain ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Händlerakte speichern
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold">Auto KPI</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Zeitraum</span>
            <select
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="month">Monat</option>
              <option value="quarter">Quartal</option>
              <option value="halfyear">Halbjahr</option>
              <option value="year">Jahr</option>
              <option value="ytd_calendar">YTD Kalenderjahr</option>
              <option value="ytd_fiscal">YTD Fiscal Year</option>
            </select>
          </div>
        </div>

        {loadingAutoKpis ? (
          <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Auto KPI werden geladen...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                title="Sony Umsatz"
                value={formatCurrency(autoSonyRevenue)}
                subtitle={getPeriodLabel(periodMode)}
              />
              <StatCard
                title="Vorjahr gleicher Zeitraum"
                value={formatCurrency(autoSonyRevenuePrevYear)}
                subtitle="YoY Vergleich"
              />
              <StatCard
                title="Veränderung zum Vorjahr"
                value={formatPercent(yoyPercent)}
                subtitle="Sony Umsatz YoY"
              />
              <StatCard
                title="Display-Bestellungen"
                value={formatInteger(autoDisplayOrderCount)}
                subtitle={getPeriodLabel(periodMode)}
              />
              <StatCard
                title="Bestellpositionen"
                value={formatInteger(autoPositionsCount)}
                subtitle={getPeriodLabel(periodMode)}
              />
              <StatCard
                title="Displays aktiv"
                value={formatInteger(displayActiveCount)}
                subtitle={`${formatInteger(displayDisplayedCount)} ausgestellt`}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-3">
              {[0, 1, 2].map((idx) => {
                const product = autoTopProducts[idx];
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Top Produkt {idx + 1}
                    </div>
                    <div className="mt-2 text-base font-semibold text-gray-900">
                      {product?.label || "–"}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Menge: {product ? formatInteger(product.qty) : "–"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Umsatz: {product ? formatCurrency(product.revenue) : "–"}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold">Markt / POS Snapshot</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Umsatz Total Markt"
            value={formatCurrency(marketTotalSales || null)}
            subtitle="manuell gepflegt"
          />
          <StatCard
            title="Umsatz Sony"
            value={formatCurrency(autoSonyRevenue || null)}
            subtitle={`auto · ${getPeriodLabel(periodMode)}`}
          />
          <StatCard
            title="Anteil Sony"
            value={formatPercent(sonySharePercentComputed)}
            subtitle="automatisch berechnet"
          />
          <StatCard
            title="TV ausgestellt Total"
            value={formatInteger(tvTotalAll || null)}
          />
          <StatCard
            title="TV ausgestellt Sony"
            value={formatInteger(tvTotalSony || null)}
          />
          <StatCard
            title="TV Anteil Sony"
            value={formatPercent(tvSharePercentComputed)}
            subtitle="automatisch berechnet"
          />
          <StatCard
            title="SB ausgestellt Total"
            value={formatInteger(sbTotalAll || null)}
          />
          <StatCard
            title="SB ausgestellt Sony"
            value={formatInteger(sbTotalSony || null)}
          />
          <StatCard
            title="SB Anteil Sony"
            value={formatPercent(sbSharePercentComputed)}
            subtitle="automatisch berechnet"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div>
            <FieldLabel>Umsatz Total Markt</FieldLabel>
            <Input
              value={kpiForm.total_sales_q}
              onChange={(e) =>
                setKpiForm((prev) => ({ ...prev, total_sales_q: e.target.value }))
              }
              placeholder="z. B. 250000"
            />
          </div>
          <div>
            <FieldLabel>Umsatz Sony</FieldLabel>
            <Input value={formatCurrency(autoSonyRevenue)} disabled />
          </div>
          <div>
            <FieldLabel>Anteil Sony (%)</FieldLabel>
            <Input value={formatPercent(sonySharePercentComputed)} disabled />
          </div>

          <div>
            <FieldLabel>TV ausgestellt Total</FieldLabel>
            <Input
              value={kpiForm.tv_total_all}
              onChange={(e) =>
                setKpiForm((prev) => ({ ...prev, tv_total_all: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>TV ausgestellt Sony</FieldLabel>
            <Input
              value={kpiForm.tv_total_sony}
              onChange={(e) =>
                setKpiForm((prev) => ({ ...prev, tv_total_sony: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>TV Anteil Sony (%)</FieldLabel>
            <Input value={formatPercent(tvSharePercentComputed)} disabled />
          </div>

          <div>
            <FieldLabel>SB ausgestellt Total</FieldLabel>
            <Input
              value={kpiForm.sb_total_all}
              onChange={(e) =>
                setKpiForm((prev) => ({ ...prev, sb_total_all: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>SB ausgestellt Sony</FieldLabel>
            <Input
              value={kpiForm.sb_total_sony}
              onChange={(e) =>
                setKpiForm((prev) => ({ ...prev, sb_total_sony: e.target.value }))
              }
            />
          </div>
          <div>
            <FieldLabel>SB Anteil Sony (%)</FieldLabel>
            <Input value={formatPercent(sbSharePercentComputed)} disabled />
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 flex items-center gap-2">
          <MonitorSmartphone className="h-5 w-5 text-sky-600" />
          <h2 className="text-lg font-semibold">Display-Tracker</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_120px_180px_1fr_auto]">
          <div>
            <FieldLabel>Produkt</FieldLabel>
            <Input
              value={displayForm.product_name_snapshot}
              onChange={(e) =>
                setDisplayForm((prev) => ({
                  ...prev,
                  product_name_snapshot: e.target.value,
                }))
              }
              placeholder="z. B. XR-65A95L"
            />
          </div>

          <div>
            <FieldLabel>Menge</FieldLabel>
            <Input
              value={displayForm.ordered_qty}
              onChange={(e) =>
                setDisplayForm((prev) => ({
                  ...prev,
                  ordered_qty: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <FieldLabel>Im Laden ausgestellt?</FieldLabel>
            <select
              value={displayForm.is_displayed}
              onChange={(e) =>
                setDisplayForm((prev) => ({
                  ...prev,
                  is_displayed: e.target.value as "yes" | "no" | "unknown",
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="yes">Ja</option>
              <option value="no">Nein</option>
              <option value="unknown">Unklar</option>
            </select>
          </div>

          <div>
            <FieldLabel>Bemerkung</FieldLabel>
            <Input
              value={displayForm.note}
              onChange={(e) =>
                setDisplayForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
              placeholder="z. B. noch im Lager"
            />
          </div>

          <div className="flex items-end">
            <Button type="button" onClick={addDisplayItem} disabled={addingDisplayItem}>
              {addingDisplayItem ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Hinzufügen
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {displayItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              Noch keine Display-Produkte erfasst.
            </p>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Produkt</th>
                  <th className="px-3 py-2">Display</th>
                  <th className="px-3 py-2">Menge</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Geprüft am</th>
                  <th className="px-3 py-2">Bemerkung</th>
                  <th className="px-3 py-2">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item) => (
                  <tr
                    key={item.display_item_id}
                    className="rounded-2xl bg-gray-50 text-sm text-gray-700"
                  >
                    <td className="px-3 py-3 font-medium text-gray-900">
                      {item.product_name_snapshot}
                    </td>
                    <td className="px-3 py-3">
                      {item.ordered_as_display ? "Ja" : "Nein"}
                    </td>
                    <td className="px-3 py-3">{item.ordered_qty ?? "-"}</td>
                    <td className="px-3 py-3">
                      {item.status === "ordered"
                        ? "Bestellt"
                        : item.status === "displayed"
                        ? "Ausgestellt"
                        : item.status === "not_displayed"
                        ? "Nicht ausgestellt"
                        : item.status === "sold_off"
                        ? "Abverkauft"
                        : item.status === "removed"
                        ? "Entfernt"
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      {item.display_checked_at
                        ? new Date(item.display_checked_at).toLocaleDateString("de-CH")
                        : "-"}
                    </td>
                    <td className="px-3 py-3">{item.note || "-"}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            updateDisplayStatus(item.display_item_id, "displayed")
                          }
                        >
                          Ausgestellt
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateDisplayStatus(item.display_item_id, "not_displayed")
                          }
                        >
                          Nicht ausgestellt
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateDisplayStatus(item.display_item_id, "sold_off")
                          }
                        >
                          Abverkauft
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateDisplayStatus(item.display_item_id, "removed")
                          }
                        >
                          Entfernt
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateDisplayStatus(item.display_item_id, "ordered")
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Händler-Stammdaten</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              <FieldLabel>Ansprechpartner</FieldLabel>
              <Input
                value={profileForm.contact_person_name}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    contact_person_name: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel>Funktion</FieldLabel>
              <Input
                value={profileForm.contact_person_role}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    contact_person_role: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel>Kundentyp</FieldLabel>
              <Input
                value={profileForm.customer_type}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    customer_type: e.target.value,
                  }))
                }
                placeholder="Fachhandel / Online / Key Account"
              />
            </div>

            <div>
              <FieldLabel>Region</FieldLabel>
              <Input
                value={profileForm.region}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    region: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel>Partnerstatus / P5 Level</FieldLabel>
              <Input
                value={profileForm.partner_status}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    partner_status: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <FieldLabel>Letzter Besuch</FieldLabel>
              <Input
                type="date"
                value={profileForm.last_visit_date}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    last_visit_date: e.target.value,
                  }))
                }
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Letzter Login</FieldLabel>
              <Input
                type="datetime-local"
                value={profileForm.last_login_at}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    last_login_at: e.target.value,
                  }))
                }
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Geburtstage / wichtige Daten</FieldLabel>
              <Textarea
                value={profileForm.birthdays_notes}
                onChange={(v) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    birthdays_notes: v,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Hobbys / persönliche Hinweise</FieldLabel>
              <Textarea
                value={profileForm.personal_notes}
                onChange={(v) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    personal_notes: v,
                  }))
                }
                rows={4}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Allgemeine Notizen</FieldLabel>
              <Textarea
                value={profileForm.general_notes}
                onChange={(v) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    general_notes: v,
                  }))
                }
                rows={4}
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Segmentierung & Tags</h2>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-medium text-gray-800">
                Interessen
              </div>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((tag) => {
                  const active = assignedTagIds.includes(Number(tag.tag_id));
                  return (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => toggleTag(Number(tag.tag_id))}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-blue-600 text-white"
                          : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-gray-800">
                CRM-Merkmale
              </div>
              <div className="flex flex-wrap gap-2">
                {crmTags.map((tag) => {
                  const active = assignedTagIds.includes(Number(tag.tag_id));
                  return (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => toggleTag(Number(tag.tag_id))}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-amber-600 text-white"
                          : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 p-4">
              <div className="mb-3 text-sm font-medium text-gray-800">
                Zusätzlichen Tag anlegen
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
                <Input
                  value={newTagLabel}
                  onChange={(e) => setNewTagLabel(e.target.value)}
                  placeholder="z. B. VIP Event geeignet"
                />

                <select
                  value={newTagCategory}
                  onChange={(e) =>
                    setNewTagCategory(e.target.value as "interest" | "crm")
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="interest">Interesse</option>
                  <option value="crm">CRM-Merkmal</option>
                </select>

                <Button
                  type="button"
                  onClick={createCustomTag}
                  disabled={creatingTag}
                >
                  {creatingTag ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Tag erstellen
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Besuch / Gespräch</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              <FieldLabel>Datum</FieldLabel>
              <Input
                type="date"
                value={visitForm.visit_date}
                onChange={(e) =>
                  setVisitForm((prev) => ({ ...prev, visit_date: e.target.value }))
                }
              />
            </div>

            <div>
              <FieldLabel>Besuch von</FieldLabel>
              <Input
                value={visitForm.visited_by}
                onChange={(e) =>
                  setVisitForm((prev) => ({ ...prev, visited_by: e.target.value }))
                }
                placeholder="z. B. Roger / Dominik"
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Kontaktpersonen</FieldLabel>
              <Textarea
                value={visitForm.contact_persons}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, contact_persons: v }))
                }
                rows={2}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Was wurde besprochen</FieldLabel>
              <Textarea
                value={visitForm.discussed}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, discussed: v }))
                }
                rows={4}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Was wurde vereinbart</FieldLabel>
              <Textarea
                value={visitForm.agreed}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, agreed: v }))
                }
                rows={3}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Nächste Schritte</FieldLabel>
              <Textarea
                value={visitForm.next_steps}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, next_steps: v }))
                }
                rows={3}
              />
            </div>

            <div className="xl:col-span-2">
              <FieldLabel>Offene Punkte</FieldLabel>
              <Textarea
                value={visitForm.open_points}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, open_points: v }))
                }
                rows={3}
              />
            </div>

            <Button type="button" onClick={addVisit} disabled={addingVisit}>
              {addingVisit ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Besuch speichern
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold">Bewertung / Marktfeedback</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <FieldLabel>Was lief gut</FieldLabel>
              <Textarea
                value={visitForm.what_went_well}
                onChange={(v) =>
                  setVisitForm((prev) => ({ ...prev, what_went_well: v }))
                }
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Was lief weniger gut</FieldLabel>
              <Textarea
                value={visitForm.what_went_less_well}
                onChange={(v) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    what_went_less_well: v,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Konkurrenz / Marktinfos</FieldLabel>
              <Textarea
                value={visitForm.competition_market_info}
                onChange={(v) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    competition_market_info: v,
                  }))
                }
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Branding / Sichtbarkeit</FieldLabel>
              <Textarea
                value={visitForm.branding_visibility}
                onChange={(v) =>
                  setVisitForm((prev) => ({
                    ...prev,
                    branding_visibility: v,
                  }))
                }
                rows={3}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-orange-600" />
            <h2 className="text-lg font-semibold">Next Steps / Aufgaben</h2>
          </div>

          <div className="space-y-3 rounded-2xl border bg-gray-50 p-4">
            <div>
              <FieldLabel>Titel</FieldLabel>
              <Input
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="z. B. Display-Frequenz prüfen"
              />
            </div>

            <div>
              <FieldLabel>Beschreibung</FieldLabel>
              <Textarea
                value={taskForm.description}
                onChange={(v) =>
                  setTaskForm((prev) => ({ ...prev, description: v }))
                }
                rows={3}
              />
            </div>

            <div>
              <FieldLabel>Fällig bis</FieldLabel>
              <Input
                type="date"
                value={taskForm.due_date}
                onChange={(e) =>
                  setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))
                }
              />
            </div>

            <Button type="button" onClick={addTask} disabled={addingTask}>
              {addingTask ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Task hinzufügen
            </Button>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Offen ({openTasks.length})
              </h3>
              <div className="space-y-2">
                {openTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">Keine offenen Aufgaben.</p>
                ) : (
                  openTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-xl border border-orange-200 bg-orange-50 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.description ? (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                              {task.description}
                            </p>
                          ) : null}
                          <div className="mt-2 text-xs text-gray-500">
                            Fällig: {task.due_date || "-"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => updateTaskStatus(task.task_id, "done")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Erledigt
                          </Button>

                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() =>
                              updateTaskStatus(task.task_id, "cancelled")
                            }
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Erledigt ({doneTasks.length})
              </h3>
              <div className="space-y-2">
                {doneTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">Noch nichts erledigt.</p>
                ) : (
                  doneTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-xl border border-green-200 bg-green-50 p-3"
                    >
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Abgebrochen ({cancelledTasks.length})
              </h3>
              <div className="space-y-2">
                {cancelledTasks.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Keine abgebrochenen Aufgaben.
                  </p>
                ) : (
                  cancelledTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="font-medium text-gray-900">{task.title}</div>
                      {task.description ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                          {task.description}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-200 p-5">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Historie</h2>
          </div>

          <div className="space-y-4">
            {visits.length === 0 ? (
              <p className="text-sm text-gray-500">
                Noch keine Besuchsberichte vorhanden.
              </p>
            ) : (
              visits.map((visit) => (
                <div
                  key={visit.visit_report_id}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(visit.visit_date).toLocaleDateString("de-CH")}
                      </div>
                      <div className="text-sm text-gray-500">
                        Besuch von: {visit.visited_by || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-800">Kontaktpersonen</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.contact_persons || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">Besprochen</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.discussed || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">Vereinbart</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.agreed || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">Nächste Schritte</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.next_steps || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">Offene Punkte</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.open_points || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">Was lief gut</div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.what_went_well || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">
                        Was lief weniger gut
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.what_went_less_well || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">
                        Konkurrenz / Marktinfos
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.competition_market_info || "-"}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">
                        Branding / Sichtbarkeit
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-gray-600">
                        {visit.branding_visibility || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {toast && (
        <div className="fixed right-4 top-4 z-[90]">
          <div
            className={`rounded px-4 py-2 text-sm text-white shadow-md ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}