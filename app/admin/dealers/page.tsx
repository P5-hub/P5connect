"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock3,
  Filter,
  Loader2,
  MonitorSmartphone,
  Plus,
  RefreshCcw,
  Search,
  Store,
  Trophy,
  Users,
} from "lucide-react";

type Dealer = {
  dealer_id: number;
  name: string | null;
  email: string | null;
  login_nr: string | null;
  kam?: string | null;
  city?: string | null;
};

type DealerProfile = {
  dealer_id: number;
  customer_type: string | null;
  region: string | null;
  partner_status: string | null;
  last_visit_date: string | null;
};

type DealerTag = {
  tag_id: number;
  label: string;
  category: "interest" | "crm" | "custom";
  sort_order: number;
};

type DealerTagAssignment = {
  dealer_id: number;
  tag_id: number;
};

type DealerUser = {
  id: number;
  dealer_id: number;
  user_email: string | null;
  display_name: string | null;
  role: string | null;
};

type DealerUserTagAssignment = {
  id: number;
  dealer_user_id: number;
  tag_id: number;
};

type DealerTask = {
  task_id: number;
  dealer_id: number;
  title: string;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
};

type VisitReport = {
  dealer_id: number;
  visit_date: string;
};

type DealerDisplayItem = {
  dealer_id: number;
  status: "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed";
  is_displayed: boolean | null;
  display_checked_at: string | null;
};

type PeriodMode =
  | "month"
  | "quarter"
  | "halfyear"
  | "year"
  | "ytd_calendar"
  | "ytd_fiscal";

type DealerOverviewRow = {
  dealer: Dealer;
  profile: DealerProfile | null;
  tags: DealerTag[];
  directTags: DealerTag[];
  employeeTags: DealerTag[];
  employeeCount: number;
  sonyRevenue: number;
  sonyRevenuePrevYear: number;
  yoyPercent: number | null;
  topProducts: { label: string; qty: number; revenue: number }[];
  openTasks: number;
  lastVisitDate: string | null;
  displayActive: number;
  displayDisplayed: number;
  displayOpen: number;
};

type CreateDealerApiResponse = {
  success?: boolean;
  error?: string;
  warning?: string;
  dealerId?: number;
  userId?: string;
};

const FISCAL_YEAR_START_MONTH = 4;

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

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
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

function getDateRange(periodMode: PeriodMode, now = new Date()) {
  const current = new Date(now);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

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

  return { start: startOfDay(start), end };
}

function isDateWithin(value: string | null | undefined, start: Date, end: Date) {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d >= start && d <= end;
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

function uniqueTags(tags: DealerTag[]) {
  const map = new Map<number, DealerTag>();
  tags.forEach((tag) => map.set(Number(tag.tag_id), tag));
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, "de-CH"));
}

