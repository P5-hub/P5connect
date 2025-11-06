// app/types/index.ts
import type { Database } from "@/types/supabase";

export type TDealer = Database["public"]["Tables"]["dealers"]["Row"];
export type TSubmission = Database["public"]["Tables"]["submissions"]["Row"];
export type TSubmissionItem = Database["public"]["Tables"]["submission_items"]["Row"];
export type TProject = Database["public"]["Tables"]["project_requests"]["Row"];
export type TSupportClaim = Database["public"]["Tables"]["support_claims"]["Row"];
export type TSofortrabattClaim = Database["public"]["Tables"]["sofortrabatt_claims"]["Row"];
export type TProduct = Database["public"]["Tables"]["products"]["Row"];
