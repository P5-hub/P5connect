  "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Edit3,
  History,
  Loader2,
  MessageSquare,
  MonitorSmartphone,
  Plus,
  Save,
  Settings2,
  Store,
  Tag,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";

type DealerRow = {
  dealer_id: number;
  login_nr: string;
  name: string;
  role: string | null;
  distribution: string | null;
  mail_bg: string | null;
  mail_bg2: string | null;
  mail_kam: string | null;
  mail_sony: string | null;
  mail_kam2: string | null;
  mail_dealer: string | null;
  store_name: string | null;
  kam: string | null;
  street: string | null;
  plz: string | null;
  city: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  language: string | null;
  customer_type: string | null;
  customer_classification: string | null;
  serp: string | null;
  sds: string | null;
  fivej_gv: string | null;
  ecot4: string | null;
  description: string | null;
  login_email: string;
  zip: string | null;
  country: string | null;
  kam_name: string | null;
  contact_person: string | null;
  kam_email_sony: string | null;
  auth_user_id: string | null;
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

type DealerTagCategory = "interest" | "crm" | "custom";

type DealerTag = {
  tag_id: number;
  label: string;
  category: DealerTagCategory;
  is_active: boolean;
  sort_order: number;
};

type DealerTagAssignmentRow = { tag_id: number };

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

type DealerUser = {
  id: number;
  dealer_id: number;
  user_email: string;
  display_name: string | null;
  role: string | null;
};

type DealerUserTagAssignment = {
  id: number;
  dealer_user_id: number;
  tag_id: number;
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
  market_total_sales: number | null;
  tv_total_all: number | null;
  tv_total_sony: number | null;
  sb_total_all: number | null;
  sb_total_sony: number | null;
  sony_sales_snapshot: number | null;
  sellin_snapshot_period_mode: string | null;
  sellin_snapshot_period_start: string | null;
  sellin_snapshot_period_end: string | null;
  sony_share_percent_snapshot: number | null;
  tv_sony_share_percent_snapshot: number | null;
  sb_sony_share_percent_snapshot: number | null;
  snapshot_period_type: string | null;
  snapshot_period_start: string | null;
  snapshot_period_end: string | null;
  sellout_total_sales: number | null;
  sellout_sony_total: number | null;
  tv_total_sales: number | null;
  tv_sony_sales: number | null;
  sb_total_sales: number | null;
  sb_sony_sales: number | null;
  tv_total_qty: number | null;
  tv_sony_qty: number | null;
  sb_total_qty: number | null;
  sb_sony_qty: number | null;
  rest_total_sales: number | null;
  rest_sony_sales: number | null;
  created_at: string;
  updated_at?: string | null;
  updated_by?: string | null;
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

type PeriodMode = "month" | "quarter" | "halfyear" | "year" | "ytd_calendar" | "ytd_fiscal";
type TopProduct = { label: string; qty: number; revenue: number };

type VisitFormState = {
  visit_date: string;
  visited_by: string;
  contact_persons: string;
  discussed: string;
  agreed: string;
  next_steps: string;
  open_points: string;
  what_went_well: string;
  what_went_less_well: string;
  competition_market_info: string;
  branding_visibility: string;
  snapshot_period_type: string;
  snapshot_period_start: string;
  snapshot_period_end: string;
  sellout_total_sales: string;
  sellout_sony_total: string;
  tv_total_sales: string;
  tv_sony_sales: string;
  sb_total_sales: string;
  sb_sony_sales: string;
  tv_total_qty: string;
  tv_sony_qty: string;
  sb_total_qty: string;
  sb_sony_qty: string;
  rest_total_sales: string;
  rest_sony_sales: string;
  market_total_sales: string;
  tv_total_all: string;
  tv_total_sony: string;
  sb_total_all: string;
  sb_total_sony: string;
};

type TagGroup = {
  key: DealerTagCategory;
  title: string;
  subtitle: string;
  badgeClass: string;
  panelClass: string;
  activeClass: string;
  inactiveClass: string;
};

const FISCAL_YEAR_START_MONTH = 4;

const TAG_GROUPS: TagGroup[] = [
  {
    key: "crm",
    title: "CRM-Merkmale",
    subtitle: "Business-Verhalten, CE-Ausrichtung, POS, Training, Reporting und Potenzial.",
    badgeClass: "bg-amber-100 text-amber-800 ring-amber-200",
    panelClass: "border-amber-100 bg-amber-50/60",
    activeClass: "bg-amber-600 text-white ring-amber-600",
    inactiveClass: "border border-amber-200 bg-white text-amber-800 hover:bg-amber-50",
  },
  {
    key: "interest",
    title: "Interessen / persönliche Hinweise",
    subtitle: "Hobbys und persönliche Anknüpfungspunkte für Gespräche und Beziehungspflege.",
    badgeClass: "bg-blue-100 text-blue-800 ring-blue-200",
    panelClass: "border-blue-100 bg-blue-50/60",
    activeClass: "bg-blue-600 text-white ring-blue-600",
    inactiveClass: "border border-blue-200 bg-white text-blue-800 hover:bg-blue-50",
  },
  {
    key: "custom",
    title: "Custom Tags",
    subtitle: "Individuell erstellte Zusatz-Tags.",
    badgeClass: "bg-slate-100 text-slate-800 ring-slate-200",
    panelClass: "border-slate-200 bg-slate-50/70",
    activeClass: "bg-slate-700 text-white ring-slate-700",
    inactiveClass: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  },
];

const emptyDealerForm = {
  name: "",
  store_name: "",
  email: "",
  login_email: "",
  login_nr: "",
  contact_person: "",
  phone: "",
  fax: "",
  website: "",
  street: "",
  plz: "",
  zip: "",
  city: "",
  country: "",
  language: "",
  distribution: "",
  kam: "",
  kam_name: "",
  kam_email_sony: "",
  mail_dealer: "",
  mail_kam: "",
  mail_kam2: "",
  mail_bg: "",
  mail_bg2: "",
  mail_sony: "",
  customer_type: "",
  customer_classification: "",
  serp: "",
  sds: "",
  fivej_gv: "",
  ecot4: "",
  description: "",
};

function createEmptyVisitForm(): VisitFormState {
  return {
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
    snapshot_period_type: "quarter",
    snapshot_period_start: "",
    snapshot_period_end: "",
    sellout_total_sales: "",
    sellout_sony_total: "",
    tv_total_sales: "",
    tv_sony_sales: "",
    tv_total_qty: "",
    tv_sony_qty: "",
    sb_total_sales: "",
    sb_sony_sales: "",
    sb_total_qty: "",
    sb_sony_qty: "",
    rest_total_sales: "",
    rest_sony_sales: "",
    market_total_sales: "",
    tv_total_all: "",
    tv_total_sony: "",
    sb_total_all: "",
    sb_total_sony: "",
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-gray-700">{children}</label>;
}

function Textarea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (value: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />;
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{title}</div><div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>{subtitle ? <div className="mt-1 text-xs text-gray-500">{subtitle}</div> : null}</div>;
}

function SectionHeader({ icon, title, subtitle, action }: { icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2">{icon}<h2 className="text-lg font-semibold text-gray-900">{title}</h2></div>{subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}</div>{action}</div>;
}

function formatCurrency(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return `${Number(value).toLocaleString("de-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CHF`;
}

function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return `${Number(value).toLocaleString("de-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatInteger(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "–";
  return Number(value).toLocaleString("de-CH", { maximumFractionDigits: 0 });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString("de-CH");
}

function toDateInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toNumberOrNull(value: string) {
  if (!value.trim()) return null;
  const cleaned = value.replace(/'/g, "").replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function calcSharePercent(sony: number | null | undefined, total: number | null | undefined) {
  if (sony == null || total == null || total <= 0) return null;
  return (sony / total) * 100;
}

function numberToInput(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) return "";
  return String(value);
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
    case "month": return "Monat";
    case "quarter": return "Quartal";
    case "halfyear": return "Halbjahr";
    case "year": return "Jahr";
    case "ytd_calendar": return "YTD Kalenderjahr";
    case "ytd_fiscal": return "YTD Fiscal Year";
    default: return "Zeitraum";
  }
}

function getDateRange(periodMode: PeriodMode, now = new Date()) {
  const current = new Date(now);
  const year = current.getFullYear();
  const month = current.getMonth() + 1;
  let start: Date;
  let end = endOfDay(current);

  if (periodMode === "month") start = new Date(year, current.getMonth(), 1);
  else if (periodMode === "quarter") start = new Date(year, Math.floor(current.getMonth() / 3) * 3, 1);
  else if (periodMode === "halfyear") start = new Date(year, current.getMonth() < 6 ? 0 : 6, 1);
  else if (periodMode === "year") { start = new Date(year, 0, 1); end = new Date(year, 11, 31, 23, 59, 59, 999); }
  else if (periodMode === "ytd_calendar") start = new Date(year, 0, 1);
  else start = new Date(month >= FISCAL_YEAR_START_MONTH ? year : year - 1, FISCAL_YEAR_START_MONTH - 1, 1);

  return { start: startOfDay(start), end };
}

function isDateWithin(dateValue: string | null | undefined, start: Date, end: Date) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  return d >= start && d <= end;
}

function sortTags(tags: DealerTag[]) {
  return [...tags].sort((a, b) => a.sort_order !== b.sort_order ? a.sort_order - b.sort_order : a.label.localeCompare(b.label, "de-CH"));
}

function getTagGroup(category: DealerTagCategory) {
  return TAG_GROUPS.find((group) => group.key === category) ?? TAG_GROUPS[2];
}

function buildVisitPayloadFromForm({
  dealerId,
  currentUser,
  contactPersons,
  autoSonyRevenue,
  periodMode,
  form,
}: {
  dealerId: number;
  currentUser: string;
  contactPersons: string | null;
  autoSonyRevenue: number;
  periodMode: PeriodMode;
  form: VisitFormState;
}) {
  const selloutTotal = toNumberOrNull(form.sellout_total_sales);
  const selloutSony = toNumberOrNull(form.sellout_sony_total);
  const tvTotal = toNumberOrNull(form.tv_total_sales);
  const tvSony = toNumberOrNull(form.tv_sony_sales);
  const sbTotal = toNumberOrNull(form.sb_total_sales);
  const sbSony = toNumberOrNull(form.sb_sony_sales);
  const tvTotalQty = toNumberOrNull(form.tv_total_qty);
  const tvSonyQty = toNumberOrNull(form.tv_sony_qty);
  const sbTotalQty = toNumberOrNull(form.sb_total_qty);
  const sbSonyQty = toNumberOrNull(form.sb_sony_qty);
  const restTotal = toNumberOrNull(form.rest_total_sales);
  const restSony = toNumberOrNull(form.rest_sony_sales);
  const sellinRange = getDateRange(periodMode);

  return {
    dealer_id: dealerId,
    visit_date: form.visit_date || new Date().toISOString().slice(0, 10),
    visited_by: form.visited_by.trim() || null,
    contact_persons: contactPersons,
    discussed: form.discussed.trim() || null,
    agreed: form.agreed.trim() || null,
    next_steps: form.next_steps.trim() || null,
    open_points: form.open_points.trim() || null,
    what_went_well: form.what_went_well.trim() || null,
    what_went_less_well: form.what_went_less_well.trim() || null,
    competition_market_info: form.competition_market_info.trim() || null,
    branding_visibility: form.branding_visibility.trim() || null,
    snapshot_period_type: form.snapshot_period_type || null,
    snapshot_period_start: form.snapshot_period_start || null,
    snapshot_period_end: form.snapshot_period_end || null,
    sellout_total_sales: selloutTotal,
    sellout_sony_total: selloutSony,
    tv_total_sales: tvTotal,
    tv_sony_sales: tvSony,
    sb_total_sales: sbTotal,
    sb_sony_sales: sbSony,
    tv_total_qty: tvTotalQty,
    tv_sony_qty: tvSonyQty,
    sb_total_qty: sbTotalQty,
    sb_sony_qty: sbSonyQty,
    rest_total_sales: restTotal,
    rest_sony_sales: restSony,
    market_total_sales: selloutTotal,
    tv_total_all: tvTotal,
    tv_total_sony: tvSony,
    sb_total_all: sbTotal,
    sb_total_sony: sbSony,
    sony_sales_snapshot: autoSonyRevenue,
    sellin_snapshot_period_mode: periodMode,
    sellin_snapshot_period_start: toDateInputValue(sellinRange.start),
    sellin_snapshot_period_end: toDateInputValue(sellinRange.end),
    sony_share_percent_snapshot: calcSharePercent(selloutSony, selloutTotal),
    tv_sony_share_percent_snapshot: calcSharePercent(tvSony, tvTotal),
    sb_sony_share_percent_snapshot: calcSharePercent(sbSony, sbTotal),
    created_by: currentUser,
  };
}

function buildVisitUpdatePayload(editingVisit: VisitReport, currentUser: string) {
  const selloutTotal = editingVisit.sellout_total_sales ?? editingVisit.market_total_sales ?? null;
  const selloutSony = editingVisit.sellout_sony_total ?? null;
  const tvTotal = editingVisit.tv_total_sales ?? editingVisit.tv_total_all ?? null;
  const tvSony = editingVisit.tv_sony_sales ?? editingVisit.tv_total_sony ?? null;
  const sbTotal = editingVisit.sb_total_sales ?? editingVisit.sb_total_all ?? null;
  const sbSony = editingVisit.sb_sony_sales ?? editingVisit.sb_total_sony ?? null;
  const tvTotalQty = editingVisit.tv_total_qty ?? null;
  const tvSonyQty = editingVisit.tv_sony_qty ?? null;
  const sbTotalQty = editingVisit.sb_total_qty ?? null;
  const sbSonyQty = editingVisit.sb_sony_qty ?? null;
  const restTotal = editingVisit.rest_total_sales ?? null;
  const restSony = editingVisit.rest_sony_sales ?? null;

  return {
    visit_date: editingVisit.visit_date,
    visited_by: editingVisit.visited_by || null,
    contact_persons: editingVisit.contact_persons || null,
    discussed: editingVisit.discussed || null,
    agreed: editingVisit.agreed || null,
    next_steps: editingVisit.next_steps || null,
    open_points: editingVisit.open_points || null,
    what_went_well: editingVisit.what_went_well || null,
    what_went_less_well: editingVisit.what_went_less_well || null,
    competition_market_info: editingVisit.competition_market_info || null,
    branding_visibility: editingVisit.branding_visibility || null,
    snapshot_period_type: editingVisit.snapshot_period_type || null,
    snapshot_period_start: editingVisit.snapshot_period_start || null,
    snapshot_period_end: editingVisit.snapshot_period_end || null,
    sellout_total_sales: selloutTotal,
    sellout_sony_total: selloutSony,
    tv_total_sales: tvTotal,
    tv_sony_sales: tvSony,
    sb_total_sales: sbTotal,
    sb_sony_sales: sbSony,
    tv_total_qty: tvTotalQty,
    tv_sony_qty: tvSonyQty,
    sb_total_qty: sbTotalQty,
    sb_sony_qty: sbSonyQty,
    rest_total_sales: restTotal,
    rest_sony_sales: restSony,
    market_total_sales: selloutTotal,
    tv_total_all: tvTotal,
    tv_total_sony: tvSony,
    sb_total_all: sbTotal,
    sb_total_sony: sbSony,
    sony_sales_snapshot: editingVisit.sony_sales_snapshot ?? null,
    sellin_snapshot_period_mode: editingVisit.sellin_snapshot_period_mode ?? editingVisit.snapshot_period_type ?? null,
    sellin_snapshot_period_start: editingVisit.sellin_snapshot_period_start ?? null,
    sellin_snapshot_period_end: editingVisit.sellin_snapshot_period_end ?? null,
    sony_share_percent_snapshot: calcSharePercent(selloutSony, selloutTotal),
    tv_sony_share_percent_snapshot: calcSharePercent(tvSony, tvTotal),
    sb_sony_share_percent_snapshot: calcSharePercent(sbSony, sbTotal),
    updated_at: new Date().toISOString(),
    updated_by: currentUser,
  };
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
  const [dealerForm, setDealerForm] = useState(emptyDealerForm);
  const [allTags, setAllTags] = useState<DealerTag[]>([]);
  const [assignedTagIds, setAssignedTagIds] = useState<number[]>([]);
  const [tasks, setTasks] = useState<DealerTask[]>([]);
  const [dealerUsers, setDealerUsers] = useState<DealerUser[]>([]);
  const [editingUser, setEditingUser] = useState<DealerUser | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [dealerUserTagAssignments, setDealerUserTagAssignments] = useState<DealerUserTagAssignment[]>([]);
  const [visits, setVisits] = useState<VisitReport[]>([]);
  const [displayItems, setDisplayItems] = useState<DealerDisplayItem[]>([]);
  const [editingVisit, setEditingVisit] = useState<VisitReport | null>(null);
  const [savingVisitEdit, setSavingVisitEdit] = useState(false);

  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<"interest" | "crm">("crm");

  const [periodMode, setPeriodMode] = useState<PeriodMode>("quarter");
  const [autoSonyRevenue, setAutoSonyRevenue] = useState(0);
  const [autoSonyRevenuePrevYear, setAutoSonyRevenuePrevYear] = useState(0);
  const [autoDisplayOrderCount, setAutoDisplayOrderCount] = useState(0);
  const [autoPositionsCount, setAutoPositionsCount] = useState(0);
  const [autoTopProducts, setAutoTopProducts] = useState<TopProduct[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [profileForm, setProfileForm] = useState({ contact_person_name: "", contact_person_role: "", customer_type: "", region: "", partner_status: "", last_login_at: "", last_visit_date: "", birthdays_notes: "", personal_notes: "", general_notes: "" });
  const [taskForm, setTaskForm] = useState({ title: "", description: "", due_date: "", assigned_to: "" });
  const [visitForm, setVisitForm] = useState<VisitFormState>(createEmptyVisitForm());
  const [selectedVisitContactId, setSelectedVisitContactId] = useState("");
  const [displayForm, setDisplayForm] = useState({ product_name_snapshot: "", ordered_qty: "1", is_displayed: "yes" as "yes" | "no" | "unknown", note: "" });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const selloutTotal = useMemo(() => toNumberOrNull(visitForm.sellout_total_sales), [visitForm.sellout_total_sales]);
  const selloutSony = useMemo(() => toNumberOrNull(visitForm.sellout_sony_total), [visitForm.sellout_sony_total]);
  const tvTotalSales = useMemo(() => toNumberOrNull(visitForm.tv_total_sales), [visitForm.tv_total_sales]);
  const tvSonySales = useMemo(() => toNumberOrNull(visitForm.tv_sony_sales), [visitForm.tv_sony_sales]);
  const sbTotalSales = useMemo(() => toNumberOrNull(visitForm.sb_total_sales), [visitForm.sb_total_sales]);
  const sbSonySales = useMemo(() => toNumberOrNull(visitForm.sb_sony_sales), [visitForm.sb_sony_sales]);
  const restTotalSales = useMemo(() => toNumberOrNull(visitForm.rest_total_sales), [visitForm.rest_total_sales]);
  const restSonySales = useMemo(() => toNumberOrNull(visitForm.rest_sony_sales), [visitForm.rest_sony_sales]);

  const visitSonySharePercent = useMemo(() => calcSharePercent(selloutSony, selloutTotal), [selloutSony, selloutTotal]);
  const visitTvSharePercent = useMemo(() => calcSharePercent(tvSonySales, tvTotalSales), [tvSonySales, tvTotalSales]);
  const visitSbSharePercent = useMemo(() => calcSharePercent(sbSonySales, sbTotalSales), [sbSonySales, sbTotalSales]);
  const visitRestSharePercent = useMemo(() => calcSharePercent(restSonySales, restTotalSales), [restSonySales, restTotalSales]);
  const yoyPercent = useMemo(() => autoSonyRevenuePrevYear > 0 ? ((autoSonyRevenue - autoSonyRevenuePrevYear) / autoSonyRevenuePrevYear) * 100 : null, [autoSonyRevenue, autoSonyRevenuePrevYear]);
  const displayActiveCount = useMemo(() => displayItems.filter((item) => item.status === "ordered" || item.status === "displayed").length, [displayItems]);
  const displayDisplayedCount = useMemo(() => displayItems.filter((item) => item.status === "displayed").length, [displayItems]);
  const latestVisit = visits[0] ?? null;

  const loadData = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) { setLoading(false); return; }
    setLoading(true);
    try {
      const [dealerRes, profileRes, tagsRes, assignmentsRes, tasksRes, dealerUsersRes, dealerUserTagAssignmentsRes, visitsRes, displayItemsRes] = await Promise.all([
        supabase.from("dealers").select(`dealer_id,login_nr,name,role,distribution,mail_bg,mail_bg2,mail_kam,mail_sony,mail_kam2,mail_dealer,store_name,kam,street,plz,city,phone,fax,email,website,language,customer_type,customer_classification,serp,sds,fivej_gv,ecot4,description,login_email,zip,country,kam_name,contact_person,kam_email_sony,auth_user_id`).eq("dealer_id", dealerId).single(),
        supabase.from("dealer_profiles").select("*").eq("dealer_id", dealerId).maybeSingle(),
        supabase.from("dealer_tags").select("tag_id, label, category, is_active, sort_order").eq("is_active", true).order("sort_order", { ascending: true }).order("label", { ascending: true }),
        supabase.from("dealer_tag_assignments").select("tag_id").eq("dealer_id", dealerId),
        supabase.from("dealer_tasks").select("*").eq("dealer_id", dealerId).order("created_at", { ascending: false }),
        supabase.from("dealer_users").select("id, dealer_id, user_email, display_name, role").eq("dealer_id", dealerId).order("role", { ascending: true }).order("user_email", { ascending: true }),
        supabase.from("dealer_user_tag_assignments").select("id, dealer_user_id, tag_id"),
        supabase.from("dealer_visit_reports").select("*").eq("dealer_id", dealerId).order("visit_date", { ascending: false }).order("created_at", { ascending: false }),
        supabase.from("dealer_display_items").select("*").eq("dealer_id", dealerId).order("created_at", { ascending: false }),
      ]);
      if (dealerRes.error) throw dealerRes.error;
      if (profileRes.error) throw profileRes.error;
      if (tagsRes.error) throw tagsRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (dealerUsersRes.error) throw dealerUsersRes.error;
      if (dealerUserTagAssignmentsRes.error) throw dealerUserTagAssignmentsRes.error;
      if (visitsRes.error) throw visitsRes.error;
      if (displayItemsRes.error) throw displayItemsRes.error;

      const dealerRow = dealerRes.data as DealerRow;
      setDealer(dealerRow);
      setDealerForm({
        name: dealerRow.name ?? "", store_name: dealerRow.store_name ?? "", email: dealerRow.email ?? "", login_email: dealerRow.login_email ?? dealerRow.email ?? "", login_nr: dealerRow.login_nr ?? "",
        contact_person: dealerRow.contact_person ?? "", phone: dealerRow.phone ?? "", fax: dealerRow.fax ?? "", website: dealerRow.website ?? "", street: dealerRow.street ?? "", plz: dealerRow.plz ?? "",
        zip: dealerRow.zip ?? "", city: dealerRow.city ?? "", country: dealerRow.country ?? "", language: dealerRow.language ?? "", distribution: dealerRow.distribution ?? "", kam: dealerRow.kam ?? "",
        kam_name: dealerRow.kam_name ?? "", kam_email_sony: dealerRow.kam_email_sony ?? "", mail_dealer: dealerRow.mail_dealer ?? "", mail_kam: dealerRow.mail_kam ?? "", mail_kam2: dealerRow.mail_kam2 ?? "",
        mail_bg: dealerRow.mail_bg ?? "", mail_bg2: dealerRow.mail_bg2 ?? "", mail_sony: dealerRow.mail_sony ?? "", customer_type: dealerRow.customer_type ?? "", customer_classification: dealerRow.customer_classification ?? "",
        serp: dealerRow.serp ?? "", sds: dealerRow.sds ?? "", fivej_gv: dealerRow.fivej_gv ?? "", ecot4: dealerRow.ecot4 ?? "", description: dealerRow.description ?? "",
      });

      const profile = profileRes.data as DealerProfile | null;
      if (profile) {
        setProfileId(profile.profile_id);
        setProfileForm({ contact_person_name: profile.contact_person_name ?? "", contact_person_role: profile.contact_person_role ?? "", customer_type: profile.customer_type ?? "", region: profile.region ?? "", partner_status: profile.partner_status ?? "", last_login_at: profile.last_login_at ? new Date(profile.last_login_at).toISOString().slice(0, 16) : "", last_visit_date: profile.last_visit_date ?? "", birthdays_notes: profile.birthdays_notes ?? "", personal_notes: profile.personal_notes ?? "", general_notes: profile.general_notes ?? "" });
      } else setProfileId(null);

      setAllTags(sortTags((tagsRes.data ?? []) as DealerTag[]));
      setAssignedTagIds(((assignmentsRes.data ?? []) as DealerTagAssignmentRow[]).map((x) => Number(x.tag_id)));
      setTasks((tasksRes.data ?? []) as DealerTask[]);
      setDealerUsers((dealerUsersRes.data ?? []) as DealerUser[]);
      setDealerUserTagAssignments((dealerUserTagAssignmentsRes.data ?? []) as DealerUserTagAssignment[]);
      setVisits((visitsRes.data ?? []) as VisitReport[]);
      setDisplayItems((displayItemsRes.data ?? []) as DealerDisplayItem[]);
    } catch (error) {
      console.error("Fehler beim Laden CRM:", error);
      showToast("error", "CRM-Daten konnten nicht geladen werden.");
    } finally { setLoading(false); }
  }, [dealerId, supabase]);

  const syncDisplayItemsFromOrders = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) return;
    try {
      const { data: displayOrderItems, error } = await supabase.from("submission_items").select(`item_id,product_id,product_name,sony_article,menge,pricing_mode,is_display_item,submission:submission_id (submission_id,dealer_id)`).or("pricing_mode.eq.display,is_display_item.eq.true");
      if (error) { console.error("Fehler beim Laden Display-Bestellungen:", error); return; }
      const rows = (displayOrderItems || []).filter((row: any) => Number((Array.isArray(row.submission) ? row.submission[0] : row.submission)?.dealer_id) === Number(dealerId));
      if (!rows.length) return;
      const sourceIds = rows.map((row: any) => Number(row.item_id)).filter(Boolean);
      const { data: existingItems, error: existingError } = await supabase.from("dealer_display_items").select("source_submission_item_id").eq("dealer_id", dealerId).in("source_submission_item_id", sourceIds);
      if (existingError) { console.error("Fehler beim Laden bestehender Display-Tracker-Einträge:", existingError); return; }
      const existingIds = new Set((existingItems || []).map((item: any) => item.source_submission_item_id).filter(Boolean).map((id: any) => Number(id)));
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const inserts = rows.filter((row: any) => !existingIds.has(Number(row.item_id))).map((row: any) => ({ dealer_id: dealerId, source_submission_item_id: Number(row.item_id), product_id: row.product_id ?? null, product_name_snapshot: row.sony_article || row.product_name || `Artikel #${row.item_id}`, ordered_as_display: true, ordered_qty: row.menge ?? 1, is_displayed: null, status: "ordered", display_checked_at: null, display_checked_by: null, removed_at: null, removed_by: null, note: null, created_by: currentUser }));
      if (!inserts.length) return;
      const { error: insertError } = await supabase.from("dealer_display_items").upsert(inserts, { onConflict: "source_submission_item_id", ignoreDuplicates: true });
      if (insertError) console.error("Fehler beim Sync der Display-Tracker-Einträge:", insertError);
    } catch (error) { console.error("Unbekannter Fehler beim Display-Sync:", error); }
  }, [dealerId, supabase]);

  const loadAutoKpis = useCallback(async () => {
    if (!dealerId || Number.isNaN(dealerId)) return;
    setLoadingAutoKpis(true);
    try {
      const { start, end } = getDateRange(periodMode);
      const prevYearStart = shiftOneYear(start);
      const prevYearEnd = shiftOneYear(end);
      const { data, error } = await supabase.from("submission_items").select(`item_id,product_id,sony_article,product_name,menge,preis,pricing_mode,is_display_item,submission:submission_id (dealer_id,typ,status,created_at,datum)`);
      if (error) { console.error("Auto KPI Fehler beim Laden:", error); return; }
      const rows: AutoMetricRow[] = (data || []).map((row: any) => {
        const submission = Array.isArray(row.submission) ? row.submission[0] : row.submission;
        return { item_id: Number(row.item_id), product_id: row.product_id ?? null, sony_article: row.sony_article ?? null, product_name: row.product_name ?? null, menge: row.menge ?? 0, preis: row.preis ?? 0, pricing_mode: row.pricing_mode ?? null, is_display_item: Boolean(row.is_display_item), submission_created_at: submission?.created_at ?? null, submission_datum: submission?.datum ?? null, submission_status: submission?.status ?? null, submission_typ: submission?.typ ?? null, dealer_id: submission?.dealer_id ?? null };
      }).filter((row) => Number(row.dealer_id) === Number(dealerId)).filter((row) => row.submission_typ === "bestellung").filter((row) => String(row.submission_status || "").toLowerCase() !== "rejected");
      const currentRows = rows.filter((row) => isDateWithin(row.submission_created_at || row.submission_datum, start, end));
      const prevYearRows = rows.filter((row) => isDateWithin(row.submission_created_at || row.submission_datum, prevYearStart, prevYearEnd));
      const currentSonyRevenue = currentRows.reduce((sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0), 0);
      const prevSonyRevenue = prevYearRows.reduce((sum, row) => sum + Number(row.menge ?? 0) * Number(row.preis ?? 0), 0);
      const currentDisplayOrders = currentRows.filter((row) => row.pricing_mode === "display" || row.is_display_item === true).length;
      const productMap = new Map<string, TopProduct>();
      for (const row of currentRows) {
        const label = row.sony_article || row.product_name || (row.product_id ? `Produkt #${row.product_id}` : `Item #${row.item_id}`);
        if (!productMap.has(label)) productMap.set(label, { label, qty: 0, revenue: 0 });
        const current = productMap.get(label)!;
        current.qty += Number(row.menge ?? 0);
        current.revenue += Number(row.menge ?? 0) * Number(row.preis ?? 0);
      }
      setAutoSonyRevenue(currentSonyRevenue);
      setAutoSonyRevenuePrevYear(prevSonyRevenue);
      setAutoDisplayOrderCount(currentDisplayOrders);
      setAutoPositionsCount(currentRows.length);
      setAutoTopProducts([...productMap.values()].sort((a, b) => b.revenue !== a.revenue ? b.revenue - a.revenue : b.qty - a.qty).slice(0, 3));
    } catch (error) { console.error("Unbekannter Fehler Auto KPI:", error); }
    finally { setLoadingAutoKpis(false); }
  }, [dealerId, periodMode, supabase]);

  useEffect(() => { const run = async () => { await syncDisplayItemsFromOrders(); await loadData(); }; run(); }, [loadData, syncDisplayItemsFromOrders]);
  useEffect(() => { loadAutoKpis(); }, [loadAutoKpis]);

  const groupedTags = useMemo<Record<DealerTagCategory, DealerTag[]>>(() => ({
    crm: allTags.filter((tag) => tag.category === "crm"),
    interest: allTags.filter((tag) => tag.category === "interest"),
    custom: allTags.filter((tag) => tag.category === "custom"),
  }), [allTags]);

  const interestTags = groupedTags.interest;
  const crmTags = useMemo(() => [...groupedTags.crm, ...groupedTags.custom], [groupedTags.crm, groupedTags.custom]);
  const dealerUserAssignedTagIds = useMemo(() => [...new Set(dealerUserTagAssignments.map((x) => Number(x.tag_id)))], [dealerUserTagAssignments]);
  const combinedAssignedTagIds = useMemo(() => [...new Set([...assignedTagIds, ...dealerUserAssignedTagIds])], [assignedTagIds, dealerUserAssignedTagIds]);
  const combinedInterestTags = useMemo(() => interestTags.filter((tag) => combinedAssignedTagIds.includes(Number(tag.tag_id))), [interestTags, combinedAssignedTagIds]);
  const combinedCrmTags = useMemo(() => crmTags.filter((tag) => combinedAssignedTagIds.includes(Number(tag.tag_id))), [crmTags, combinedAssignedTagIds]);
  const openTasks = useMemo(() => tasks.filter((task) => task.status === "open"), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((task) => task.status === "done"), [tasks]);
  const cancelledTasks = useMemo(() => tasks.filter((task) => task.status === "cancelled"), [tasks]);

  const getAssignedName = (email: string | null | undefined) => {
    if (!email) return "–";
    const user = dealerUsers.find((item) => item.user_email === email);
    return user?.display_name || email;
  };

  const dealerContactOptions = useMemo(() => dealerUsers.map((user) => ({ id: String(user.id), label: user.display_name || user.user_email, raw: user })), [dealerUsers]);
  const selectedVisitContact = useMemo(() => selectedVisitContactId ? dealerContactOptions.find((contact) => String(contact.id) === String(selectedVisitContactId))?.raw ?? null : null, [dealerContactOptions, selectedVisitContactId]);

  const buildVisitContactPersonsText = () => {
    const manualText = visitForm.contact_persons.trim();
    if (!selectedVisitContact) return manualText || null;
    const selectedLabel = [selectedVisitContact.display_name || selectedVisitContact.user_email, selectedVisitContact.role ? `(${selectedVisitContact.role})` : "", selectedVisitContact.user_email ? `- ${selectedVisitContact.user_email}` : ""].filter(Boolean).join(" ");
    if (!manualText) return selectedLabel;
    if (manualText.toLowerCase().includes(selectedLabel.toLowerCase())) return manualText;
    return `${selectedLabel}\n${manualText}`;
  };

  const reloadWithoutScrollJump = async () => {
    const x = window.scrollX;
    const y = window.scrollY;
    await loadData();
    requestAnimationFrame(() => window.scrollTo(x, y));
  };

  const saveMainData = async () => {
    if (!dealerId || Number.isNaN(dealerId)) { showToast("error", "Ungültige Händler-ID."); return; }
    try {
      setSavingMain(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const dealerPayload = {
        name: dealerForm.name.trim(), store_name: dealerForm.store_name.trim() || null, email: dealerForm.email.trim().toLowerCase() || null,
        login_email: dealerForm.login_email.trim().toLowerCase() || dealerForm.email.trim().toLowerCase(), login_nr: dealerForm.login_nr.trim(), contact_person: dealerForm.contact_person.trim() || null,
        phone: dealerForm.phone.trim() || null, fax: dealerForm.fax.trim() || null, website: dealerForm.website.trim() || null, street: dealerForm.street.trim() || null, plz: dealerForm.plz.trim() || null,
        zip: dealerForm.zip.trim() || null, city: dealerForm.city.trim() || null, country: dealerForm.country.trim() || null, language: dealerForm.language.trim() || null, distribution: dealerForm.distribution.trim() || null,
        kam: dealerForm.kam.trim() || null, kam_name: dealerForm.kam_name.trim() || null, kam_email_sony: dealerForm.kam_email_sony.trim() || null, mail_dealer: dealerForm.mail_dealer.trim() || null,
        mail_kam: dealerForm.mail_kam.trim() || null, mail_kam2: dealerForm.mail_kam2.trim() || null, mail_bg: dealerForm.mail_bg.trim() || null, mail_bg2: dealerForm.mail_bg2.trim() || null,
        mail_sony: dealerForm.mail_sony.trim() || null, customer_type: dealerForm.customer_type.trim() || null, customer_classification: dealerForm.customer_classification.trim() || null,
        serp: dealerForm.serp.trim() || null, sds: dealerForm.sds.trim() || null, fivej_gv: dealerForm.fivej_gv.trim() || null, ecot4: dealerForm.ecot4.trim() || null, description: dealerForm.description.trim() || null,
      };
      if (!dealerPayload.name || !dealerPayload.login_nr || !dealerPayload.login_email) { showToast("error", "Name, Login-Nr. und Login-E-Mail sind Pflichtfelder."); return; }
      const { error: dealerError } = await supabase.from("dealers").update(dealerPayload).eq("dealer_id", dealerId);
      if (dealerError) throw dealerError;
      const profilePayload = { dealer_id: dealerId, contact_person_name: profileForm.contact_person_name || dealerForm.contact_person || null, contact_person_role: profileForm.contact_person_role || null, customer_type: profileForm.customer_type || dealerForm.customer_type || null, region: profileForm.region || null, partner_status: profileForm.partner_status || null, last_login_at: profileForm.last_login_at || null, last_visit_date: latestVisit?.visit_date || profileForm.last_visit_date || null, birthdays_notes: profileForm.birthdays_notes || null, personal_notes: profileForm.personal_notes || null, general_notes: profileForm.general_notes || null, updated_by: currentUser };
      if (profileId) {
        const { error } = await supabase.from("dealer_profiles").update(profilePayload).eq("profile_id", profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("dealer_profiles").insert(profilePayload).select("profile_id").single();
        if (error) throw error;
        setProfileId(Number(data.profile_id));
      }
      showToast("success", "Händler-Stammdaten gespeichert.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Speichern:", error); showToast("error", "Händler-Stammdaten konnten nicht gespeichert werden."); }
    finally { setSavingMain(false); }
  };

  const toggleTag = async (tagId: number) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const alreadyAssigned = assignedTagIds.includes(tagId);
      if (alreadyAssigned) {
        const { error } = await supabase.from("dealer_tag_assignments").delete().eq("dealer_id", dealerId).eq("tag_id", tagId);
        if (error) throw error;
        setAssignedTagIds((prev) => prev.filter((id) => id !== tagId));
      } else {
        const { error } = await supabase.from("dealer_tag_assignments").insert({ dealer_id: dealerId, tag_id: tagId, created_by: currentUser });
        if (error) throw error;
        setAssignedTagIds((prev) => [...prev, tagId]);
      }
    } catch (error) { console.error("Fehler beim Umschalten Tag:", error); showToast("error", "Tag konnte nicht gespeichert werden."); }
  };

  const createCustomTag = async () => {
    const label = newTagLabel.trim();
    if (!label) { showToast("error", "Bitte zuerst einen Tag-Namen eingeben."); return; }
    try {
      setCreatingTag(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const existingTag = allTags.find((tag) => tag.label.trim().toLowerCase() === label.toLowerCase());
      if (existingTag) {
        if (!assignedTagIds.includes(Number(existingTag.tag_id))) {
          const { error } = await supabase.from("dealer_tag_assignments").insert({ dealer_id: dealerId, tag_id: existingTag.tag_id, created_by: currentUser });
          if (error) throw error;
          setAssignedTagIds((prev) => [...prev, Number(existingTag.tag_id)]);
        }
        setNewTagLabel(""); setNewTagCategory("crm"); showToast("success", "Vorhandener Tag wurde zugeordnet."); return;
      }
      const { data: insertedTag, error: tagError } = await supabase.from("dealer_tags").insert({ label, category: newTagCategory, is_active: true, sort_order: 9999, created_by: currentUser }).select("tag_id, label, category, is_active, sort_order").single();
      if (tagError) throw tagError;
      const tag = insertedTag as DealerTag;
      const { error: assignError } = await supabase.from("dealer_tag_assignments").insert({ dealer_id: dealerId, tag_id: tag.tag_id, created_by: currentUser });
      if (assignError) throw assignError;
      setAllTags((prev) => sortTags([...prev, tag]));
      setAssignedTagIds((prev) => [...prev, Number(tag.tag_id)]);
      setNewTagLabel(""); setNewTagCategory("crm"); showToast("success", "Neuer Tag erstellt und zugeordnet.");
    } catch (error) { console.error("Fehler beim Erstellen Tag:", error); showToast("error", "Tag konnte nicht erstellt werden."); }
    finally { setCreatingTag(false); }
  };

  const toggleDealerUserTag = async (dealerUserId: number, tagId: number) => {
    try {
      const existing = dealerUserTagAssignments.find((x) => Number(x.dealer_user_id) === Number(dealerUserId) && Number(x.tag_id) === Number(tagId));
      if (existing) {
        const { error } = await supabase.from("dealer_user_tag_assignments").delete().eq("id", existing.id);
        if (error) throw error;
        setDealerUserTagAssignments((prev) => prev.filter((x) => x.id !== existing.id));
        return;
      }
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const { data, error } = await supabase.from("dealer_user_tag_assignments").insert({ dealer_user_id: dealerUserId, tag_id: tagId, created_by: currentUser }).select("id, dealer_user_id, tag_id").single();
      if (error) throw error;
      setDealerUserTagAssignments((prev) => [...prev, data as DealerUserTagAssignment]);
    } catch (error) { console.error("Fehler beim Speichern Mitarbeiter-Tag:", error); showToast("error", "Mitarbeiter-Tag konnte nicht gespeichert werden."); }
  };

  const addTask = async () => {
    if (!dealerId || Number.isNaN(dealerId)) { showToast("error", "Ungültige Händler-ID."); return; }
    if (!taskForm.title.trim()) { showToast("error", "Bitte einen Task-Titel eingeben."); return; }
    try {
      setAddingTask(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const { error } = await supabase.from("dealer_tasks").insert({ dealer_id: dealerId, title: taskForm.title.trim(), description: taskForm.description.trim() || null, due_date: taskForm.due_date || null, status: "open", assigned_to: taskForm.assigned_to || null, created_by: currentUser });
      if (error) throw error;
      setTaskForm({ title: "", description: "", due_date: "", assigned_to: "" });
      showToast("success", "Task hinzugefügt.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Hinzufügen Task:", error); showToast("error", "Task konnte nicht gespeichert werden."); }
    finally { setAddingTask(false); }
  };

  const updateTaskStatus = async (taskId: number, status: "open" | "done" | "cancelled") => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const payload: Record<string, string | null> = { status, done_at: null, done_by: null };
      if (status === "done") { payload.done_at = new Date().toISOString(); payload.done_by = currentUser; }
      const { error } = await supabase.from("dealer_tasks").update(payload).eq("task_id", taskId);
      if (error) throw error;
      showToast("success", "Task aktualisiert.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Aktualisieren Task:", error); showToast("error", "Task konnte nicht aktualisiert werden."); }
  };

  const addVisit = async () => {
    try {
      setAddingVisit(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const visitDate = visitForm.visit_date || new Date().toISOString().slice(0, 10);
      const payload = buildVisitPayloadFromForm({
        dealerId,
        currentUser,
        contactPersons: buildVisitContactPersonsText(),
        autoSonyRevenue,
        periodMode,
        form: visitForm,
      });
      const { error } = await supabase.from("dealer_visit_reports").insert(payload);
      if (error) throw error;
      await supabase.from("dealer_profiles").update({ last_visit_date: visitDate, updated_by: currentUser }).eq("dealer_id", dealerId);
      setVisitForm(createEmptyVisitForm());
      setSelectedVisitContactId("");
      showToast("success", "Besuchsbericht gespeichert.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Speichern Besuch:", error); showToast("error", "Besuchsbericht konnte nicht gespeichert werden."); }
    finally { setAddingVisit(false); }
  };

  const deleteVisit = async (visitReportId: number) => {
    if (!window.confirm("Besuchsrapport wirklich löschen?")) return;
    try {
      const { error } = await supabase.from("dealer_visit_reports").delete().eq("visit_report_id", visitReportId);
      if (error) throw error;
      showToast("success", "Besuchsrapport gelöscht.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Löschen Besuchsrapport:", error); showToast("error", "Besuchsrapport konnte nicht gelöscht werden."); }
  };

  const updateVisit = async () => {
    if (!editingVisit) return;
    try {
      setSavingVisitEdit(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const payload = buildVisitUpdatePayload(editingVisit, currentUser);
      const { error } = await supabase.from("dealer_visit_reports").update(payload).eq("visit_report_id", editingVisit.visit_report_id);
      if (error) throw error;
      await supabase.from("dealer_profiles").update({ last_visit_date: editingVisit.visit_date, updated_by: currentUser }).eq("dealer_id", dealerId);
      showToast("success", "Besuchsrapport aktualisiert.");
      setEditingVisit(null);
      await reloadWithoutScrollJump();
    } catch (error) {
      console.error("Fehler beim Aktualisieren Besuchsrapport:", error instanceof Error ? error.message : JSON.stringify(error), error);
      showToast("error", "Besuchsrapport konnte nicht aktualisiert werden.");
    } finally { setSavingVisitEdit(false); }
  };

  const addDisplayItem = async () => {
    const productName = displayForm.product_name_snapshot.trim();
    if (!productName) { showToast("error", "Bitte zuerst einen Produktnamen eingeben."); return; }
    try {
      setAddingDisplayItem(true);
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const qty = parseInt(displayForm.ordered_qty || "0", 10);
      const { error } = await supabase.from("dealer_display_items").insert({ dealer_id: dealerId, product_name_snapshot: productName, ordered_as_display: true, ordered_qty: Number.isFinite(qty) ? qty : 1, is_displayed: displayForm.is_displayed === "yes" ? true : displayForm.is_displayed === "no" ? false : null, status: displayForm.is_displayed === "yes" ? "displayed" : displayForm.is_displayed === "no" ? "not_displayed" : "ordered", display_checked_at: new Date().toISOString(), display_checked_by: currentUser, note: displayForm.note.trim() || null, created_by: currentUser });
      if (error) throw error;
      setDisplayForm({ product_name_snapshot: "", ordered_qty: "1", is_displayed: "yes", note: "" });
      showToast("success", "Display-Produkt gespeichert.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Speichern Display-Produkt:", error); showToast("error", "Display-Produkt konnte nicht gespeichert werden."); }
    finally { setAddingDisplayItem(false); }
  };

  const updateDisplayStatus = async (displayItemId: number, nextStatus: "ordered" | "displayed" | "not_displayed" | "sold_off" | "removed") => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user?.email ?? "admin";
      const payload: Record<string, unknown> = { status: nextStatus, display_checked_at: new Date().toISOString(), display_checked_by: currentUser };
      if (nextStatus === "displayed") { payload.is_displayed = true; payload.removed_at = null; payload.removed_by = null; }
      else if (nextStatus === "not_displayed") { payload.is_displayed = false; payload.removed_at = null; payload.removed_by = null; }
      else if (nextStatus === "sold_off" || nextStatus === "removed") { payload.is_displayed = false; payload.removed_at = new Date().toISOString(); payload.removed_by = currentUser; }
      else { payload.is_displayed = null; payload.removed_at = null; payload.removed_by = null; }
      const { error } = await supabase.from("dealer_display_items").update(payload).eq("display_item_id", displayItemId);
      if (error) throw error;
      showToast("success", "Display-Status aktualisiert.");
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Aktualisieren Display-Status:", error); showToast("error", "Display-Status konnte nicht aktualisiert werden."); }
  };

  const updateDealerUser = async () => {
    if (!editingUser) return;
    const email = editingUser.user_email.trim().toLowerCase();
    if (!email) { showToast("error", "Bitte E-Mail eingeben."); return; }
    try {
      setSavingUser(true);
      const { data, error } = await supabase.from("dealer_users").update({ user_email: email, display_name: editingUser.display_name?.trim() || null, role: editingUser.role?.trim() || null }).eq("id", editingUser.id).select("id, dealer_id, user_email, display_name, role").single();
      if (error) throw error;
      setDealerUsers((prev) => prev.map((user) => user.id === editingUser.id ? (data as DealerUser) : user));
      showToast("success", "Mitarbeiter gespeichert.");
      setEditingUser(null);
    } catch (error) { console.error("Fehler beim Speichern Mitarbeiter:", error); showToast("error", "Mitarbeiter konnte nicht gespeichert werden. Prüfe RLS-Update-Policy."); }
    finally { setSavingUser(false); }
  };

  const deleteDealerUser = async () => {
    if (!editingUser) return;
    if (!window.confirm(`Mitarbeiter "${editingUser.display_name || editingUser.user_email}" wirklich löschen?`)) return;
    try {
      setSavingUser(true);
      await supabase.from("dealer_user_tag_assignments").delete().eq("dealer_user_id", editingUser.id);
      const { error } = await supabase.from("dealer_users").delete().eq("id", editingUser.id);
      if (error) throw error;
      showToast("success", "Mitarbeiter gelöscht.");
      setEditingUser(null);
      await reloadWithoutScrollJump();
    } catch (error) { console.error("Fehler beim Löschen Mitarbeiter:", error); showToast("error", "Mitarbeiter konnte nicht gelöscht werden."); }
    finally { setSavingUser(false); }
  };

  const TagButton = ({ tag, active, onClick, small = false }: { tag: DealerTag; active: boolean; onClick: () => void; small?: boolean }) => {
    const group = getTagGroup(tag.category);
    return <button type="button" onClick={onClick} className={`rounded-full ring-1 ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"} font-medium transition ${active ? group.activeClass : group.inactiveClass}`}>{tag.label}</button>;
  };

  const TagCategorySection = ({ group, tags, activeIds, onToggle, small = false }: { group: TagGroup; tags: DealerTag[]; activeIds: number[]; onToggle: (tagId: number) => void; small?: boolean }) => {
    if (!tags.length) return null;
    const activeCount = tags.filter((tag) => activeIds.includes(Number(tag.tag_id))).length;
    return <div className={`rounded-2xl border p-4 ${group.panelClass}`}><div className="mb-3 flex flex-wrap items-start justify-between gap-2"><div><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${group.badgeClass}`}>{group.title}</span><span className="text-xs text-gray-500">{activeCount}/{tags.length} aktiv</span></div><p className="mt-1 text-xs text-gray-600">{group.subtitle}</p></div></div><div className="flex flex-wrap gap-2">{tags.map((tag) => <TagButton key={tag.tag_id} tag={tag} small={small} active={activeIds.includes(Number(tag.tag_id))} onClick={() => onToggle(Number(tag.tag_id))} />)}</div></div>;
  };

  const renderSelloutInputGrid = ({ mode, editingVisit, setEditingVisit }: { mode: "create" | "edit"; editingVisit?: VisitReport | null; setEditingVisit?: React.Dispatch<React.SetStateAction<VisitReport | null>> }) => {
    const isEdit = mode === "edit";
    const getCreateValue = (key: keyof VisitFormState) => visitForm[key];
    const setCreateValue = (key: keyof VisitFormState, value: string) => setVisitForm((prev) => ({ ...prev, [key]: value }));
    const getEditNumberValue = (key: keyof VisitReport) => editingVisit ? numberToInput(editingVisit[key] as number | null | undefined) : "";
    const setEditNumberValue = (key: keyof VisitReport, value: string) => setEditingVisit?.((prev) => prev ? { ...prev, [key]: toNumberOrNull(value) } : prev);
    const setEditStringValue = (key: keyof VisitReport, value: string) => setEditingVisit?.((prev) => prev ? { ...prev, [key]: value || null } : prev);

    const currentSelloutTotal = isEdit ? editingVisit?.sellout_total_sales ?? editingVisit?.market_total_sales ?? null : selloutTotal;
    const currentSelloutSony = isEdit ? editingVisit?.sellout_sony_total ?? null : selloutSony;
    const currentTvTotal = isEdit ? editingVisit?.tv_total_sales ?? editingVisit?.tv_total_all ?? null : tvTotalSales;
    const currentTvSony = isEdit ? editingVisit?.tv_sony_sales ?? editingVisit?.tv_total_sony ?? null : tvSonySales;
    const currentSbTotal = isEdit ? editingVisit?.sb_total_sales ?? editingVisit?.sb_total_all ?? null : sbTotalSales;
    const currentSbSony = isEdit ? editingVisit?.sb_sony_sales ?? editingVisit?.sb_total_sony ?? null : sbSonySales;
    const currentTvTotalQty = isEdit ? editingVisit?.tv_total_qty ?? null : toNumberOrNull(getCreateValue("tv_total_qty"));
    const currentTvSonyQty = isEdit ? editingVisit?.tv_sony_qty ?? null : toNumberOrNull(getCreateValue("tv_sony_qty"));
    const currentSbTotalQty = isEdit ? editingVisit?.sb_total_qty ?? null : toNumberOrNull(getCreateValue("sb_total_qty"));
    const currentSbSonyQty = isEdit ? editingVisit?.sb_sony_qty ?? null : toNumberOrNull(getCreateValue("sb_sony_qty"));
    const currentRestTotal = isEdit ? editingVisit?.rest_total_sales ?? null : restTotalSales;
    const currentRestSony = isEdit ? editingVisit?.rest_sony_sales ?? null : restSonySales;

    return <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><div className="mb-3"><div className="text-sm font-semibold text-emerald-900">Sell-out Händlerumsatz</div><p className="mt-1 text-xs text-emerald-800">Diese Werte stammen vom Händler/POS. Prozentwerte werden automatisch aus Sony Umsatz ÷ Total Umsatz berechnet.</p></div><div className="space-y-3"><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><div><FieldLabel>Periode</FieldLabel><select value={isEdit ? editingVisit?.snapshot_period_type || "quarter" : getCreateValue("snapshot_period_type")} onChange={(e) => isEdit ? setEditStringValue("snapshot_period_type", e.target.value) : setCreateValue("snapshot_period_type", e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="month">Monat</option><option value="quarter">Quartal</option><option value="halfyear">Halbjahr</option><option value="year">Jahr</option><option value="ytd_fiscal">YTD Fiscal Year</option><option value="custom">Definierte Periode</option></select></div><div><FieldLabel>Von</FieldLabel><Input type="date" value={isEdit ? editingVisit?.snapshot_period_start || "" : getCreateValue("snapshot_period_start")} onChange={(e) => isEdit ? setEditStringValue("snapshot_period_start", e.target.value) : setCreateValue("snapshot_period_start", e.target.value)} /></div><div><FieldLabel>Bis</FieldLabel><Input type="date" value={isEdit ? editingVisit?.snapshot_period_end || "" : getCreateValue("snapshot_period_end")} onChange={(e) => isEdit ? setEditStringValue("snapshot_period_end", e.target.value) : setCreateValue("snapshot_period_end", e.target.value)} /></div></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><FieldLabel>Sell-out Total Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("sellout_total_sales") : getCreateValue("sellout_total_sales")} onChange={(e) => isEdit ? setEditNumberValue("sellout_total_sales", e.target.value) : setCreateValue("sellout_total_sales", e.target.value)} placeholder="z. B. 250000" /></div><div><FieldLabel>Sell-out Sony Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("sellout_sony_total") : getCreateValue("sellout_sony_total")} onChange={(e) => isEdit ? setEditNumberValue("sellout_sony_total", e.target.value) : setCreateValue("sellout_sony_total", e.target.value)} placeholder="z. B. 42000" /></div></div><div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">Sony Anteil Sell-out: <b>{formatPercent(calcSharePercent(currentSelloutSony, currentSelloutTotal))}</b></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><FieldLabel>TV Total Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("tv_total_sales") : getCreateValue("tv_total_sales")} onChange={(e) => isEdit ? setEditNumberValue("tv_total_sales", e.target.value) : setCreateValue("tv_total_sales", e.target.value)} /></div><div><FieldLabel>TV Sony Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("tv_sony_sales") : getCreateValue("tv_sony_sales")} onChange={(e) => isEdit ? setEditNumberValue("tv_sony_sales", e.target.value) : setCreateValue("tv_sony_sales", e.target.value)} /></div></div><div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">TV Sony Anteil Sell-out: <b>{formatPercent(calcSharePercent(currentTvSony, currentTvTotal))}</b></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <FieldLabel>TV Total verkauft Qty</FieldLabel>
                <Input value={isEdit ? getEditNumberValue("tv_total_qty") : getCreateValue("tv_total_qty")} onChange={(e) => isEdit ? setEditNumberValue("tv_total_qty", e.target.value) : setCreateValue("tv_total_qty", e.target.value)} />
              </div>
              <div>
                <FieldLabel>TV Sony verkauft Qty</FieldLabel>
                <Input value={isEdit ? getEditNumberValue("tv_sony_qty") : getCreateValue("tv_sony_qty")} onChange={(e) => isEdit ? setEditNumberValue("tv_sony_qty", e.target.value) : setCreateValue("tv_sony_qty", e.target.value)} />
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">
              TV Sony Anteil Qty: <b>{formatPercent(calcSharePercent(currentTvSonyQty, currentTvTotalQty))}</b>
            </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><FieldLabel>Soundbar Total Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("sb_total_sales") : getCreateValue("sb_total_sales")} onChange={(e) => isEdit ? setEditNumberValue("sb_total_sales", e.target.value) : setCreateValue("sb_total_sales", e.target.value)} /></div><div><FieldLabel>Soundbar Sony Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("sb_sony_sales") : getCreateValue("sb_sony_sales")} onChange={(e) => isEdit ? setEditNumberValue("sb_sony_sales", e.target.value) : setCreateValue("sb_sony_sales", e.target.value)} /></div></div><div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">Soundbar Sony Anteil Sell-out: <b>{formatPercent(calcSharePercent(currentSbSony, currentSbTotal))}</b></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <FieldLabel>Soundbar Total verkauft Qty</FieldLabel>
                <Input value={isEdit ? getEditNumberValue("sb_total_qty") : getCreateValue("sb_total_qty")} onChange={(e) => isEdit ? setEditNumberValue("sb_total_qty", e.target.value) : setCreateValue("sb_total_qty", e.target.value)} />
              </div>
              <div>
                <FieldLabel>Soundbar Sony verkauft Qty</FieldLabel>
                <Input value={isEdit ? getEditNumberValue("sb_sony_qty") : getCreateValue("sb_sony_qty")} onChange={(e) => isEdit ? setEditNumberValue("sb_sony_qty", e.target.value) : setCreateValue("sb_sony_qty", e.target.value)} />
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">
              Soundbar Sony Anteil Qty: <b>{formatPercent(calcSharePercent(currentSbSonyQty, currentSbTotalQty))}</b>
            </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2"><div><FieldLabel>Rest Total Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("rest_total_sales") : getCreateValue("rest_total_sales")} onChange={(e) => isEdit ? setEditNumberValue("rest_total_sales", e.target.value) : setCreateValue("rest_total_sales", e.target.value)} /></div><div><FieldLabel>Rest Sony Umsatz</FieldLabel><Input value={isEdit ? getEditNumberValue("rest_sony_sales") : getCreateValue("rest_sony_sales")} onChange={(e) => isEdit ? setEditNumberValue("rest_sony_sales", e.target.value) : setCreateValue("rest_sony_sales", e.target.value)} /></div></div><div className="rounded-xl bg-white p-3 text-xs text-gray-700 ring-1 ring-emerald-100">Rest Sony Anteil Sell-out: <b>{formatPercent(calcSharePercent(currentRestSony, currentRestTotal))}</b></div></div></div>;
  };

  if (loading) return <div className="p-6"><div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Händlerakte wird geladen...</div></div>;
  if (!dealer) return <div className="p-6"><div className="rounded-xl border bg-white p-4 text-sm text-red-600">Händler nicht gefunden.</div></div>;

  const latestVisitSellout = {
    period: latestVisit?.snapshot_period_type ?? null,
    periodStart: latestVisit?.snapshot_period_start ?? null,
    periodEnd: latestVisit?.snapshot_period_end ?? null,
    total: latestVisit?.sellout_total_sales ?? latestVisit?.market_total_sales ?? null,
    sony: latestVisit?.sellout_sony_total ?? null,
    sonyShare: latestVisit?.sony_share_percent_snapshot ?? null,
    tvTotal: latestVisit?.tv_total_sales ?? latestVisit?.tv_total_all ?? null,
    tvSony: latestVisit?.tv_sony_sales ?? latestVisit?.tv_total_sony ?? null,
    tvShare: latestVisit?.tv_sony_share_percent_snapshot ?? null,
    tvTotalQty: latestVisit?.tv_total_qty ?? null,
    tvSonyQty: latestVisit?.tv_sony_qty ?? null,
    tvQtyShare: calcSharePercent(latestVisit?.tv_sony_qty, latestVisit?.tv_total_qty),
    sbTotal: latestVisit?.sb_total_sales ?? latestVisit?.sb_total_all ?? null,
    sbSony: latestVisit?.sb_sony_sales ?? latestVisit?.sb_total_sony ?? null,
    sbShare: latestVisit?.sb_sony_share_percent_snapshot ?? null,
    sbTotalQty: latestVisit?.sb_total_qty ?? null,
    sbSonyQty: latestVisit?.sb_sony_qty ?? null,
    sbQtyShare: calcSharePercent(latestVisit?.sb_sony_qty, latestVisit?.sb_total_qty),
    restTotal: latestVisit?.rest_total_sales ?? null,
    restSony: latestVisit?.rest_sony_sales ?? null,
    restShare: calcSharePercent(latestVisit?.rest_sony_sales, latestVisit?.rest_total_sales),
    sellInSony: latestVisit?.sony_sales_snapshot ?? null,
  };

  return (
    <div className="space-y-6 p-3 md:p-6">
      <Card className="rounded-2xl border border-gray-200 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-gray-900"><Store className="h-5 w-5 text-indigo-600" /><h1 className="text-xl font-semibold">Händlerakte</h1></div><div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 text-sm text-gray-600 md:grid-cols-2"><p><span className="font-medium text-gray-800">Händler:</span> {dealer.name ?? "-"}</p><p><span className="font-medium text-gray-800">Dealer ID:</span> {dealer.dealer_id}</p><p><span className="font-medium text-gray-800">Login:</span> {dealer.login_nr ?? "-"}</p><p><span className="font-medium text-gray-800">E-Mail:</span> {dealer.email ?? "-"}</p></div><div className="mt-3 flex flex-wrap gap-2">{combinedInterestTags.slice(0, 4).map((tag) => <span key={tag.tag_id} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-100">{tag.label}</span>)}{combinedCrmTags.slice(0, 4).map((tag) => <span key={tag.tag_id} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-100">{tag.label}</span>)}</div></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" />Zurück</Button><Button type="button" onClick={saveMainData} disabled={savingMain}>{savingMain ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Speichern</Button></div></div></Card>

      <Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<BarChart3 className="h-5 w-5 text-emerald-600" />} title="Auto KPI / Sell-in" subtitle="Automatischer Überblick aus euren Bestellungen. Dieser Umsatz ist Sell-in, nicht Sell-out." action={<div className="flex items-center gap-2"><span className="text-sm text-gray-500">Zeitraum</span><select value={periodMode} onChange={(e) => setPeriodMode(e.target.value as PeriodMode)} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="month">Monat</option><option value="quarter">Quartal</option><option value="halfyear">Halbjahr</option><option value="year">Jahr</option><option value="ytd_calendar">YTD Kalenderjahr</option><option value="ytd_fiscal">YTD Fiscal Year</option></select></div>} />{loadingAutoKpis ? <div className="flex items-center gap-2 rounded-xl border bg-white p-4 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Auto KPI werden geladen...</div> : <div className="space-y-4"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6"><StatCard title="Sell-in Sony Umsatz" value={formatCurrency(autoSonyRevenue)} subtitle={getPeriodLabel(periodMode)} /><StatCard title="Vorjahr" value={formatCurrency(autoSonyRevenuePrevYear)} subtitle="Gleicher Zeitraum" /><StatCard title="YoY" value={formatPercent(yoyPercent)} subtitle="Sell-in Sony Umsatz" /><StatCard title="Display-Bestellungen" value={formatInteger(autoDisplayOrderCount)} subtitle={getPeriodLabel(periodMode)} /><StatCard title="Bestellpositionen" value={formatInteger(autoPositionsCount)} subtitle={getPeriodLabel(periodMode)} /><StatCard title="Displays aktiv" value={formatInteger(displayActiveCount)} subtitle={`${formatInteger(displayDisplayedCount)} ausgestellt`} /></div><div className="grid grid-cols-1 gap-3 xl:grid-cols-3">{[0, 1, 2].map((idx) => { const product = autoTopProducts[idx]; return <div key={idx} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Trophy className="h-4 w-4 text-amber-500" />Top Produkt {idx + 1}</div><div className="mt-2 text-base font-semibold text-gray-900">{product?.label || "–"}</div><div className="mt-1 text-sm text-gray-500">Menge: {product ? formatInteger(product.qty) : "–"}</div><div className="text-sm text-gray-500">Sell-in Umsatz: {product ? formatCurrency(product.revenue) : "–"}</div></div>; })}</div></div>}</Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]"><Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<Clock3 className="h-5 w-5 text-orange-600" />} title="Tasks / Next Steps" subtitle="Direkt sichtbar vor jedem Besuch." /><div className="mb-5 space-y-3 rounded-2xl border bg-gray-50 p-4"><div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_150px_220px_auto]"><div><FieldLabel>Titel</FieldLabel><Input value={taskForm.title} onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="z. B. Display-Frequenz prüfen" /></div><div><FieldLabel>Fällig bis</FieldLabel><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm((prev) => ({ ...prev, due_date: e.target.value }))} /></div><div><FieldLabel>Zuständig</FieldLabel><select value={taskForm.assigned_to} onChange={(e) => setTaskForm((prev) => ({ ...prev, assigned_to: e.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="">Nicht zugewiesen</option>{dealerUsers.map((user) => <option key={user.id} value={user.user_email}>{user.display_name || user.user_email}{user.role ? ` · ${user.role}` : ""}</option>)}</select></div><div className="flex items-end"><Button type="button" onClick={addTask} disabled={addingTask}>{addingTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Task</Button></div></div><div><FieldLabel>Beschreibung</FieldLabel><Textarea value={taskForm.description} onChange={(v) => setTaskForm((prev) => ({ ...prev, description: v }))} rows={2} /></div></div><div className="space-y-3"><h3 className="text-sm font-semibold text-gray-900">Offen ({openTasks.length})</h3>{openTasks.length === 0 ? <p className="text-sm text-gray-500">Keine offenen Aufgaben.</p> : openTasks.map((task) => <div key={task.task_id} className="rounded-xl border border-orange-200 bg-orange-50 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="font-medium text-gray-900">{task.title}</div>{task.description ? <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{task.description}</p> : null}<div className="mt-2 text-xs text-gray-500">Fällig: {task.due_date || "-"}</div><div className="mt-1 text-xs text-gray-500">Zuständig: {getAssignedName(task.assigned_to)}</div></div><div className="flex flex-wrap gap-2"><Button size="sm" type="button" onClick={() => updateTaskStatus(task.task_id, "done")} className="bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-1 h-4 w-4" />Erledigt</Button><Button size="sm" type="button" variant="outline" onClick={() => updateTaskStatus(task.task_id, "cancelled")}><XCircle className="mr-1 h-4 w-4" />Abbrechen</Button></div></div></div>)}<details className="rounded-xl border border-gray-200 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold text-gray-900">Erledigt / Abgebrochen ({doneTasks.length + cancelledTasks.length})</summary><div className="mt-3 space-y-2">{[...doneTasks, ...cancelledTasks].length === 0 ? <p className="text-sm text-gray-500">Noch keine abgeschlossenen Aufgaben.</p> : [...doneTasks, ...cancelledTasks].slice(0, 8).map((task) => <div key={task.task_id} className="rounded-xl border border-gray-200 bg-gray-50 p-3"><div className="font-medium text-gray-900">{task.title}</div><div className="text-xs text-gray-500">Status: {task.status === "done" ? "Erledigt" : "Abgebrochen"}</div><div className="mt-1 text-xs text-gray-500">Zuständig: {getAssignedName(task.assigned_to)}</div></div>)}</div></details></div></Card>

      <Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<History className="h-5 w-5 text-indigo-600" />} title="Besuchshistorie" subtitle="Letzte Gespräche, Sell-in Snapshot und Sell-out Werte." /><div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">{visits.length === 0 ? <p className="text-sm text-gray-500">Noch keine Besuchsberichte vorhanden.</p> : visits.map((visit) => { const visitSelloutTotal = visit.sellout_total_sales ?? visit.market_total_sales ?? null; const visitSelloutSony = visit.sellout_sony_total ?? null; const visitTvTotal = visit.tv_total_sales ?? visit.tv_total_all ?? null; const visitTvSony = visit.tv_sony_sales ?? visit.tv_total_sony ?? null; const visitSbTotal = visit.sb_total_sales ?? visit.sb_total_all ?? null; const visitSbSony = visit.sb_sony_sales ?? visit.sb_total_sony ?? null; const visitRestTotal = visit.rest_total_sales ?? null; const visitRestSony = visit.rest_sony_sales ?? null; return <div key={visit.visit_report_id} className="rounded-2xl border border-gray-200 bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="font-semibold text-gray-900">{formatDate(visit.visit_date)}</div><div className="text-sm text-gray-500">Besuch von: {visit.visited_by || "-"}</div><div className="mt-1 text-xs text-gray-500">Periode: {visit.snapshot_period_type || "–"}{visit.snapshot_period_start || visit.snapshot_period_end ? ` · ${formatDate(visit.snapshot_period_start)} – ${formatDate(visit.snapshot_period_end)}` : ""}</div></div><div className="flex flex-wrap items-center gap-2"><div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
        Sell-in Sony: {formatCurrency(visit.sony_sales_snapshot)}
        {visit.sellin_snapshot_period_mode ? ` · ${visit.sellin_snapshot_period_mode}` : ""}
        {visit.sellin_snapshot_period_start || visit.sellin_snapshot_period_end
          ? ` · ${formatDate(visit.sellin_snapshot_period_start)} – ${formatDate(visit.sellin_snapshot_period_end)}`
          : ""}
      </div><Button type="button" size="sm" variant="outline" onClick={() => setEditingVisit(visit)}>Bearbeiten</Button><Button type="button" size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => deleteVisit(visit.visit_report_id)}>Löschen</Button></div></div><div className="mt-4 grid grid-cols-1 gap-4 text-sm xl:grid-cols-2"><div><div className="font-medium text-gray-800">Kontakt / Teilnehmer</div><div className="mt-1 whitespace-pre-wrap text-gray-600">{visit.contact_persons || "-"}</div></div><div><div className="font-medium text-gray-800">Vereinbart / Next Steps</div><div className="mt-1 whitespace-pre-wrap text-gray-600">{visit.agreed || "-"}{visit.next_steps ? `\n\nNächste Schritte:\n${visit.next_steps}` : ""}</div></div><div className="xl:col-span-2"><div className="font-medium text-gray-800">Besprochen</div><div className="mt-1 whitespace-pre-wrap text-gray-600">{visit.discussed || "-"}</div></div><div className="xl:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
  <div className="mb-3 font-medium text-emerald-900">Sell-out Werte</div>

  <div className="space-y-3 text-xs text-emerald-900">
    <div className="grid grid-cols-1 gap-2 rounded-lg bg-white/60 p-3 md:grid-cols-3">
      <div>
        <div className="text-emerald-700">Total</div>
        <div className="font-semibold">{formatCurrency(visitSelloutTotal)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Sony</div>
        <div className="font-semibold">{formatCurrency(visitSelloutSony)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Sony Anteil</div>
        <div className="font-semibold">{formatPercent(calcSharePercent(visitSelloutSony, visitSelloutTotal))}</div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 rounded-lg bg-white/60 p-3 md:grid-cols-4">
      <div>
        <div className="text-emerald-700">TV Total Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitTvTotal)}</div>
      </div>
      <div>
        <div className="text-emerald-700">TV Sony Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitTvSony)}</div>
      </div>
      <div>
        <div className="text-emerald-700">TV Sony Anteil Umsatz</div>
        <div className="font-semibold">{formatPercent(calcSharePercent(visitTvSony, visitTvTotal))}</div>
      </div>
      <div>
        <div className="text-emerald-700">TV Qty Sony / Total</div>
        <div className="font-semibold">
          {formatInteger(visit.tv_sony_qty)} / {formatInteger(visit.tv_total_qty)} · {formatPercent(calcSharePercent(visit.tv_sony_qty, visit.tv_total_qty))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 rounded-lg bg-white/60 p-3 md:grid-cols-4">
      <div>
        <div className="text-emerald-700">Soundbar Total Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitSbTotal)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Soundbar Sony Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitSbSony)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Soundbar Sony Anteil Umsatz</div>
        <div className="font-semibold">{formatPercent(calcSharePercent(visitSbSony, visitSbTotal))}</div>
      </div>
      <div>
        <div className="text-emerald-700">Soundbar Qty Sony / Total</div>
        <div className="font-semibold">
          {formatInteger(visit.sb_sony_qty)} / {formatInteger(visit.sb_total_qty)} · {formatPercent(calcSharePercent(visit.sb_sony_qty, visit.sb_total_qty))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2 rounded-lg bg-white/60 p-3 md:grid-cols-3">
      <div>
        <div className="text-emerald-700">Rest Total Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitRestTotal)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Rest Sony Umsatz</div>
        <div className="font-semibold">{formatCurrency(visitRestSony)}</div>
      </div>
      <div>
        <div className="text-emerald-700">Rest Sony Anteil</div>
        <div className="font-semibold">{formatPercent(calcSharePercent(visitRestSony, visitRestTotal))}</div>
      </div>
    </div>
  </div>
</div>{visit.open_points ? <div className="xl:col-span-2 rounded-xl border bg-orange-50 p-3"><div className="font-medium text-orange-800">Offene Punkte</div><div className="mt-1 whitespace-pre-wrap text-orange-700">{visit.open_points}</div></div> : null}</div></div>; })}</div></Card></div>

      <Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<MessageSquare className="h-5 w-5 text-purple-600" />} title="Neuer Besuchsreport" subtitle="Sell-in wird automatisch aus Bestellungen übernommen. Sell-out wird hier manuell erfasst." /><div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]"><div className="space-y-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Datum</FieldLabel><Input type="date" value={visitForm.visit_date} onChange={(e) => setVisitForm((prev) => ({ ...prev, visit_date: e.target.value }))} /></div><div><FieldLabel>Besuch von</FieldLabel><Input value={visitForm.visited_by} onChange={(e) => setVisitForm((prev) => ({ ...prev, visited_by: e.target.value }))} placeholder="z. B. Roger / Dominik" /></div></div><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Kontaktperson beim Händler</FieldLabel><select value={selectedVisitContactId} onChange={(e) => setSelectedVisitContactId(e.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="">Keine Kontaktperson ausgewählt</option>{dealerContactOptions.map((contact) => <option key={contact.id} value={contact.id}>{contact.label}{contact.raw.role ? ` · ${contact.raw.role}` : ""}</option>)}</select>{dealerContactOptions.length === 0 ? <p className="mt-1 text-xs text-indigo-700">Noch keine Kontakte für diesen Händler hinterlegt. Du kannst sie in der Kontaktverwaltung erfassen.</p> : selectedVisitContact ? <p className="mt-1 text-xs text-indigo-700">{selectedVisitContact.role || "Kontakt"} · {selectedVisitContact.user_email}</p> : null}</div><div><FieldLabel>Weitere Kontaktpersonen / Notiz</FieldLabel><Textarea value={visitForm.contact_persons} onChange={(v) => setVisitForm((prev) => ({ ...prev, contact_persons: v }))} rows={3} placeholder="z. B. zusätzlich Geschäftsführer, Verkaufsleiter, Lernender..." /></div></div></div><div><FieldLabel>Was wurde besprochen?</FieldLabel><Textarea value={visitForm.discussed} onChange={(v) => setVisitForm((prev) => ({ ...prev, discussed: v }))} rows={4} /></div><div><FieldLabel>Was wurde vereinbart?</FieldLabel><Textarea value={visitForm.agreed} onChange={(v) => setVisitForm((prev) => ({ ...prev, agreed: v }))} rows={3} /></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Nächste Schritte</FieldLabel><Textarea value={visitForm.next_steps} onChange={(v) => setVisitForm((prev) => ({ ...prev, next_steps: v }))} rows={3} /></div><div><FieldLabel>Offene Punkte</FieldLabel><Textarea value={visitForm.open_points} onChange={(v) => setVisitForm((prev) => ({ ...prev, open_points: v }))} rows={3} /></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Was lief gut?</FieldLabel><Textarea value={visitForm.what_went_well} onChange={(v) => setVisitForm((prev) => ({ ...prev, what_went_well: v }))} rows={3} /></div><div><FieldLabel>Was lief weniger gut?</FieldLabel><Textarea value={visitForm.what_went_less_well} onChange={(v) => setVisitForm((prev) => ({ ...prev, what_went_less_well: v }))} rows={3} /></div><div><FieldLabel>Konkurrenz / Marktinfos</FieldLabel><Textarea value={visitForm.competition_market_info} onChange={(v) => setVisitForm((prev) => ({ ...prev, competition_market_info: v }))} rows={3} /></div><div><FieldLabel>Branding / Sichtbarkeit</FieldLabel><Textarea value={visitForm.branding_visibility} onChange={(v) => setVisitForm((prev) => ({ ...prev, branding_visibility: v }))} rows={3} /></div></div></div><div className="space-y-4"><div className="rounded-2xl border border-gray-200 bg-white p-4"><div className="mb-3 text-sm font-semibold text-gray-900">Sell-in Snapshot aus Auto KPI</div><div className="grid grid-cols-2 gap-2 text-xs text-gray-600"><div>Zeitraum</div><div className="font-semibold text-gray-900">{getPeriodLabel(periodMode)}</div><div>Sell-in Sony Umsatz</div><div className="font-semibold text-gray-900">{formatCurrency(autoSonyRevenue)}</div><div>Vorjahr</div><div className="font-semibold text-gray-900">{formatCurrency(autoSonyRevenuePrevYear)}</div><div>YoY</div><div className="font-semibold text-gray-900">{formatPercent(yoyPercent)}</div></div></div>{renderSelloutInputGrid({ mode: "create" })}<div className="rounded-2xl border border-gray-200 bg-white p-4"><div className="mb-3 text-sm font-semibold text-gray-900">Letzter gespeicherter Besuch</div><div className="grid grid-cols-2 gap-2 text-xs text-gray-600"><div>Periode</div><div className="font-semibold text-gray-900">{latestVisitSellout.period || "–"}{latestVisitSellout.periodStart || latestVisitSellout.periodEnd ? ` · ${formatDate(latestVisitSellout.periodStart)} – ${formatDate(latestVisitSellout.periodEnd)}` : ""}</div><div>Sell-in Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sellInSony)}</div><div>Sell-out Total</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.total)}</div><div>Sell-out Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sony)} · {formatPercent(latestVisitSellout.sonyShare)}</div><div>TV Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.tvSony)} / {formatCurrency(latestVisitSellout.tvTotal)} · {formatPercent(latestVisitSellout.tvShare)}</div>
      <div>TV Qty Sony</div>
        <div className="font-semibold text-gray-900">
          {formatInteger(latestVisitSellout.tvSonyQty)} / {formatInteger(latestVisitSellout.tvTotalQty)} · {formatPercent(latestVisitSellout.tvQtyShare)}
        </div><div>Soundbar Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sbSony)} / {formatCurrency(latestVisitSellout.sbTotal)} · {formatPercent(latestVisitSellout.sbShare)}</div>
        <div>Soundbar Qty Sony</div>
          <div className="font-semibold text-gray-900">
            {formatInteger(latestVisitSellout.sbSonyQty)} / {formatInteger(latestVisitSellout.sbTotalQty)} · {formatPercent(latestVisitSellout.sbQtyShare)}
          </div>
        <div>Rest Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.restSony)} / {formatCurrency(latestVisitSellout.restTotal)} · {formatPercent(latestVisitSellout.restShare)}</div></div></div><div className="flex justify-end"><Button type="button" onClick={addVisit} disabled={addingVisit}>{addingVisit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Besuchsreport speichern</Button></div></div></div></Card>

      <Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<MonitorSmartphone className="h-5 w-5 text-sky-600" />} title="Display-Tracker" subtitle="Gehört zum Kundenbesuch: prüfen, ergänzen und Status aktualisieren." /><div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_120px_180px_1fr_auto]"><div><FieldLabel>Produkt</FieldLabel><Input value={displayForm.product_name_snapshot} onChange={(e) => setDisplayForm((prev) => ({ ...prev, product_name_snapshot: e.target.value }))} placeholder="z. B. XR-65A95L" /></div><div><FieldLabel>Menge</FieldLabel><Input value={displayForm.ordered_qty} onChange={(e) => setDisplayForm((prev) => ({ ...prev, ordered_qty: e.target.value }))} /></div><div><FieldLabel>Im Laden ausgestellt?</FieldLabel><select value={displayForm.is_displayed} onChange={(e) => setDisplayForm((prev) => ({ ...prev, is_displayed: e.target.value as "yes" | "no" | "unknown" }))} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="yes">Ja</option><option value="no">Nein</option><option value="unknown">Unklar</option></select></div><div><FieldLabel>Bemerkung</FieldLabel><Input value={displayForm.note} onChange={(e) => setDisplayForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="z. B. noch im Lager" /></div><div className="flex items-end"><Button type="button" onClick={addDisplayItem} disabled={addingDisplayItem}>{addingDisplayItem ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Hinzufügen</Button></div></div><div className="mt-5 overflow-x-auto">{displayItems.length === 0 ? <p className="text-sm text-gray-500">Noch keine Display-Produkte erfasst.</p> : <table className="min-w-full border-separate border-spacing-y-2"><thead><tr className="text-left text-xs uppercase tracking-wide text-gray-500"><th className="px-3 py-2">Produkt</th><th className="px-3 py-2">Menge</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Geprüft am</th><th className="px-3 py-2">Bemerkung</th><th className="px-3 py-2">Aktion</th></tr></thead><tbody>{displayItems.map((item) => <tr key={item.display_item_id} className="rounded-2xl bg-gray-50 text-sm text-gray-700"><td className="px-3 py-3 font-medium text-gray-900">{item.product_name_snapshot}</td><td className="px-3 py-3">{item.ordered_qty ?? "-"}</td><td className="px-3 py-3">{item.status === "ordered" ? "Bestellt" : item.status === "displayed" ? "Ausgestellt" : item.status === "not_displayed" ? "Nicht ausgestellt" : item.status === "sold_off" ? "Abverkauft" : item.status === "removed" ? "Entfernt" : "-"}</td><td className="px-3 py-3">{formatDate(item.display_checked_at)}</td><td className="px-3 py-3">{item.note || "-"}</td><td className="px-3 py-3"><div className="flex flex-wrap gap-2"><Button type="button" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateDisplayStatus(item.display_item_id, "displayed")}>Ausgestellt</Button><Button type="button" size="sm" variant="outline" onClick={() => updateDisplayStatus(item.display_item_id, "not_displayed")}>Nicht ausgestellt</Button><Button type="button" size="sm" variant="outline" onClick={() => updateDisplayStatus(item.display_item_id, "sold_off")}>Abverkauft</Button><Button type="button" size="sm" variant="outline" onClick={() => updateDisplayStatus(item.display_item_id, "removed")}>Entfernt</Button><Button type="button" size="sm" variant="outline" onClick={() => updateDisplayStatus(item.display_item_id, "ordered")}>Reset</Button></div></td></tr>)}</tbody></table>}</div></Card>

      <details className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-3"><div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-blue-600" /><div><h2 className="text-lg font-semibold text-gray-900">CRM & Stammdaten bearbeiten</h2><p className="text-sm text-gray-500">Administrative Daten, Segmentierung und technische Felder sind eingeklappt.</p></div></div><Edit3 className="h-4 w-4 text-gray-500" /></summary><div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2"><Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<UserRound className="h-5 w-5 text-blue-600" />} title="Händler-Stammdaten" subtitle="Nur bei Bedarf öffnen und bearbeiten." /><div className="space-y-5"><div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="mb-3 text-sm font-semibold text-blue-900">Basisdaten Händler</div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><div><FieldLabel>Händlername *</FieldLabel><Input value={dealerForm.name} onChange={(e) => setDealerForm((prev) => ({ ...prev, name: e.target.value }))} /></div><div><FieldLabel>Store Name</FieldLabel><Input value={dealerForm.store_name} onChange={(e) => setDealerForm((prev) => ({ ...prev, store_name: e.target.value }))} /></div><div><FieldLabel>Login-Nr. *</FieldLabel><Input value={dealerForm.login_nr} onChange={(e) => setDealerForm((prev) => ({ ...prev, login_nr: e.target.value }))} /></div><div><FieldLabel>Login-E-Mail *</FieldLabel><Input type="email" value={dealerForm.login_email} onChange={(e) => setDealerForm((prev) => ({ ...prev, login_email: e.target.value }))} /></div><div><FieldLabel>Händler E-Mail</FieldLabel><Input type="email" value={dealerForm.email} onChange={(e) => setDealerForm((prev) => ({ ...prev, email: e.target.value }))} /></div><div><FieldLabel>Ansprechpartner</FieldLabel><Input value={dealerForm.contact_person} onChange={(e) => setDealerForm((prev) => ({ ...prev, contact_person: e.target.value }))} /></div><div><FieldLabel>Telefon</FieldLabel><Input value={dealerForm.phone} onChange={(e) => setDealerForm((prev) => ({ ...prev, phone: e.target.value }))} /></div><div><FieldLabel>Website</FieldLabel><Input value={dealerForm.website} onChange={(e) => setDealerForm((prev) => ({ ...prev, website: e.target.value }))} /></div></div></div><div className="rounded-2xl border border-gray-200 bg-white p-4"><div className="mb-3 text-sm font-semibold text-gray-900">Adresse & Kategorisierung</div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><div className="xl:col-span-2"><FieldLabel>Strasse</FieldLabel><Input value={dealerForm.street} onChange={(e) => setDealerForm((prev) => ({ ...prev, street: e.target.value }))} /></div><div><FieldLabel>PLZ</FieldLabel><Input value={dealerForm.plz} onChange={(e) => setDealerForm((prev) => ({ ...prev, plz: e.target.value }))} /></div><div><FieldLabel>Ort</FieldLabel><Input value={dealerForm.city} onChange={(e) => setDealerForm((prev) => ({ ...prev, city: e.target.value }))} /></div><div><FieldLabel>Land</FieldLabel><Input value={dealerForm.country} onChange={(e) => setDealerForm((prev) => ({ ...prev, country: e.target.value }))} /></div><div><FieldLabel>Sprache</FieldLabel><Input value={dealerForm.language} onChange={(e) => setDealerForm((prev) => ({ ...prev, language: e.target.value }))} placeholder="de / fr / it / en" /></div><div><FieldLabel>Distribution</FieldLabel><Input value={dealerForm.distribution} onChange={(e) => setDealerForm((prev) => ({ ...prev, distribution: e.target.value }))} /></div><div><FieldLabel>Kundenklassifizierung</FieldLabel><Input value={dealerForm.customer_classification} onChange={(e) => setDealerForm((prev) => ({ ...prev, customer_classification: e.target.value }))} /></div></div></div><div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><div className="mb-3 text-sm font-semibold text-amber-900">Zuständigkeit & Mails</div><div className="grid grid-cols-1 gap-4 xl:grid-cols-2"><div><FieldLabel>KAM</FieldLabel><Input value={dealerForm.kam} onChange={(e) => setDealerForm((prev) => ({ ...prev, kam: e.target.value }))} /></div><div><FieldLabel>KAM Name</FieldLabel><Input value={dealerForm.kam_name} onChange={(e) => setDealerForm((prev) => ({ ...prev, kam_name: e.target.value }))} /></div><div><FieldLabel>KAM E-Mail Sony</FieldLabel><Input value={dealerForm.kam_email_sony} onChange={(e) => setDealerForm((prev) => ({ ...prev, kam_email_sony: e.target.value }))} /></div><div><FieldLabel>Mail Dealer</FieldLabel><Input value={dealerForm.mail_dealer} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_dealer: e.target.value }))} /></div><div><FieldLabel>Mail KAM</FieldLabel><Input value={dealerForm.mail_kam} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_kam: e.target.value }))} /></div><div><FieldLabel>Mail KAM 2</FieldLabel><Input value={dealerForm.mail_kam2} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_kam2: e.target.value }))} /></div><div><FieldLabel>Mail BG</FieldLabel><Input value={dealerForm.mail_bg} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_bg: e.target.value }))} /></div><div><FieldLabel>Mail BG 2</FieldLabel><Input value={dealerForm.mail_bg2} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_bg2: e.target.value }))} /></div><div className="xl:col-span-2"><FieldLabel>Mail Sony</FieldLabel><Input value={dealerForm.mail_sony} onChange={(e) => setDealerForm((prev) => ({ ...prev, mail_sony: e.target.value }))} /></div></div></div></div></Card>

        <Card className="rounded-2xl border border-gray-200 p-5"><SectionHeader icon={<Tag className="h-5 w-5 text-amber-600" />} title="Segmentierung & Tags" subtitle="Gruppierte Händler- und Mitarbeiter-Tags." /><div className="space-y-5">{TAG_GROUPS.map((group) => <TagCategorySection key={group.key} group={group} tags={groupedTags[group.key]} activeIds={assignedTagIds} onToggle={toggleTag} />)}<div className="rounded-2xl border border-dashed border-gray-300 p-4"><div className="mb-3 text-sm font-medium text-gray-800">Zusätzlichen Tag anlegen</div><div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]"><Input value={newTagLabel} onChange={(e) => setNewTagLabel(e.target.value)} placeholder="z. B. VIP Event geeignet" /><select value={newTagCategory} onChange={(e) => setNewTagCategory(e.target.value as "interest" | "crm")} className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"><option value="interest">Interesse</option><option value="crm">CRM-Merkmal</option></select><Button type="button" onClick={createCustomTag} disabled={creatingTag}>{creatingTag ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Tag erstellen</Button></div></div><div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><div className="mb-3"><div className="text-sm font-semibold text-indigo-900">Verantwortliche & persönliche Tags</div><p className="mt-1 text-xs text-indigo-700">Diese Interessen und CRM-Merkmale gelten für den jeweiligen internen Mitarbeiter beim Händler.</p></div>{dealerUsers.length === 0 ? <p className="text-sm text-indigo-700">Noch keine internen Verantwortlichen für diesen Händler hinterlegt.</p> : <div className="space-y-4">{dealerUsers.map((user) => { const assignedUserTagIds = dealerUserTagAssignments.filter((x) => Number(x.dealer_user_id) === Number(user.id)).map((x) => Number(x.tag_id)); return <div key={user.id} className="rounded-xl border bg-white p-4"><div className="mb-3"><div className="font-semibold text-gray-900">{user.display_name || user.user_email}</div><div className="text-xs text-gray-500">{user.role || "Keine Rolle"} · {user.user_email}</div><div className="mt-2"><Button type="button" size="sm" variant="outline" onClick={() => setEditingUser(user)}>Bearbeiten</Button></div></div><div className="space-y-3">{TAG_GROUPS.map((group) => <TagCategorySection key={`${user.id}-${group.key}`} group={group} tags={groupedTags[group.key]} activeIds={assignedUserTagIds} onToggle={(tagId) => toggleDealerUserTag(Number(user.id), tagId)} small />)}</div></div>; })}</div>}</div></div></Card></div></details>

      {editingUser && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-3"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 className="mb-4 text-lg font-semibold text-gray-900">Mitarbeiter bearbeiten</h2><div className="space-y-4"><div><FieldLabel>Name</FieldLabel><Input value={editingUser.display_name || ""} onChange={(e) => setEditingUser((prev) => prev ? { ...prev, display_name: e.target.value } : prev)} /></div><div><FieldLabel>E-Mail *</FieldLabel><Input type="email" value={editingUser.user_email} onChange={(e) => setEditingUser((prev) => prev ? { ...prev, user_email: e.target.value } : prev)} /></div><div><FieldLabel>Rolle / Funktion</FieldLabel><Input value={editingUser.role || ""} onChange={(e) => setEditingUser((prev) => prev ? { ...prev, role: e.target.value } : prev)} /></div></div><div className="mt-6 flex flex-wrap justify-between gap-3"><Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={deleteDealerUser} disabled={savingUser}>Löschen</Button><div className="flex gap-3"><Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={savingUser}>Abbrechen</Button><Button type="button" onClick={updateDealerUser} disabled={savingUser}>{savingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Speichern</Button></div></div></div></div>}

      {editingVisit && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-3"><div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-gray-900">Besuchsrapport bearbeiten</h2><p className="mt-1 text-sm text-gray-500">Gleiche Logik wie bei der Neuerfassung: Sell-in Snapshot separat, Sell-out Werte manuell, Prozente automatisch.</p></div><Button type="button" variant="outline" onClick={() => setEditingVisit(null)} disabled={savingVisitEdit}>Abbrechen</Button></div><div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]"><div className="space-y-4"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Datum</FieldLabel><Input type="date" value={editingVisit.visit_date} onChange={(e) => setEditingVisit((prev) => prev ? { ...prev, visit_date: e.target.value } : prev)} /></div><div><FieldLabel>Besuch von</FieldLabel><Input value={editingVisit.visited_by || ""} onChange={(e) => setEditingVisit((prev) => prev ? { ...prev, visited_by: e.target.value } : prev)} /></div></div><div><FieldLabel>Kontakt / Teilnehmer</FieldLabel><Textarea value={editingVisit.contact_persons || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, contact_persons: v } : prev)} rows={3} /></div><div><FieldLabel>Was wurde besprochen?</FieldLabel><Textarea value={editingVisit.discussed || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, discussed: v } : prev)} rows={4} /></div><div><FieldLabel>Was wurde vereinbart?</FieldLabel><Textarea value={editingVisit.agreed || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, agreed: v } : prev)} rows={3} /></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Nächste Schritte</FieldLabel><Textarea value={editingVisit.next_steps || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, next_steps: v } : prev)} rows={3} /></div><div><FieldLabel>Offene Punkte</FieldLabel><Textarea value={editingVisit.open_points || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, open_points: v } : prev)} rows={3} /></div></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><FieldLabel>Was lief gut?</FieldLabel><Textarea value={editingVisit.what_went_well || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, what_went_well: v } : prev)} rows={3} /></div><div><FieldLabel>Was lief weniger gut?</FieldLabel><Textarea value={editingVisit.what_went_less_well || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, what_went_less_well: v } : prev)} rows={3} /></div><div><FieldLabel>Konkurrenz / Marktinfos</FieldLabel><Textarea value={editingVisit.competition_market_info || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, competition_market_info: v } : prev)} rows={3} /></div><div><FieldLabel>Branding / Sichtbarkeit</FieldLabel><Textarea value={editingVisit.branding_visibility || ""} onChange={(v) => setEditingVisit((prev) => prev ? { ...prev, branding_visibility: v } : prev)} rows={3} /></div></div></div><div className="space-y-4"><div className="rounded-2xl border border-gray-200 bg-white p-4"><div className="mb-3 text-sm font-semibold text-gray-900">Sell-in Snapshot</div><p className="mb-3 text-xs text-gray-500">Dieser Wert ist bewusst separat: Er zeigt den Sony Sell-in aus euren Bestellungen zum Zeitpunkt des Rapports.</p><FieldLabel>Sell-in Sony Umsatz Snapshot</FieldLabel><Input value={numberToInput(editingVisit.sony_sales_snapshot)} onChange={(e) => setEditingVisit((prev) => prev ? { ...prev, sony_sales_snapshot: toNumberOrNull(e.target.value) } : prev)} /></div>{renderSelloutInputGrid({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    mode: "edit",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    editingVisit,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    setEditingVisit,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  })}
<div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setEditingVisit(null)} disabled={savingVisitEdit}>Abbrechen</Button><Button type="button" onClick={updateVisit} disabled={savingVisitEdit}>{savingVisitEdit ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Änderungen speichern</Button></div></div></div></div></div>}

      {toast && <div className="fixed right-4 top-4 z-[90]"><div className={`rounded px-4 py-2 text-sm text-white shadow-md ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>{toast.message}</div></div>}
    </div>
  );
}