export default function AdminDealersPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [profiles, setProfiles] = useState<DealerProfile[]>([]);
  const [tags, setTags] = useState<DealerTag[]>([]);
  const [assignments, setAssignments] = useState<DealerTagAssignment[]>([]);
  const [dealerUsers, setDealerUsers] = useState<DealerUser[]>([]);
  const [dealerUserTagAssignments, setDealerUserTagAssignments] = useState<DealerUserTagAssignment[]>([]);
  const [tasks, setTasks] = useState<DealerTask[]>([]);
  const [visits, setVisits] = useState<VisitReport[]>([]);
  const [displayItems, setDisplayItems] = useState<DealerDisplayItem[]>([]);
  const [submissionItems, setSubmissionItems] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [periodMode, setPeriodMode] = useState<PeriodMode>("quarter");
  const [tagFilter, setTagFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [crmFilter, setCrmFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("");
  const [openTasksOnly, setOpenTasksOnly] = useState(false);
  const [displayOpenOnly, setDisplayOpenOnly] = useState(false);
  const [sortMode, setSortMode] = useState<
    "revenue" | "yoy" | "openTasks" | "lastVisit" | "name"
  >("revenue");

  const [createDealerOpen, setCreateDealerOpen] = useState(false);
  const [creatingDealer, setCreatingDealer] = useState(false);
  const [createDealerResult, setCreateDealerResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [newDealer, setNewDealer] = useState({
    name: "",
    email: "",
    login_nr: "",
    password: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [
        dealersRes,
        profilesRes,
        tagsRes,
        assignmentsRes,
        dealerUsersRes,
        dealerUserTagAssignmentsRes,
        tasksRes,
        visitsRes,
        displayRes,
        itemsRes,
      ] = await Promise.all([
        supabase
          .from("dealers")
          .select("dealer_id, name, email, login_nr, kam, city")
          .order("name", { ascending: true }),

        supabase
          .from("dealer_profiles")
          .select("dealer_id, customer_type, region, partner_status, last_visit_date"),

        supabase
          .from("dealer_tags")
          .select("tag_id, label, category, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("label", { ascending: true }),

        supabase.from("dealer_tag_assignments").select("dealer_id, tag_id"),

        supabase.from("dealer_users").select("id, dealer_id, user_email, display_name, role"),

        supabase.from("dealer_user_tag_assignments").select("id, dealer_user_id, tag_id"),

        supabase.from("dealer_tasks").select("task_id, dealer_id, title, due_date, status"),

        supabase
          .from("dealer_visit_reports")
          .select("dealer_id, visit_date")
          .order("visit_date", { ascending: false }),

        supabase.from("dealer_display_items").select("dealer_id, status, is_displayed, display_checked_at"),

        supabase.from("submission_items").select(`
          item_id,
          product_id,
          product_name,
          sony_article,
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
        `),
      ]);

      if (dealersRes.error) throw dealersRes.error;
      if (profilesRes.error) throw profilesRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (dealerUsersRes.error) throw dealerUsersRes.error;
      if (dealerUserTagAssignmentsRes.error) throw dealerUserTagAssignmentsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (visitsRes.error) throw visitsRes.error;
      if (displayRes.error) throw displayRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setDealers((dealersRes.data ?? []) as Dealer[]);
      setProfiles((profilesRes.data ?? []) as DealerProfile[]);
      setTags((tagsRes.data ?? []) as DealerTag[]);
      setAssignments((assignmentsRes.data ?? []) as DealerTagAssignment[]);
      setDealerUsers((dealerUsersRes.data ?? []) as DealerUser[]);
      setDealerUserTagAssignments(
        (dealerUserTagAssignmentsRes.data ?? []) as DealerUserTagAssignment[]
      );
      setTasks((tasksRes.data ?? []) as DealerTask[]);
      setVisits((visitsRes.data ?? []) as VisitReport[]);
      setDisplayItems((displayRes.data ?? []) as DealerDisplayItem[]);
      setSubmissionItems(itemsRes.data ?? []);
    } catch (error) {
      console.error("Fehler beim Laden der Händlerübersicht:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateDealer = async () => {
    setCreateDealerResult(null);

    const loginNr = newDealer.login_nr.trim();
    const email = newDealer.email.trim().toLowerCase();
    const password = newDealer.password.trim();
    const name = newDealer.name.trim();

    if (!name) {
      setCreateDealerResult({ type: "error", message: "Bitte Händlername eingeben." });
      return;
    }

    if (!loginNr) {
      setCreateDealerResult({ type: "error", message: "Bitte Login-Nr. eingeben." });
      return;
    }

    if (!email) {
      setCreateDealerResult({ type: "error", message: "Bitte E-Mail eingeben." });
      return;
    }

    if (!password || password.length < 8) {
      setCreateDealerResult({
        type: "error",
        message: "Passwort muss mindestens 8 Zeichen lang sein.",
      });
      return;
    }

    try {
      setCreatingDealer(true);

      const res = await fetch("/api/admin/create-dealer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginNr,
          email,
          password,
          name,
          role: "dealer",
        }),
      });

      const data = (await res.json()) as CreateDealerApiResponse;

      if (!res.ok || !data.success) {
        setCreateDealerResult({
          type: "error",
          message: data.error || "Händler konnte nicht erstellt werden.",
        });
        return;
      }

      setCreateDealerResult({
        type: "success",
        message: data.warning || `Händler wurde erstellt. Dealer ID: ${data.dealerId ?? "–"}`,
      });

      setNewDealer({ name: "", email: "", login_nr: "", password: "" });
      await loadData();

      setTimeout(() => {
        setCreateDealerOpen(false);
        setCreateDealerResult(null);
      }, 1200);
    } catch (error) {
      console.error("Fehler beim Erstellen des Händlers:", error);
      setCreateDealerResult({ type: "error", message: "Serverfehler beim Erstellen." });
    } finally {
      setCreatingDealer(false);
    }
  };

  const overviewRows = useMemo<DealerOverviewRow[]>(() => {
    const { start, end } = getDateRange(periodMode);
    const prevStart = shiftOneYear(start);
    const prevEnd = shiftOneYear(end);

    const profileByDealer = new Map<number, DealerProfile>();
    profiles.forEach((profile) => profileByDealer.set(Number(profile.dealer_id), profile));

    const tagById = new Map<number, DealerTag>();
    tags.forEach((tag) => tagById.set(Number(tag.tag_id), tag));

    const directTagsByDealer = new Map<number, DealerTag[]>();
    assignments.forEach((assignment) => {
      const dealerId = Number(assignment.dealer_id);
      const tag = tagById.get(Number(assignment.tag_id));
      if (!tag) return;
      if (!directTagsByDealer.has(dealerId)) directTagsByDealer.set(dealerId, []);
      directTagsByDealer.get(dealerId)!.push(tag);
    });

    const dealerIdByDealerUserId = new Map<number, number>();
    const employeeCountByDealer = new Map<number, number>();

    dealerUsers.forEach((user) => {
      const dealerId = Number(user.dealer_id);
      const userId = Number(user.id);
      if (!dealerId || !userId) return;
      dealerIdByDealerUserId.set(userId, dealerId);
      employeeCountByDealer.set(dealerId, (employeeCountByDealer.get(dealerId) ?? 0) + 1);
    });

    const employeeTagsByDealer = new Map<number, DealerTag[]>();
    dealerUserTagAssignments.forEach((assignment) => {
      const dealerId = dealerIdByDealerUserId.get(Number(assignment.dealer_user_id));
      const tag = tagById.get(Number(assignment.tag_id));
      if (!dealerId || !tag) return;
      if (!employeeTagsByDealer.has(dealerId)) employeeTagsByDealer.set(dealerId, []);
      employeeTagsByDealer.get(dealerId)!.push(tag);
    });

    const aggregatedTagsByDealer = new Map<number, DealerTag[]>();
    dealers.forEach((dealer) => {
      const dealerId = Number(dealer.dealer_id);
      aggregatedTagsByDealer.set(
        dealerId,
        uniqueTags([...(directTagsByDealer.get(dealerId) ?? []), ...(employeeTagsByDealer.get(dealerId) ?? [])])
      );
    });

    const openTasksByDealer = new Map<number, number>();
    tasks.forEach((task) => {
      if (task.status !== "open") return;
      const dealerId = Number(task.dealer_id);
      openTasksByDealer.set(dealerId, (openTasksByDealer.get(dealerId) ?? 0) + 1);
    });

    const lastVisitByDealer = new Map<number, string>();
    visits.forEach((visit) => {
      const dealerId = Number(visit.dealer_id);
      const current = lastVisitByDealer.get(dealerId);
      if (!current || new Date(visit.visit_date) > new Date(current)) {
        lastVisitByDealer.set(dealerId, visit.visit_date);
      }
    });

    const displayByDealer = new Map<number, { active: number; displayed: number; open: number }>();

    displayItems.forEach((item) => {
      const dealerId = Number(item.dealer_id);
      const current = displayByDealer.get(dealerId) ?? { active: 0, displayed: 0, open: 0 };

      if (item.status === "ordered" || item.status === "displayed") current.active++;
      if (item.status === "displayed") current.displayed++;
      if (item.status === "ordered" || item.is_displayed == null || !item.display_checked_at) {
        current.open++;
      }

      displayByDealer.set(dealerId, current);
    });

    const metricsByDealer = new Map<
      number,
      {
        revenue: number;
        prevRevenue: number;
        productMap: Map<string, { label: string; qty: number; revenue: number }>;
      }
    >();

    submissionItems.forEach((row: any) => {
      const submission = Array.isArray(row.submission) ? row.submission[0] : row.submission;

      const dealerId = Number(submission?.dealer_id);
      if (!dealerId) return;
      if (submission?.typ !== "bestellung") return;
      if (String(submission?.status || "").toLowerCase() === "rejected") return;

      const compareDate = submission?.created_at || submission?.datum;
      const qty = Number(row.menge ?? 0);
      const price = Number(row.preis ?? 0);
      const revenue = qty * price;

      if (!metricsByDealer.has(dealerId)) {
        metricsByDealer.set(dealerId, {
          revenue: 0,
          prevRevenue: 0,
          productMap: new Map(),
        });
      }

      const metric = metricsByDealer.get(dealerId)!;

      if (isDateWithin(compareDate, start, end)) {
        metric.revenue += revenue;

        const label =
          row.sony_article ||
          row.product_name ||
          (row.product_id ? `Produkt #${row.product_id}` : `Item #${row.item_id}`);

        if (!metric.productMap.has(label)) {
          metric.productMap.set(label, { label, qty: 0, revenue: 0 });
        }

        const product = metric.productMap.get(label)!;
        product.qty += qty;
        product.revenue += revenue;
      }

      if (isDateWithin(compareDate, prevStart, prevEnd)) {
        metric.prevRevenue += revenue;
      }
    });

    return dealers.map((dealer) => {
      const dealerId = Number(dealer.dealer_id);
      const metric = metricsByDealer.get(dealerId);
      const display = displayByDealer.get(dealerId);

      const sonyRevenue = metric?.revenue ?? 0;
      const sonyRevenuePrevYear = metric?.prevRevenue ?? 0;

      const yoyPercent =
        sonyRevenuePrevYear > 0
          ? ((sonyRevenue - sonyRevenuePrevYear) / sonyRevenuePrevYear) * 100
          : null;

      const topProducts = metric
        ? [...metric.productMap.values()]
            .sort((a, b) => {
              if (b.revenue !== a.revenue) return b.revenue - a.revenue;
              return b.qty - a.qty;
            })
            .slice(0, 3)
        : [];

      const directTags = uniqueTags(directTagsByDealer.get(dealerId) ?? []);
      const employeeTags = uniqueTags(employeeTagsByDealer.get(dealerId) ?? []);
      const aggregatedTags = aggregatedTagsByDealer.get(dealerId) ?? [];

      return {
        dealer,
        profile: profileByDealer.get(dealerId) ?? null,
        tags: aggregatedTags,
        directTags,
        employeeTags,
        employeeCount: employeeCountByDealer.get(dealerId) ?? 0,
        sonyRevenue,
        sonyRevenuePrevYear,
        yoyPercent,
        topProducts,
        openTasks: openTasksByDealer.get(dealerId) ?? 0,
        lastVisitDate: lastVisitByDealer.get(dealerId) ?? profileByDealer.get(dealerId)?.last_visit_date ?? null,
        displayActive: display?.active ?? 0,
        displayDisplayed: display?.displayed ?? 0,
        displayOpen: display?.open ?? 0,
      };
    });
  }, [
    dealers,
    profiles,
    tags,
    assignments,
    dealerUsers,
    dealerUserTagAssignments,
    tasks,
    visits,
    displayItems,
    submissionItems,
    periodMode,
  ]);

  const interestTags = useMemo(() => tags.filter((tag) => tag.category === "interest"), [tags]);

  const crmTags = useMemo(
    () => tags.filter((tag) => tag.category === "crm" || tag.category === "custom"),
    [tags]
  );

  const regionOptions = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.region).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, "de-CH")
      ),
    [profiles]
  );

  const customerTypeOptions = useMemo(
    () =>
      [...new Set(profiles.map((p) => p.customer_type).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, "de-CH")
      ),
    [profiles]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = overviewRows.filter((row) => {
      const dealer = row.dealer;
      const profile = row.profile;

      const matchesSearch =
        !q ||
        dealer.name?.toLowerCase().includes(q) ||
        dealer.email?.toLowerCase().includes(q) ||
        dealer.login_nr?.toLowerCase().includes(q) ||
        dealer.kam?.toLowerCase().includes(q) ||
        dealer.city?.toLowerCase().includes(q) ||
        row.tags.some((tag) => tag.label.toLowerCase().includes(q));

      const tagIds = row.tags.map((tag) => String(tag.tag_id));

      const matchesTag = !tagFilter || tagIds.includes(tagFilter);
      const matchesInterest = !interestFilter || tagIds.includes(interestFilter);
      const matchesCrm = !crmFilter || tagIds.includes(crmFilter);
      const matchesRegion = !regionFilter || profile?.region === regionFilter;
      const matchesCustomerType = !customerTypeFilter || profile?.customer_type === customerTypeFilter;
      const matchesOpenTasks = !openTasksOnly || row.openTasks > 0;
      const matchesDisplayOpen = !displayOpenOnly || row.displayOpen > 0;

      return (
        matchesSearch &&
        matchesTag &&
        matchesInterest &&
        matchesCrm &&
        matchesRegion &&
        matchesCustomerType &&
        matchesOpenTasks &&
        matchesDisplayOpen
      );
    });

    result = [...result].sort((a, b) => {
      if (sortMode === "name") return (a.dealer.name || "").localeCompare(b.dealer.name || "", "de-CH");
      if (sortMode === "openTasks") return b.openTasks - a.openTasks;
      if (sortMode === "yoy") return (b.yoyPercent ?? -999999) - (a.yoyPercent ?? -999999);
      if (sortMode === "lastVisit") {
        return (
          new Date(b.lastVisitDate || "1900-01-01").getTime() -
          new Date(a.lastVisitDate || "1900-01-01").getTime()
        );
      }
      return b.sonyRevenue - a.sonyRevenue;
    });

    return result;
  }, [
    overviewRows,
    search,
    tagFilter,
    interestFilter,
    crmFilter,
    regionFilter,
    customerTypeFilter,
    openTasksOnly,
    displayOpenOnly,
    sortMode,
  ]);

  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.sonyRevenue, 0);
  const openTasksTotal = filteredRows.reduce((sum, row) => sum + row.openTasks, 0);
  const displayOpenTotal = filteredRows.reduce((sum, row) => sum + row.displayOpen, 0);
  const activeDisplayTotal = filteredRows.reduce((sum, row) => sum + row.displayActive, 0);

  const resetFilters = () => {
    setSearch("");
    setTagFilter("");
    setInterestFilter("");
    setCrmFilter("");
    setRegionFilter("");
    setCustomerTypeFilter("");
    setOpenTasksOnly(false);
    setDisplayOpenOnly(false);
    setSortMode("revenue");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <Store className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Händlerübersicht</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Dealer CRM Dashboard mit Umsatz, kumulierten Mitarbeiter-Tags, Tasks, Display-Status und letzter Aktivität.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => setCreateDealerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Händler
          </Button>

          <Button type="button" variant="outline" onClick={loadData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Händler angezeigt" value={formatInteger(filteredRows.length)} />
        <StatCard title="Sony Umsatz" value={formatCurrency(totalRevenue)} />
        <StatCard title="Offene Tasks" value={formatInteger(openTasksTotal)} />
        <StatCard
          title="Displays"
          value={formatInteger(activeDisplayTotal)}
          subtitle={`${formatInteger(displayOpenTotal)} offen / ungeprüft`}
        />
      </div>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Filter</h2>
          </div>

          <Button type="button" variant="outline" onClick={resetFilters}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Filter zurücksetzen
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Händler, Login, E-Mail, KAM, Ort oder Tag suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as "revenue" | "yoy" | "openTasks" | "lastVisit" | "name")}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="revenue">Sortierung: Umsatz</option>
            <option value="yoy">Sortierung: YoY</option>
            <option value="openTasks">Sortierung: offene Tasks</option>
            <option value="lastVisit">Sortierung: letzter Besuch</option>
            <option value="name">Sortierung: Name</option>
          </select>

          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Interessen</option>
            {interestTags.map((tag) => (
              <option key={tag.tag_id} value={String(tag.tag_id)}>
                {tag.label}
              </option>
            ))}
          </select>

          <select
            value={crmFilter}
            onChange={(e) => setCrmFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle CRM-Merkmale</option>
            {crmTags.map((tag) => (
              <option key={tag.tag_id} value={String(tag.tag_id)}>
                {tag.label}
              </option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Tags</option>
            {tags.map((tag) => (
              <option key={tag.tag_id} value={String(tag.tag_id)}>
                {tag.label}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Regionen</option>
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Kundentypen</option>
            {customerTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-gray-700">
            <input type="checkbox" checked={openTasksOnly} onChange={(e) => setOpenTasksOnly(e.target.checked)} />
            Nur Händler mit offenen Tasks
          </label>

          <label className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm text-gray-700">
            <input type="checkbox" checked={displayOpenOnly} onChange={(e) => setDisplayOpenOnly(e.target.checked)} />
            Nur Display offen / nicht geprüft
          </label>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold">Dealer Dashboard</h2>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {filteredRows.length} von {overviewRows.length} Händlern angezeigt. Tags enthalten Händler-Tags plus Mitarbeiter-Tags.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Händlerübersicht wird geladen...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Händler</th>
                  <th className="px-3 py-2">Segment</th>
                  <th className="px-3 py-2">Sony Umsatz</th>
                  <th className="px-3 py-2">YoY</th>
                  <th className="px-3 py-2">Top Produkte</th>
                  <th className="px-3 py-2">Displays</th>
                  <th className="px-3 py-2">Tasks</th>
                  <th className="px-3 py-2">Letzter Besuch</th>
                  <th className="px-3 py-2">Aktion</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-sm text-gray-500">
                      Keine Händler mit diesen Filtern gefunden.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const positiveYoy = (row.yoyPercent ?? 0) >= 0;
                    const interestLabels = row.tags.filter((tag) => tag.category === "interest").slice(0, 4);
                    const crmLabels = row.tags.filter((tag) => tag.category === "crm" || tag.category === "custom").slice(0, 4);
                    const hiddenTagCount = Math.max(row.tags.length - interestLabels.length - crmLabels.length, 0);

                    return (
                      <tr key={row.dealer.dealer_id} className="bg-gray-50 text-sm text-gray-700">
                        <td className="px-3 py-3">
                          <div className="font-semibold text-gray-900">
                            {row.dealer.name || `Dealer #${row.dealer.dealer_id}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {row.dealer.dealer_id} · Login: {row.dealer.login_nr || "-"}
                          </div>
                          <div className="text-xs text-gray-500">{row.dealer.email || "-"}</div>
                          {row.employeeCount > 0 ? (
                            <div className="mt-1 text-xs text-indigo-600">
                              {row.employeeCount} Kontakt(e) · {row.employeeTags.length} Mitarbeiter-Tag(s)
                            </div>
                          ) : null}
                        </td>

                        <td className="min-w-[260px] px-3 py-3">
                          <div className="text-xs text-gray-500">Region: {row.profile?.region || "-"}</div>
                          <div className="text-xs text-gray-500">Typ: {row.profile?.customer_type || "-"}</div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {interestLabels.map((tag) => (
                              <span
                                key={tag.tag_id}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-100"
                                title={row.employeeTags.some((t) => t.tag_id === tag.tag_id) ? "Aus Mitarbeiter-Tags kumuliert" : "Direkt am Händler"}
                              >
                                {tag.label}
                              </span>
                            ))}

                            {crmLabels.map((tag) => (
                              <span
                                key={tag.tag_id}
                                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100"
                                title={row.employeeTags.some((t) => t.tag_id === tag.tag_id) ? "Aus Mitarbeiter-Tags kumuliert" : "Direkt am Händler"}
                              >
                                {tag.label}
                              </span>
                            ))}

                            {hiddenTagCount > 0 ? (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
                                +{hiddenTagCount}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-3 py-3 font-semibold text-gray-900">{formatCurrency(row.sonyRevenue)}</td>

                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${
                              row.yoyPercent == null
                                ? "bg-gray-100 text-gray-600 ring-gray-200"
                                : positiveYoy
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-red-50 text-red-700 ring-red-100"
                            }`}
                          >
                            {formatPercent(row.yoyPercent)}
                          </span>
                        </td>

                        <td className="min-w-[240px] px-3 py-3">
                          {row.topProducts.length === 0 ? (
                            <span className="text-gray-400">–</span>
                          ) : (
                            <div className="space-y-1">
                              {row.topProducts.map((product, index) => (
                                <div key={product.label} className="flex items-start gap-1">
                                  <Trophy className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
                                  <div>
                                    <div className="text-xs font-medium text-gray-900">
                                      {index + 1}. {product.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {formatInteger(product.qty)} Stk. · {formatCurrency(product.revenue)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1 font-medium text-gray-900">
                            <MonitorSmartphone className="h-4 w-4 text-sky-600" />
                            {formatInteger(row.displayActive)}
                          </div>
                          <div className="text-xs text-gray-500">{formatInteger(row.displayDisplayed)} ausgestellt</div>
                          {row.displayOpen > 0 ? (
                            <div className="mt-1 text-xs font-medium text-orange-700">{row.displayOpen} offen</div>
                          ) : null}
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1">
                            <Clock3 className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-gray-900">{row.openTasks}</span>
                          </div>
                        </td>

                        <td className="px-3 py-3">{formatDate(row.lastVisitDate)}</td>

                        <td className="px-3 py-3">
                          <Link href={`/admin/dealers/${row.dealer.dealer_id}`}>
                            <Button type="button" size="sm">
                              <Store className="mr-2 h-4 w-4" />
                              Händlerakte öffnen
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <b>Hinweis:</b> In der Spalte Segment werden direkte Händler-Tags und Tags der Kontakte/Mitarbeiter zusammengeführt.
        Dadurch funktionieren die Filter jetzt auch für Interessen und CRM-Merkmale, die nur beim Mitarbeiter gepflegt wurden.
      </div>

      {createDealerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Neuen Händler anlegen</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Erstellt den Händler in <code>dealers</code> und den Login in Supabase Auth.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!creatingDealer) {
                    setCreateDealerOpen(false);
                    setCreateDealerResult(null);
                  }
                }}
                className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Händlername</label>
                <input
                  value={newDealer.name}
                  onChange={(e) => setNewDealer((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z. B. EP Graber"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">E-Mail / Login-E-Mail</label>
                <input
                  type="email"
                  value={newDealer.email}
                  onChange={(e) => setNewDealer((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="haendler@firma.ch"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Login-Nr.</label>
                <input
                  value={newDealer.login_nr}
                  onChange={(e) => setNewDealer((prev) => ({ ...prev, login_nr: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z. B. 335 oder 100335"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Start-Passwort</label>
                <input
                  type="password"
                  value={newDealer.password}
                  onChange={(e) => setNewDealer((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mindestens 8 Zeichen"
                />
              </div>

              {createDealerResult ? (
                <div
                  className={`rounded-xl border p-3 text-sm ${
                    createDealerResult.type === "success"
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {createDealerResult.message}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={creatingDealer}
                onClick={() => {
                  setCreateDealerOpen(false);
                  setCreateDealerResult(null);
                }}
              >
                Abbrechen
              </Button>

              <Button type="button" onClick={handleCreateDealer} disabled={creatingDealer}>
                {creatingDealer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Händler erstellen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
