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
  RefreshCcw,
  Search,
  Store,
} from "lucide-react";

type Dealer = {
  dealer_id: number;
  name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;
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

  const currentYear = new Date().getFullYear();

  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [weekFilter, setWeekFilter] = useState("all");
  const [kamFilter, setKamFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openPointsOnly, setOpenPointsOnly] = useState(false);
  const [expandedWeekKey, setExpandedWeekKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [visitsRes, dealersRes] = await Promise.all([
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
      ]);

      if (visitsRes.error) throw visitsRes.error;
      if (dealersRes.error) throw dealersRes.error;

      setVisits((visitsRes.data ?? []) as VisitReport[]);
      setDealers((dealersRes.data ?? []) as Dealer[]);
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
  const totalDealers = new Set(filteredVisits.map((visit) => visit.dealer_id)).size;
  const totalOpenPoints = filteredVisits.filter(
    (visit) => isMeaningfulText(visit.open_points) || isMeaningfulText(visit.next_steps)
  ).length;

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
        <StatCard title="Besuche" value={String(totalVisits)} />
        <StatCard title="Besuchte Händler" value={String(totalDealers)} />
        <StatCard title="Kalenderwochen" value={String(weekGroups.length)} />
        <StatCard title="Offene Punkte / nächste Schritte" value={String(totalOpenPoints)} />
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
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                              <th className="px-2 py-2">Datum</th>
                              <th className="px-2 py-2">Händler</th>
                              <th className="px-2 py-2">Besuch von</th>
                              <th className="px-2 py-2">Kontakt</th>
                              <th className="px-2 py-2">Besprochen</th>
                              <th className="px-2 py-2">Vereinbart / nächste Schritte</th>
                              <th className="px-2 py-2">Offene Punkte</th>
                              <th className="px-2 py-2 text-right">Aktion</th>
                            </tr>
                          </thead>

                          <tbody>
                            {group.visits.map((visit) => (
                              <tr
                                key={visit.visit_report_id}
                                className="border-t border-indigo-100 bg-white align-top text-sm"
                              >
                                <td className="whitespace-nowrap px-2 py-3 text-gray-700">
                                  {formatDate(visit.visit_date)}
                                </td>

                                <td className="min-w-[180px] px-2 py-3">
                                  <div className="font-medium text-gray-900">
                                    {visit.dealer?.name || `Dealer #${visit.dealer_id}`}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Login: {visit.dealer?.login_nr || "–"} · {visit.dealer?.city || "–"}
                                  </div>
                                </td>

                                <td className="min-w-[140px] px-2 py-3 text-gray-700">
                                  {visit.visited_by || visit.dealer?.kam || "–"}
                                </td>

                                <td className="min-w-[220px] whitespace-pre-wrap px-2 py-3 text-gray-700">
                                  {visit.contact_persons || "–"}
                                </td>

                                <td className="min-w-[260px] whitespace-pre-wrap px-2 py-3 text-gray-700">
                                  {visit.discussed || "–"}
                                </td>

                                <td className="min-w-[260px] whitespace-pre-wrap px-2 py-3 text-gray-700">
                                  <div>
                                    <span className="font-medium text-gray-900">Vereinbart:</span>{" "}
                                    {visit.agreed || "–"}
                                  </div>
                                  <div className="mt-2">
                                    <span className="font-medium text-gray-900">Nächste Schritte:</span>{" "}
                                    {visit.next_steps || "–"}
                                  </div>
                                </td>

                                <td className="min-w-[260px] whitespace-pre-wrap px-2 py-3 text-gray-700">
                                  {visit.open_points || "–"}
                                </td>

                                <td className="whitespace-nowrap px-2 py-3 text-right">
                                  <Link href={`/admin/dealers/${visit.dealer_id}`}>
                                    <Button type="button" size="sm" variant="outline">
                                      <Store className="mr-2 h-4 w-4" />
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
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}