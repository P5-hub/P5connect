"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Store,
  X,
} from "lucide-react";

type Dealer = {
  dealer_id: number;
  name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;
};

type DealerUser = {
  id: number;
  dealer_id: number;
  user_email: string;
  display_name: string | null;
  role: string | null;
};

type DealerTask = {
  task_id: number;
  dealer_id: number;
  title: string;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
  assigned_to: string | null;
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

type VisitRow = VisitReport & {
  dealer?: Dealer | null;
  isoYear: number;
  isoWeek: number;
  weekKey: string;
};

type TaskDraft = {
  dealer_id: number;
  dealer_name: string;
  dealer_kam: string;
  source_visit_report_id: number;
  title: string;
  description: string;
  due_date: string;
  assigned_to: string;
};

type WeekGroup = {
  key: string;
  isoYear: number;
  isoWeek: number;
  visits: VisitRow[];
  dealerCount: number;
  openPointsCount: number;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
}

function getIsoWeekAndYear(dateString: string) {
  const date = new Date(dateString);
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;

  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const isoYear = target.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const isoWeek = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { isoYear, isoWeek };
}

function isMeaningfulText(value: string | null | undefined) {
  const text = String(value || "").trim().toLowerCase();
  return Boolean(text && text !== "null" && text !== "-" && text !== "keine" && text !== "keine offenen punkte");
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

export default function AdminDealerVisitsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<VisitReport[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerUsers, setDealerUsers] = useState<DealerUser[]>([]);
  const [tasks, setTasks] = useState<DealerTask[]>([]);

  const currentYear = new Date().getFullYear();

  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [weekFilter, setWeekFilter] = useState("all");
  const [kamFilter, setKamFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openPointsOnly, setOpenPointsOnly] = useState(false);
  const [expandedWeekKey, setExpandedWeekKey] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [savingTask, setSavingTask] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [visitsRes, dealersRes, dealerUsersRes, tasksRes] = await Promise.all([
        supabase
          .from("dealer_visit_reports")
          .select(`
            visit_report_id,
            dealer_id,
            visit_date,
            visited_by,
            contact_persons,
            discussed,
            agreed,
            next_steps,
            open_points,
            what_went_well,
            what_went_less_well,
            competition_market_info,
            branding_visibility,
            created_at
          `)
          .order("visit_date", { ascending: false })
          .order("created_at", { ascending: false }),

        supabase
          .from("dealers")
          .select("dealer_id, name, login_nr, kam, city")
          .order("name", { ascending: true }),

        supabase
          .from("dealer_users")
          .select("id, dealer_id, user_email, display_name, role")
          .order("display_name", { ascending: true }),

        supabase
          .from("dealer_tasks")
          .select("task_id, dealer_id, title, due_date, status, assigned_to"),
      ]);

      if (visitsRes.error) throw visitsRes.error;
      if (dealersRes.error) throw dealersRes.error;
      if (dealerUsersRes.error) throw dealerUsersRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setVisits((visitsRes.data ?? []) as VisitReport[]);
      setDealers((dealersRes.data ?? []) as Dealer[]);
      setDealerUsers((dealerUsersRes.data ?? []) as DealerUser[]);
      setTasks((tasksRes.data ?? []) as DealerTask[]);
    } catch (error) {
      console.error("Fehler beim Laden der Besuchsberichte:", error);
      setVisits([]);
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

  const dealerUsersByDealerId = useMemo(() => {
    const map = new Map<number, DealerUser[]>();

    dealerUsers.forEach((user) => {
      const dealerId = Number(user.dealer_id);
      if (!map.has(dealerId)) map.set(dealerId, []);
      map.get(dealerId)!.push(user);
    });

    return map;
  }, [dealerUsers]);

  const visitRows = useMemo<VisitRow[]>(() => {
    return visits.map((visit) => {
      const { isoYear, isoWeek } = getIsoWeekAndYear(visit.visit_date);
      const weekKey = `${isoYear}-KW${String(isoWeek).padStart(2, "0")}`;

      return {
        ...visit,
        dealer: dealerById.get(Number(visit.dealer_id)) ?? null,
        isoYear,
        isoWeek,
        weekKey,
      };
    });
  }, [visits, dealerById]);

  const yearOptions = useMemo(() => {
    return [...new Set(visitRows.map((visit) => visit.isoYear))]
      .sort((a, b) => b - a)
      .map(String);
  }, [visitRows]);

  const weekOptions = useMemo(() => {
    return [...new Set(visitRows
      .filter((visit) => yearFilter === "all" || String(visit.isoYear) === yearFilter)
      .map((visit) => visit.isoWeek))]
      .sort((a, b) => a - b);
  }, [visitRows, yearFilter]);

  const kamOptions = useMemo(() => {
    const values = visitRows
      .map((visit) => visit.visited_by || visit.dealer?.kam || "")
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "de-CH"));
  }, [visitRows]);

  const filteredVisits = useMemo(() => {
    const q = search.trim().toLowerCase();

    return visitRows.filter((visit) => {
      const dealer = visit.dealer;

      const matchesYear =
        yearFilter === "all" || String(visit.isoYear) === yearFilter;

      const matchesWeek =
        weekFilter === "all" || String(visit.isoWeek) === weekFilter;

      const kamText = visit.visited_by || dealer?.kam || "";
      const matchesKam = kamFilter === "all" || kamText === kamFilter;

      const hasOpenPoints =
        isMeaningfulText(visit.open_points) || isMeaningfulText(visit.next_steps);

      const matchesOpenPoints = !openPointsOnly || hasOpenPoints;

      const matchesSearch =
        !q ||
        dealer?.name?.toLowerCase().includes(q) ||
        dealer?.login_nr?.toLowerCase().includes(q) ||
        dealer?.city?.toLowerCase().includes(q) ||
        dealer?.kam?.toLowerCase().includes(q) ||
        visit.visited_by?.toLowerCase().includes(q) ||
        visit.contact_persons?.toLowerCase().includes(q) ||
        visit.discussed?.toLowerCase().includes(q) ||
        visit.agreed?.toLowerCase().includes(q) ||
        visit.next_steps?.toLowerCase().includes(q) ||
        visit.open_points?.toLowerCase().includes(q);

      return (
        matchesYear &&
        matchesWeek &&
        matchesKam &&
        matchesOpenPoints &&
        matchesSearch
      );
    });
  }, [visitRows, yearFilter, weekFilter, kamFilter, openPointsOnly, search]);

  const weekGroups = useMemo<WeekGroup[]>(() => {
    const map = new Map<string, WeekGroup>();

    for (const visit of filteredVisits) {
      if (!map.has(visit.weekKey)) {
        map.set(visit.weekKey, {
          key: visit.weekKey,
          isoYear: visit.isoYear,
          isoWeek: visit.isoWeek,
          visits: [],
          dealerCount: 0,
          openPointsCount: 0,
        });
      }

      const group = map.get(visit.weekKey)!;
      group.visits.push(visit);
    }

    const result = [...map.values()].map((group) => ({
      ...group,
      dealerCount: new Set(group.visits.map((visit) => visit.dealer_id)).size,
      openPointsCount: group.visits.filter(
        (visit) => isMeaningfulText(visit.open_points) || isMeaningfulText(visit.next_steps)
      ).length,
      visits: [...group.visits].sort((a, b) => {
        const dateCompare =
          new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime();

        if (dateCompare !== 0) return dateCompare;

        return (a.dealer?.name || "").localeCompare(b.dealer?.name || "", "de-CH");
      }),
    }));

    return result.sort((a, b) => {
      if (b.isoYear !== a.isoYear) return b.isoYear - a.isoYear;
      return b.isoWeek - a.isoWeek;
    });
  }, [filteredVisits]);

  const totalVisits = filteredVisits.length;

  const totalDealers = new Set(
    filteredVisits.map((visit) => visit.dealer_id)
  ).size;

  const averageVisitsPerWeek =
    weekGroups.length > 0 ? totalVisits / weekGroups.length : 0;

  const filteredDealerIds = new Set(
    filteredVisits.map((visit) => Number(visit.dealer_id))
  );

  const openTasksForFilteredDealers = tasks.filter(
    (task) =>
      task.status === "open" &&
      filteredDealerIds.has(Number(task.dealer_id))
  ).length;

  const openTaskFromOpenPoints = (visit: VisitRow) => {
    const openPoints = String(visit.open_points || "").trim();

    if (!openPoints) {
      showToast("error", "Dieser Besuchsrapport hat keine offenen Punkte.");
      return;
    }

  setTaskDraft({
    dealer_id: Number(visit.dealer_id),
    dealer_name: visit.dealer?.name || `Dealer #${visit.dealer_id}`,
    dealer_kam: visit.dealer?.kam || "",
    source_visit_report_id: Number(visit.visit_report_id),
    title: `Offener Punkt: ${visit.dealer?.name || `Dealer #${visit.dealer_id}`}`,
    description: openPoints,
    due_date: "",
    assigned_to: "",
  });
  };

  const createTaskFromDraft = async () => {
    if (!taskDraft) return;

    const title = taskDraft.title.trim();

    if (!title) {
      showToast("error", "Bitte einen Task-Titel eingeben.");
      return;
    }

    try {
      setSavingTask(true);

      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";

      const { error } = await supabase.from("dealer_tasks").insert({
        dealer_id: taskDraft.dealer_id,
        title,
        description: taskDraft.description.trim() || null,
        due_date: taskDraft.due_date || null,
        status: "open",
        assigned_to: taskDraft.assigned_to.trim() || null,
        created_by: currentUser,
      });

      if (error) throw error;

      showToast("success", "Task wurde aus offenem Punkt erstellt.");
      setTaskDraft(null);
    } catch (error) {
      console.error("Fehler beim Erstellen Task aus Besuchsrapport:", error);
      showToast("error", "Task konnte nicht erstellt werden.");
    } finally {
      setSavingTask(false);
    }
  };

  const resetFilters = () => {
    setYearFilter(String(currentYear));
    setWeekFilter("all");
    setKamFilter("all");
    setSearch("");
    setOpenPointsOnly(false);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <Clock3 className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Besuchsberichte</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Wochenübersicht der Händlerbesuche mit Vereinbarungen, nächsten Schritten und offenen Punkten.
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
          title="Besuche"
          value={String(totalVisits)}
          subtitle="im gewählten Filter"
        />

        <StatCard
          title="Ø Besuche / Woche"
          value={averageVisitsPerWeek.toLocaleString("de-CH", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
          subtitle={`über ${weekGroups.length} KW`}
        />

        <StatCard
          title="Besuchte Händler"
          value={String(totalDealers)}
          subtitle="unique Händler"
        />

        <StatCard
          title="Offene Tasks"
          value={String(openTasksForFilteredDealers)}
          subtitle="bei den gefilterten Händlern"
        />
      </div>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Händler, Kontakt, Thema, Vereinbarung oder offene Punkte suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={yearFilter}
            onChange={(event) => {
              setYearFilter(event.target.value);
              setWeekFilter("all");
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Jahre</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={weekFilter}
            onChange={(event) => setWeekFilter(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Kalenderwochen</option>
            {weekOptions.map((week) => (
              <option key={week} value={String(week)}>
                KW {week}
              </option>
            ))}
          </select>

          <select
            value={kamFilter}
            onChange={(event) => setKamFilter(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Besucher/KAM</option>
            {kamOptions.map((kam) => (
              <option key={kam} value={kam}>
                {kam}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={openPointsOnly}
              onChange={(event) => setOpenPointsOnly(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Nur mit offenen Punkten / nächsten Schritten
          </label>

          <Button type="button" variant="outline" onClick={resetFilters}>
            Filter zurücksetzen
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Besuchsberichte werden geladen...
          </div>
        ) : weekGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Keine Besuchsberichte mit diesen Filtern vorhanden.
          </div>
        ) : (
          <div className="space-y-3">
            {weekGroups.map((group) => {
              const expanded = expandedWeekKey === group.key;

              return (
                <Fragment key={group.key}>
                  <button
                    type="button"
                    onClick={() => setExpandedWeekKey(expanded ? null : group.key)}
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:bg-indigo-50"
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}

                      <div>
                        <div className="flex items-center gap-2 font-semibold text-gray-900">
                          <CalendarDays className="h-4 w-4 text-indigo-600" />
                          KW {group.isoWeek} / {group.isoYear}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {group.visits.length} Besuch(e) · {group.dealerCount} Händler · {group.openPointsCount} mit offenen Punkten/nächsten Schritten
                        </div>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-indigo-700">
                      {group.visits.length}
                    </div>
                  </button>

                  {expanded && (
                    <div className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                      {group.visits.map((visit) => {
                        const hasNextSteps = isMeaningfulText(visit.next_steps);
                        const hasOpenPoints = isMeaningfulText(visit.open_points);

                        return (
                          <div
                            key={visit.visit_report_id}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {visit.dealer?.name || `Dealer #${visit.dealer_id}`}
                                  </div>

                                  {(hasNextSteps || hasOpenPoints) ? (
                                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                      Offene Punkte
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                  {formatDate(visit.visit_date)} · Login:{" "}
                                  {visit.dealer?.login_nr || "–"} · {visit.dealer?.city || "–"}
                                </div>

                                <div className="mt-1 text-xs text-gray-500">
                                  Besuch von: {visit.visited_by || visit.dealer?.kam || "–"}
                                </div>
                              </div>

                              <div className="flex flex-wrap justify-end gap-2">
                                {hasOpenPoints ? (
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openTaskFromOpenPoints(visit)}
                                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Task aus offenen Punkten
                                  </Button>
                                ) : null}

                                <Link href={`/admin/dealers/${visit.dealer_id}`}>
                                  <Button type="button" size="sm" variant="outline">
                                    <Store className="mr-2 h-4 w-4" />
                                    Händlerakte
                                  </Button>
                                </Link>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Kontakt / Teilnehmer
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                  {visit.contact_persons || "–"}
                                </div>
                              </div>

                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Besprochen
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                                  {visit.discussed || "–"}
                                </div>
                              </div>

                              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                  Vereinbart
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm text-blue-900">
                                  {visit.agreed || "–"}
                                </div>
                              </div>

                              <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                                <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                                  Nächste Schritte
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm text-indigo-900">
                                  {visit.next_steps || "–"}
                                </div>
                              </div>

                              <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 xl:col-span-2">
                                <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                                  Offene Punkte
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm text-orange-900">
                                  {visit.open_points || "–"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </Card>
      {taskDraft && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Task aus offenem Punkt erstellen
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Der Text aus dem Besuchsrapport wurde übernommen und kann vor dem Speichern angepasst werden.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTaskDraft(null)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                disabled={savingTask}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                <div className="font-medium text-gray-900">{taskDraft.dealer_name}</div>
                <div className="text-xs text-gray-500">
                  Quelle: Besuchsrapport #{taskDraft.source_visit_report_id}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Titel *
                </label>
                <input
                  value={taskDraft.title}
                  onChange={(event) =>
                    setTaskDraft((prev) =>
                      prev ? { ...prev, title: event.target.value } : prev
                    )
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Beschreibung
                </label>
                <textarea
                  value={taskDraft.description}
                  onChange={(event) =>
                    setTaskDraft((prev) =>
                      prev ? { ...prev, description: event.target.value } : prev
                    )
                  }
                  rows={5}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fällig am
                  </label>
                  <input
                    type="date"
                    value={taskDraft.due_date}
                    onChange={(event) =>
                      setTaskDraft((prev) =>
                        prev ? { ...prev, due_date: event.target.value } : prev
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Zuständig
                  </label>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Zuständig
                    </label>

                    <select
                      value={taskDraft.assigned_to}
                      onChange={(event) =>
                        setTaskDraft((prev) =>
                          prev ? { ...prev, assigned_to: event.target.value } : prev
                        )
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Nicht zugewiesen / KAM-Fallback</option>

                      {taskDraft.dealer_kam ? (
                        <option value={taskDraft.dealer_kam}>
                          {taskDraft.dealer_kam} · KAM
                        </option>
                      ) : null}

                      {(dealerUsersByDealerId.get(Number(taskDraft.dealer_id)) ?? []).map((user) => (
                        <option key={user.id} value={user.user_email}>
                          {user.display_name || user.user_email}
                          {user.role ? ` · ${user.role}` : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-1 text-xs text-gray-500">
                      Wenn leer, wird in der Task-Übersicht automatisch der hinterlegte KAM des Händlers angezeigt.
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Wenn leer, wird später automatisch der hinterlegte KAM des Händlers verwendet.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTaskDraft(null)}
                disabled={savingTask}
              >
                Abbrechen
              </Button>

              <Button
                type="button"
                onClick={createTaskFromDraft}
                disabled={savingTask}
              >
                {savingTask ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Task speichern
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-[100]">
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