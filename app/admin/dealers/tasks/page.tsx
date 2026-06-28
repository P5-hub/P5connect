"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Search,
  Store,
  XCircle,
} from "lucide-react";

type Dealer = {
  dealer_id: number;
  name: string | null;
  login_nr: string | null;
  kam: string | null;
  city: string | null;
};

type DealerTask = {
  task_id: number;
  dealer_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
  assigned_to: string | null;
  created_at: string;
  done_at: string | null;
};

type TaskRow = DealerTask & {
  dealer?: Dealer | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
}

function isOverdue(dateValue: string | null | undefined) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dateValue);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function isDueThisWeek(dateValue: string | null | undefined) {
  if (!dateValue) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setDate(today.getDate() + 7);
  end.setHours(23, 59, 59, 999);

  const dueDate = new Date(dateValue);

  return dueDate >= today && dueDate <= end;
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

export default function AdminDealerTasksPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [tasks, setTasks] = useState<DealerTask[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"open" | "done" | "cancelled" | "all">("open");
  const [kamFilter, setKamFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState<"all" | "overdue" | "week" | "no_due_date">("all");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [tasksRes, dealersRes] = await Promise.all([
        supabase
          .from("dealer_tasks")
          .select("task_id, dealer_id, title, description, due_date, status, assigned_to, created_at, done_at")
          .order("status", { ascending: true })
          .order("due_date", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false }),

        supabase
          .from("dealers")
          .select("dealer_id, name, login_nr, kam, city")
          .order("name", { ascending: true }),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (dealersRes.error) throw dealersRes.error;

      setTasks((tasksRes.data ?? []) as DealerTask[]);
      setDealers((dealersRes.data ?? []) as Dealer[]);
    } catch (error) {
      console.error("Fehler beim Laden der Tasks:", error);
      showToast("error", "Tasks konnten nicht geladen werden.");
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

  const taskRows = useMemo<TaskRow[]>(() => {
    return tasks.map((task) => ({
      ...task,
      dealer: dealerById.get(Number(task.dealer_id)) ?? null,
    }));
  }, [tasks, dealerById]);

  const kamOptions = useMemo(() => {
    const values = taskRows
      .map((task) => task.assigned_to || task.dealer?.kam || "")
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "de-CH"));
  }, [taskRows]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return taskRows.filter((task) => {
      const dealer = task.dealer;

      const matchesStatus = statusFilter === "all" || task.status === statusFilter;

      const kamText = task.assigned_to || dealer?.kam || "";
      const matchesKam = kamFilter === "all" || kamText === kamFilter;

      const matchesDue =
        dueFilter === "all" ||
        (dueFilter === "overdue" && task.status === "open" && isOverdue(task.due_date)) ||
        (dueFilter === "week" && task.status === "open" && isDueThisWeek(task.due_date)) ||
        (dueFilter === "no_due_date" && !task.due_date);

      const matchesSearch =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.description?.toLowerCase().includes(q) ||
        task.assigned_to?.toLowerCase().includes(q) ||
        dealer?.name?.toLowerCase().includes(q) ||
        dealer?.login_nr?.toLowerCase().includes(q) ||
        dealer?.city?.toLowerCase().includes(q) ||
        dealer?.kam?.toLowerCase().includes(q);

      return matchesStatus && matchesKam && matchesDue && matchesSearch;
    });
  }, [taskRows, search, statusFilter, kamFilter, dueFilter]);

  const openCount = taskRows.filter((task) => task.status === "open").length;
  const overdueCount = taskRows.filter(
    (task) => task.status === "open" && isOverdue(task.due_date)
  ).length;
  const dueThisWeekCount = taskRows.filter(
    (task) => task.status === "open" && isDueThisWeek(task.due_date)
  ).length;
  const doneCount = taskRows.filter((task) => task.status === "done").length;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("open");
    setKamFilter("all");
    setDueFilter("all");
  };

  const updateTask = async () => {
  if (!editingTask) return;

  const title = editingTask.title.trim();

  if (!title) {
      showToast("error", "Bitte einen Task-Titel eingeben.");
      return;
  }

  try {
      setSavingEdit(true);

      const { error } = await supabase
      .from("dealer_tasks")
      .update({
          title,
          description: editingTask.description?.trim() || null,
          due_date: editingTask.due_date || null,
          assigned_to: editingTask.assigned_to?.trim() || null,
          status: editingTask.status,
      })
      .eq("task_id", editingTask.task_id);

      if (error) throw error;

      showToast("success", "Task wurde aktualisiert.");
      setEditingTask(null);
      await loadData();
  } catch (error) {
      console.error("Fehler beim Bearbeiten Task:", error);
      showToast("error", "Task konnte nicht gespeichert werden.");
  } finally {
      setSavingEdit(false);
  }
  };

  const updateTaskStatus = async (
    taskId: number,
    status: "open" | "done" | "cancelled"
  ) => {
    try {
      setSavingTaskId(taskId);

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
    } finally {
      setSavingTaskId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <Clock3 className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Tasks</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Globale Übersicht aller offenen und erledigten Händler-Tasks.
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
        <StatCard title="Offene Tasks" value={String(openCount)} />
        <StatCard title="Überfällig" value={String(overdueCount)} />
        <StatCard title="Fällig in 7 Tagen" value={String(dueThisWeekCount)} />
        <StatCard title="Erledigt" value={String(doneCount)} />
      </div>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Task, Händler, Login, Ort, KAM oder Beschreibung suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "open" | "done" | "cancelled" | "all")
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Nur offene Tasks</option>
            <option value="done">Nur erledigte Tasks</option>
            <option value="cancelled">Nur abgebrochene Tasks</option>
            <option value="all">Alle Status</option>
          </select>

          <select
            value={kamFilter}
            onChange={(event) => setKamFilter(event.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Zuständigen/KAM</option>
            {kamOptions.map((kam) => (
              <option key={kam} value={kam}>
                {kam}
              </option>
            ))}
          </select>

          <select
            value={dueFilter}
            onChange={(event) =>
              setDueFilter(event.target.value as "all" | "overdue" | "week" | "no_due_date")
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Fälligkeiten</option>
            <option value="overdue">Überfällig</option>
            <option value="week">Fällig in 7 Tagen</option>
            <option value="no_due_date">Ohne Fälligkeitsdatum</option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={resetFilters}>
            Filter zurücksetzen
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Tasks werden geladen...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            Keine Tasks mit diesen Filtern vorhanden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Task</th>
                  <th className="px-3 py-2">Händler</th>
                  <th className="px-3 py-2">Fällig</th>
                  <th className="px-3 py-2">Zuständig</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Aktion</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const overdue = task.status === "open" && isOverdue(task.due_date);
                  const dueSoon = task.status === "open" && isDueThisWeek(task.due_date);

                  return (
                    <tr key={task.task_id} className="bg-gray-50 align-top text-sm text-gray-700">
                      <td className="min-w-[280px] px-3 py-3">
                        <div className="font-semibold text-gray-900">{task.title}</div>
                        {task.description ? (
                          <div className="mt-1 whitespace-pre-wrap text-xs text-gray-500">
                            {task.description}
                          </div>
                        ) : null}
                        <div className="mt-1 text-xs text-gray-400">
                          Erstellt: {formatDate(task.created_at)}
                        </div>
                      </td>

                      <td className="min-w-[220px] px-3 py-3">
                        <div className="font-medium text-gray-900">
                          {task.dealer?.name || `Dealer #${task.dealer_id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {task.dealer_id} · Login: {task.dealer?.login_nr || "–"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.dealer?.city || "–"} · KAM: {task.dealer?.kam || "–"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <div
                          className={
                            overdue
                              ? "font-semibold text-red-700"
                              : dueSoon
                              ? "font-semibold text-orange-700"
                              : "text-gray-700"
                          }
                        >
                          {formatDate(task.due_date)}
                        </div>
                        {overdue ? (
                          <div className="text-xs text-red-600">Überfällig</div>
                        ) : dueSoon ? (
                          <div className="text-xs text-orange-600">Fällig bald</div>
                        ) : null}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        {task.assigned_to || task.dealer?.kam || "–"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            task.status === "open"
                              ? "bg-orange-100 text-orange-800"
                              : task.status === "done"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status === "open"
                            ? "Offen"
                            : task.status === "done"
                            ? "Erledigt"
                            : "Abgebrochen"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTask(task)}
                          >
                            Bearbeiten
                          </Button>
                          {task.status !== "done" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={savingTaskId === task.task_id}
                              onClick={() => updateTaskStatus(task.task_id, "done")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Erledigt
                            </Button>
                          ) : null}

                          {task.status === "open" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={savingTaskId === task.task_id}
                              onClick={() => updateTaskStatus(task.task_id, "cancelled")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Abbrechen
                            </Button>
                          ) : null}

                          {task.status !== "open" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={savingTaskId === task.task_id}
                              onClick={() => updateTaskStatus(task.task_id, "open")}
                            >
                              <Clock3 className="mr-2 h-4 w-4" />
                              Wieder öffnen
                            </Button>
                          ) : null}

                          <Link href={`/admin/dealers/${task.dealer_id}`}>
                            <Button type="button" size="sm">
                              <Store className="mr-2 h-4 w-4" />
                              Händlerakte
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingTask && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Task bearbeiten
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Aufgabe, Fälligkeit, Zuständigkeit und Status ändern.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Titel *
                </label>
                <input
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
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
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask((prev) =>
                      prev ? { ...prev, description: e.target.value } : prev
                    )
                  }
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fällig am
                  </label>
                  <input
                    type="date"
                    value={editingTask.due_date || ""}
                    onChange={(e) =>
                      setEditingTask((prev) =>
                        prev ? { ...prev, due_date: e.target.value } : prev
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Zuständig
                  </label>
                  <input
                    value={editingTask.assigned_to || ""}
                    onChange={(e) =>
                      setEditingTask((prev) =>
                        prev ? { ...prev, assigned_to: e.target.value } : prev
                      )
                    }
                    placeholder="z. B. Matthias"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: e.target.value as "open" | "done" | "cancelled",
                            }
                          : prev
                      )
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open">Offen</option>
                    <option value="done">Erledigt</option>
                    <option value="cancelled">Abgebrochen</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
                <div className="font-medium text-gray-900">
                  {editingTask.dealer?.name || `Dealer #${editingTask.dealer_id}`}
                </div>
                <div>
                  Login: {editingTask.dealer?.login_nr || "–"} ·{" "}
                  {editingTask.dealer?.city || "–"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingTask(null)}
                disabled={savingEdit}
              >
                Abbrechen
              </Button>

              <Button
                type="button"
                onClick={updateTask}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Speichern
              </Button>
            </div>
          </div>
        </div>
      )}

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