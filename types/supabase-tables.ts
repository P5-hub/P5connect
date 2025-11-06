// ==============================
// 📘 Supabase Table Types (v3)
// ==============================

// 🧩 "submissions" table
export type SubmissionRow = {
  submission_id?: number;
  dealer_id: number | string;
  typ: string;
  kommentar?: string | null;
  sony_share?: number | null;
  calendar_week?: number | null;
  week_start?: string | null;
  week_end?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  dealer_reference?: string | null;
  order_comment?: string | null;
};

// 🧩 "submission_items" table
export type SubmissionItemRow = {
  item_id?: number;
  submission_id: number;
  ean?: string | null;
  product_name?: string | null;
  sony_article?: string | null;
  menge?: number | null;
  preis?: number | null;
  serial?: string | null;
  datum?: string | null;
  comment?: string | null;
  created_at?: string | null;
};

// 🧩 "dealers" table
export type DealerRow = {
  dealer_id: number;
  name?: string | null;
  store_name?: string | null;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  plz?: string | null;
  zip?: string | null;
  street?: string | null;
  login_nr?: string | null;
  country?: string | null;
  language?: string | null;
  mail_kam?: string | null;
  mail_kam2?: string | null;
  mail_bg?: string | null;
  mail_bg2?: string | null;
  mail_sony?: string | null;
  kam_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// 🧩 "project_requests" table
export type ProjectRequestRow = {
  id: number;
  dealer_id: number;
  project_name?: string | null;
  project_type?: string | null;
  customer?: string | null;
  location?: string | null;
  comment?: string | null;
  project_date?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  store_name?: string | null;
  login_nr?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

// 🧩 "support_claims" table
export type SupportClaimRow = {
  claim_id: number;
  dealer_id: number | null;
  created_at?: string | null;
  submission_date?: string | null;
  status?: string | null;
  support_typ?: string | null;
  produkte?: any;
  comment?: string | null;
  updated_at?: string | null;
};

// 🧩 "cashback_claims" table
export type CashbackClaimRow = {
  claim_id: number;
  dealer_id: number | null;
  created_at?: string | null;
  status?: string | null;
  cashback_type?: string | null;
  cashback_betrag?: number | null;
  seriennummer?: string | null;
  seriennummer_sb?: string | null;
  soundbar_ean?: string | null;
  document_path?: string | null;
  updated_at?: string | null;
};

// 🧩 Hilfstypen
export type DateRange = { start: string; end: string };
export type ID = number | string;

// =============================================
// ✅ Globale generische Utility-Typen für Supabase
// =============================================
export type SupabaseTableTypes =
  | SubmissionRow
  | SubmissionItemRow
  | DealerRow
  | ProjectRequestRow
  | SupportClaimRow
  | CashbackClaimRow;
