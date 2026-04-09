// app/(dealer)/types/CartItem.ts

import { Product } from "@/types/Product";

export interface CartItem extends Product {
  quantity: number;
  price?: number;
  serial?: string | null;

  price_manual_override?: boolean;
  price_manual_override_value?: number | null;

  overrideDistributor?: string;
  allowedDistis?: string[];

  lowest_price_brutto?: number | null;
  lowest_price_netto?: number | null;
  lowest_price_source?: string | null;
  lowest_price_source_custom?: string | null;

  order_mode?: "standard" | "messe" | "monatsaktion";
  pricing_mode?: "standard" | "messe" | "display";

  campaign_id?: number | null;
  campaign_name?: string | null;
  campaign_name_snapshot?: string | null;

  is_display_item?: boolean;
  bonus_relevant?: boolean;
  overflow_from_campaign?: boolean;

  upe_brutto?: number | null;
  vrg_amount?: number | null;
  mwst_rate?: number | null;
  upe_netto_excl_vrg?: number | null;
  display_factor_percent?: number | null;
  display_price_netto?: number | null;
  messe_price_netto?: number | null;
  display_discount_vs_hrp_percent?: number | null;

  max_qty_per_dealer?: number | null;
  max_total_qty_per_dealer?: number | null;
  max_display_qty_per_dealer?: number | null;
  max_messe_qty_per_dealer?: number | null;

  matched_group_codes?: string[];
  matched_group_names?: string[];
  has_group_override?: boolean;

  calc_price_on_invoice?: number | null;
  netto_retail?: number | null;
  marge_alt?: number | null;
  marge_neu?: number | null;
  margin_street?: number | null;
  invest?: number | null;

  distributor_id?: string | null;
  comment?: string | null;
  project_id?: number | string | null;

  pricing_snapshot?: {
    source?: "standard" | "campaign";
    campaign_id?: number | null;
    campaign_name?: string | null;
    order_mode?: "standard" | "messe" | "monatsaktion";
    pricing_mode?: "standard" | "messe" | "display";
    upe_brutto?: number | null;
    vrg_amount?: number | null;
    mwst_rate?: number | null;
    upe_netto_excl_vrg?: number | null;
    display_factor_percent?: number | null;
    display_price_netto?: number | null;
    messe_price_netto?: number | null;
    final_unit_price?: number | null;
    display_discount_vs_hrp_percent?: number | null;
    matched_group_codes?: string[];
    matched_group_names?: string[];
    has_group_override?: boolean;
    calculated_at?: string | null;
  } | null;
}