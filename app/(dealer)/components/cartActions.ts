import { submitGroupedItems } from "@/lib/submitGroupedItems";
import { getSupabaseBrowser } from "@/lib/supabaseClient";

export const cartActions: any = {
  // -------------------------
  // BESTELLUNG
  // -------------------------
  bestellung: async ({ cart, dealer }: any) => {
    return submitGroupedItems({
      typ: "bestellung",
      dealer,
      items: cart,
    });
  },

  // -------------------------
  // VERKAUF
  // -------------------------
  verkauf: async ({ cart, dealer, extra }: any) => {
    return submitGroupedItems({
      typ: "verkauf",
      dealer,
      items: cart,
      meta: {
        inhouse_share: extra.inhouseShare,
        calendar_week: extra.calendarWeek,
      },
    });
  },

  // -------------------------
  // PROJEKT
  // -------------------------
  projekt: async ({ cart, dealer, extra }: any) => {
    const supabase = getSupabaseBrowser();

    const { data: projectRow, error } = await supabase
      .from("project_requests")
      .insert([
        {
          dealer_id: dealer.dealer_id,
          project_type: extra.type,
          project_name: extra.name,
          customer: extra.customer,
          location: extra.location,
          start_date: extra.start,
          end_date: extra.end,
          comment: extra.comment,
          project_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return submitGroupedItems({
      typ: "projekt",
      dealer,
      items: cart,
      meta: { project_id: projectRow.id },
    });
  },

  // -------------------------
  // SUPPORT
  // -------------------------
  support: async ({ cart, dealer, extra }: any) => {
    return submitGroupedItems({
      typ: "support",
      dealer,
      items: cart,
      meta: { type: extra.type, comment: extra.comment },
    });
  },

  // -------------------------
  // SOFORTRABATT
  // -------------------------
  sofortrabatt: async ({ cart, dealer, extra }: any) => {
    const supabase = getSupabaseBrowser();

    // Datei hochladen
    const file = extra.invoice;
    if (!file) throw new Error("Rechnung fehlt.");

    const filePath = `${dealer.login_nr}/invoice-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("sofortrabatt-invoices")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Eintrag speichern
    const { error } = await supabase.from("sofortrabatt_claims").insert([
      {
        dealer_id: dealer.dealer_id,
        invoice_file_url: filePath,
        rabatt_level: extra.level,
        rabatt_betrag: extra.total,
        status: "pending",
        products: cart.map((c: any) => ({
          product_id: c.product_id,
          seriennummer: c.seriennummer,
        })),
      },
    ]);

    if (error) throw error;
  },
};
