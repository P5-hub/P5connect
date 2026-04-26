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
  Plus,
  RefreshCcw,
  Search,
  Store,
  Tag,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Dealer = {
  dealer_id: number;
  name: string | null;
  email: string | null;
  login_nr: string | null;
  kam?: string | null;
  city?: string | null;
};

type DealerUser = {
  id: number;
  dealer_id: number;
  user_email: string;
  display_name: string | null;
  role: string | null;
  created_at: string | null;
};

type DealerTag = {
  tag_id: number;
  label: string;
  category: "interest" | "crm" | "custom";
  is_active?: boolean;
  sort_order?: number | null;
};

type DealerUserTagAssignment = {
  dealer_user_id: number;
  tag_id: number;
};

type DealerTask = {
  task_id: number;
  dealer_id: number;
  title: string;
  due_date: string | null;
  status: "open" | "done" | "cancelled";
  assigned_to: string | null;
};

type ContactRow = {
  user: DealerUser;
  dealer: Dealer | null;
  tags: DealerTag[];
  openTasks: number;
};

function formatInteger(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return Number(value).toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-gray-700">{children}</label>;
}

export default function AdminContactsPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingContact, setSavingContact] = useState(false);

  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [dealerUsers, setDealerUsers] = useState<DealerUser[]>([]);
  const [tags, setTags] = useState<DealerTag[]>([]);
  const [userTagAssignments, setUserTagAssignments] = useState<DealerUserTagAssignment[]>([]);
  const [tasks, setTasks] = useState<DealerTask[]>([]);

  const [search, setSearch] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const [crmFilter, setCrmFilter] = useState("");
  const [openTasksOnly, setOpenTasksOnly] = useState(false);
  const [sortMode, setSortMode] = useState<"dealer" | "contact" | "openTasks" | "created">("dealer");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    dealer_id: "",
    display_name: "",
    user_email: "",
    role: "",
  });
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [dealersRes, usersRes, tagsRes, userTagRes, tasksRes] = await Promise.all([
        supabase
          .from("dealers")
          .select("dealer_id, name, email, login_nr, kam, city")
          .order("name", { ascending: true }),

        supabase
          .from("dealer_users")
          .select("id, dealer_id, user_email, display_name, role, created_at")
          .order("created_at", { ascending: false }),

        supabase
          .from("dealer_tags")
          .select("tag_id, label, category, is_active, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("label", { ascending: true }),

        supabase
          .from("dealer_user_tag_assignments")
          .select("dealer_user_id, tag_id"),

        supabase
          .from("dealer_tasks")
          .select("task_id, dealer_id, title, due_date, status, assigned_to"),
      ]);

      if (dealersRes.error) throw dealersRes.error;
      if (usersRes.error) throw usersRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (userTagRes.error) throw userTagRes.error;
      if (tasksRes.error) throw tasksRes.error;

      setDealers((dealersRes.data ?? []) as Dealer[]);
      setDealerUsers((usersRes.data ?? []) as DealerUser[]);
      setTags((tagsRes.data ?? []) as DealerTag[]);
      setUserTagAssignments((userTagRes.data ?? []) as DealerUserTagAssignment[]);
      setTasks((tasksRes.data ?? []) as DealerTask[]);
    } catch (error) {
      console.error("Fehler beim Laden der Kontaktübersicht:", error);
      showToast("error", "Kontakte konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const interestTags = useMemo(
    () => tags.filter((tag) => tag.category === "interest"),
    [tags]
  );

  const crmTags = useMemo(
    () => tags.filter((tag) => tag.category === "crm" || tag.category === "custom"),
    [tags]
  );

  const roles = useMemo(
    () =>
      [...new Set(dealerUsers.map((user) => user.role).filter(Boolean) as string[])].sort(
        (a, b) => a.localeCompare(b, "de-CH")
      ),
    [dealerUsers]
  );

  const contactRows = useMemo<ContactRow[]>(() => {
    const dealerById = new Map<number, Dealer>();
    dealers.forEach((dealer) => dealerById.set(Number(dealer.dealer_id), dealer));

    const tagById = new Map<number, DealerTag>();
    tags.forEach((tag) => tagById.set(Number(tag.tag_id), tag));

    const tagsByUser = new Map<number, DealerTag[]>();
    userTagAssignments.forEach((assignment) => {
      const dealerUserId = Number(assignment.dealer_user_id);
      const tag = tagById.get(Number(assignment.tag_id));
      if (!tag) return;

      if (!tagsByUser.has(dealerUserId)) tagsByUser.set(dealerUserId, []);
      tagsByUser.get(dealerUserId)!.push(tag);
    });

    const openTasksByEmail = new Map<string, number>();
    tasks.forEach((task) => {
      if (task.status !== "open") return;
      if (!task.assigned_to) return;

      const key = task.assigned_to.trim().toLowerCase();
      openTasksByEmail.set(key, (openTasksByEmail.get(key) ?? 0) + 1);
    });

    return dealerUsers.map((user) => {
      const emailKey = user.user_email.trim().toLowerCase();

      return {
        user,
        dealer: dealerById.get(Number(user.dealer_id)) ?? null,
        tags: tagsByUser.get(Number(user.id)) ?? [],
        openTasks: openTasksByEmail.get(emailKey) ?? 0,
      };
    });
  }, [dealerUsers, dealers, tags, userTagAssignments, tasks]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = contactRows.filter((row) => {
      const dealer = row.dealer;
      const user = row.user;
      const tagIds = row.tags.map((tag) => String(tag.tag_id));

      const matchesSearch =
        !q ||
        user.display_name?.toLowerCase().includes(q) ||
        user.user_email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        dealer?.name?.toLowerCase().includes(q) ||
        dealer?.email?.toLowerCase().includes(q) ||
        dealer?.login_nr?.toLowerCase().includes(q) ||
        dealer?.kam?.toLowerCase().includes(q) ||
        dealer?.city?.toLowerCase().includes(q);

      const matchesDealer = !dealerFilter || String(user.dealer_id) === dealerFilter;
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesInterest = !interestFilter || tagIds.includes(interestFilter);
      const matchesCrm = !crmFilter || tagIds.includes(crmFilter);
      const matchesOpenTasks = !openTasksOnly || row.openTasks > 0;

      return (
        matchesSearch &&
        matchesDealer &&
        matchesRole &&
        matchesInterest &&
        matchesCrm &&
        matchesOpenTasks
      );
    });

    result = [...result].sort((a, b) => {
      if (sortMode === "contact") {
        return (a.user.display_name || a.user.user_email || "").localeCompare(
          b.user.display_name || b.user.user_email || "",
          "de-CH"
        );
      }

      if (sortMode === "openTasks") return b.openTasks - a.openTasks;

      if (sortMode === "created") {
        return (
          new Date(b.user.created_at || "1900-01-01").getTime() -
          new Date(a.user.created_at || "1900-01-01").getTime()
        );
      }

      return (a.dealer?.name || "").localeCompare(b.dealer?.name || "", "de-CH");
    });

    return result;
  }, [
    contactRows,
    search,
    dealerFilter,
    roleFilter,
    interestFilter,
    crmFilter,
    openTasksOnly,
    sortMode,
  ]);

  const contactsWithTags = contactRows.filter((row) => row.tags.length > 0).length;
  const contactsWithOpenTasks = contactRows.filter((row) => row.openTasks > 0).length;
  const openTasksTotal = contactRows.reduce((sum, row) => sum + row.openTasks, 0);

  const resetFilters = () => {
    setSearch("");
    setDealerFilter("");
    setRoleFilter("");
    setInterestFilter("");
    setCrmFilter("");
    setOpenTasksOnly(false);
    setSortMode("dealer");
  };

  const toggleSelectedTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const openCreateModal = () => {
    setContactForm({
      dealer_id: "",
      display_name: "",
      user_email: "",
      role: "",
    });
    setSelectedTagIds([]);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (savingContact) return;
    setIsCreateOpen(false);
  };

  const createContact = async () => {
    const dealerId = Number(contactForm.dealer_id);
    const email = contactForm.user_email.trim().toLowerCase();
    const displayName = contactForm.display_name.trim();
    const role = contactForm.role.trim();

    if (!dealerId || Number.isNaN(dealerId)) {
      showToast("error", "Bitte Händler auswählen.");
      return;
    }

    if (!displayName) {
      showToast("error", "Bitte Namen eingeben.");
      return;
    }

    if (!email || !email.includes("@")) {
      showToast("error", "Bitte gültige E-Mail eingeben.");
      return;
    }

    try {
      setSavingContact(true);

      const { data: existingUser, error: existingError } = await supabase
        .from("dealer_users")
        .select("id")
        .eq("dealer_id", dealerId)
        .eq("user_email", email)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existingUser) {
        showToast("error", "Dieser Kontakt existiert bei diesem Händler bereits.");
        return;
      }

      const { data: insertedUser, error: insertError } = await supabase
        .from("dealer_users")
        .insert({
          dealer_id: dealerId,
          user_email: email,
          display_name: displayName,
          role: role || null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const dealerUserId = Number(insertedUser.id);

      if (selectedTagIds.length > 0) {
        const payload = selectedTagIds.map((tagId) => ({
          dealer_user_id: dealerUserId,
          tag_id: tagId,
        }));

        const { error: tagError } = await supabase
          .from("dealer_user_tag_assignments")
          .insert(payload);

        if (tagError) throw tagError;
      }

      showToast("success", "Kontakt wurde angelegt.");
      setIsCreateOpen(false);
      setContactForm({
        dealer_id: "",
        display_name: "",
        user_email: "",
        role: "",
      });
      setSelectedTagIds([]);
      await loadData();
    } catch (error) {
      console.error("Fehler beim Erstellen des Kontakts:", error);
      showToast("error", "Kontakt konnte nicht erstellt werden.");
    } finally {
      setSavingContact(false);
    }
  };

  const renderTagPills = (items: DealerTag[], category: "interest" | "crm") => {
    const filtered =
      category === "interest"
        ? items.filter((tag) => tag.category === "interest")
        : items.filter((tag) => tag.category === "crm" || tag.category === "custom");

    if (filtered.length === 0) return <span className="text-gray-400">–</span>;

    return (
      <div className="flex flex-wrap gap-1">
        {filtered.slice(0, 5).map((tag) => (
          <span
            key={tag.tag_id}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
              category === "interest"
                ? "bg-blue-50 text-blue-700 ring-blue-100"
                : "bg-amber-50 text-amber-700 ring-amber-100"
            }`}
          >
            {tag.label}
          </span>
        ))}
        {filtered.length > 5 ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            +{filtered.length - 5}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-900">
            <Users className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-semibold">Kontaktübersicht</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Mitarbeiter pro Händler mit Interessen, CRM-Merkmalen und offenen Tasks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadData}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Aktualisieren
          </Button>

          <Button type="button" onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Kontakt anlegen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Kontakte angezeigt" value={formatInteger(filteredRows.length)} />
        <StatCard title="Mit Tags" value={formatInteger(contactsWithTags)} />
        <StatCard title="Mit offenen Tasks" value={formatInteger(contactsWithOpenTasks)} />
        <StatCard title="Offene Tasks total" value={formatInteger(openTasksTotal)} />
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
              placeholder="Kontakt, Händler, E-Mail, Rolle, Login, KAM oder Ort suchen..."
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={dealerFilter}
            onChange={(e) => setDealerFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Händler</option>
            {dealers.map((dealer) => (
              <option key={dealer.dealer_id} value={String(dealer.dealer_id)}>
                {dealer.name || `Dealer #${dealer.dealer_id}`}
              </option>
            ))}
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alle Rollen</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
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
            value={sortMode}
            onChange={(e) =>
              setSortMode(e.target.value as "dealer" | "contact" | "openTasks" | "created")
            }
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dealer">Sortierung: Händler</option>
            <option value="contact">Sortierung: Kontakt</option>
            <option value="openTasks">Sortierung: offene Tasks</option>
            <option value="created">Sortierung: erstellt</option>
          </select>

          <label className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={openTasksOnly}
              onChange={(e) => setOpenTasksOnly(e.target.checked)}
            />
            Nur Kontakte mit offenen Tasks
          </label>
        </div>
      </Card>

      <Card className="rounded-2xl border border-gray-200 p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">Kontakte</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {filteredRows.length} von {contactRows.length} Kontakten angezeigt.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Kontaktübersicht wird geladen...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Kontakt</th>
                  <th className="px-3 py-2">Händler</th>
                  <th className="px-3 py-2">Interessen</th>
                  <th className="px-3 py-2">CRM-Merkmale</th>
                  <th className="px-3 py-2">Tasks</th>
                  <th className="px-3 py-2">Erstellt</th>
                  <th className="px-3 py-2">Aktion</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-sm text-gray-500">
                      Keine Kontakte mit diesen Filtern gefunden.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.user.id} className="bg-gray-50 text-sm text-gray-700">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-gray-900">
                          {row.user.display_name || row.user.user_email}
                        </div>
                        <div className="text-xs text-gray-500">{row.user.user_email}</div>
                        {row.user.role ? (
                          <span className="mt-1 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                            {row.user.role}
                          </span>
                        ) : null}
                      </td>

                      <td className="px-3 py-3 min-w-[240px]">
                        <div className="font-medium text-gray-900">
                          {row.dealer?.name || `Dealer #${row.user.dealer_id}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {row.user.dealer_id} · Login: {row.dealer?.login_nr || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.dealer?.city || "-"} · KAM: {row.dealer?.kam || "-"}
                        </div>
                      </td>

                      <td className="px-3 py-3 min-w-[220px]">
                        {renderTagPills(row.tags, "interest")}
                      </td>

                      <td className="px-3 py-3 min-w-[220px]">
                        {renderTagPills(row.tags, "crm")}
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Clock3 className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-gray-900">{row.openTasks}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">{formatDate(row.user.created_at)}</td>

                      <td className="px-3 py-3">
                        <Link href={`/admin/dealers/${row.user.dealer_id}`}>
                          <Button type="button" size="sm">
                            <Store className="mr-2 h-4 w-4" />
                            Händlerakte öffnen
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
      </Card>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <b>Hinweis:</b> Diese Seite zeigt personenbezogene Interessen und CRM-Merkmale aus{" "}
        <code>dealer_user_tag_assignments</code>. Die Händlerübersicht bleibt bewusst auf
        Händler-Level.
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Kontakt anlegen</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Kontakt einem Händler zuweisen und direkt Interessen/CRM-Merkmale speichern.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Händler</FieldLabel>
                <select
                  value={contactForm.dealer_id}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, dealer_id: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Händler auswählen</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.dealer_id} value={String(dealer.dealer_id)}>
                      {dealer.name || `Dealer #${dealer.dealer_id}`} · Login{" "}
                      {dealer.login_nr || "-"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Name</FieldLabel>
                <input
                  value={contactForm.display_name}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, display_name: e.target.value }))
                  }
                  placeholder="z. B. Roger Müller"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <FieldLabel>E-Mail</FieldLabel>
                <input
                  type="email"
                  value={contactForm.user_email}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, user_email: e.target.value }))
                  }
                  placeholder="roger@example.com"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Rolle / Funktion</FieldLabel>
                <input
                  value={contactForm.role}
                  onChange={(e) =>
                    setContactForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="z. B. Sales, Inhaber, Einkauf, Filialleiter"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Tag className="h-4 w-4 text-blue-600" />
                  Interessen
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestTags.map((tag) => {
                    const active = selectedTagIds.includes(Number(tag.tag_id));
                    return (
                      <button
                        key={tag.tag_id}
                        type="button"
                        onClick={() => toggleSelectedTag(Number(tag.tag_id))}
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
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Tag className="h-4 w-4 text-amber-600" />
                  CRM-Merkmale
                </div>
                <div className="flex flex-wrap gap-2">
                  {crmTags.map((tag) => {
                    const active = selectedTagIds.includes(Number(tag.tag_id));
                    return (
                      <button
                        key={tag.tag_id}
                        type="button"
                        onClick={() => toggleSelectedTag(Number(tag.tag_id))}
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
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={closeCreateModal} disabled={savingContact}>
                Abbrechen
              </Button>

              <Button type="button" onClick={createContact} disabled={savingContact}>
                {savingContact ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Kontakt speichern
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
