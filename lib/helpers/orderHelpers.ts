// /lib/helpers/orderHelpers.ts
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export function buildOrderMeta(b: any) {
  return {
    dealerCompany: b.company_name ?? b.dealer_company ?? b.dealer_name ?? null,
    dealerName: b.dealer_name ?? null,
    dealerEmail: b.dealer_email ?? null,
    dealerPhone: b.dealer_phone ?? null,
    dealerStreet: b.dealer_street ?? null,
    dealerZip: b.dealer_zip ?? null,
    dealerCity: b.dealer_city ?? null,
    dealerCountry: b.dealer_country ?? "Schweiz",
    kamName: b.kam_name ?? b.kam ?? null,
    kamEmail: b.kam_email ?? b.kam_email_sony ?? b.mail_kam ?? b.kam ?? null,
    orderNumber: b.order_number ?? b.submission_id ?? null,
    customerNumber: b.dealer_login_nr ?? b.customer_number ?? null,
    customerName: b.customer_name ?? b.customer ?? null,
    customerContact: b.dealer_contact_person ?? b.customer_contact ?? null,
    customerPhone: b.customer_phone ?? null,
  };
}

export async function updateStatus(submissionId: number, status: string) {
  const { error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("submission_id", submissionId)
    .eq("typ", "bestellung");

  if (error) console.error("❌ Statusupdate:", error);
}

export async function resetStatusToPending(submissionId: number) {
  await updateStatus(submissionId, "pending");
}

