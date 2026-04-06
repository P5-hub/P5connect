// /app/(dealer)/types/CartItem.ts

import { Product } from "@/types/Product";

/**
 * CartItem erweitert ein Product um alle Felder,
 * die der Händler im Warenkorb bearbeiten kann.
 */
export interface CartItem extends Product {
  /** Menge */
  quantity: number;

  /** Händlerpreis pro Stück (CHF) */
  price?: number;

  /** Falls Spezialvertrieb: ausgewählter Distributor */
  overrideDistributor?: string;

  /** Liste erlaubter Distributoren (Codes) */
  allowedDistis?: string[];

  // -------------------------------------
  //   Streetprice / Günstigster Anbieter
  // -------------------------------------

  /** Günstigster Preis brutto (inkl. MwSt.) */
  lowest_price_brutto?: number | null;

  /** Quelle z. B. Digitec, Brack, etc. */
  lowest_price_source?: string | null;

  /** Nur wenn lowest_price_source = "Andere" */
  lowest_price_source_custom?: string | null;

  // -------------------------------------
  //   Messe / Aktionen / Pricing
  // -------------------------------------

  /** Bestellmodus */
  order_mode?: "standard" | "messe" | "monatsaktion";

  /** Preislogik auf Positionsebene */
  pricing_mode?: "standard" | "messe" | "display";

  /** Zugehörige Kampagne */
  campaign_id?: number | null;
  campaign_name?: string | null;

  /** Kennzeichen für Display-Bestellung */
  is_display_item?: boolean;

  /** Ob dieses Produkt bonusrelevant ist */
  bonus_relevant?: boolean;

  // -------------------------------------
  //   Display / Messe Preislogik
  // -------------------------------------

  /** UPE brutto (normalerweise retail_price aus Product) */
  upe_brutto?: number | null;

  /** VRG-Betrag */
  vrg_amount?: number | null;

  /** MwSt.-Satz (nur optional, falls später benötigt) */
  mwst_rate?: number | null;

  /** UPE netto exkl. VRG (optional berechnet) */
  upe_netto_excl_vrg?: number | null;

  /** Display-Faktor in %, z. B. 50 */
  display_factor_percent?: number | null;

  /** Berechneter Displaypreis netto */
  display_price_netto?: number | null;

  /** Messepreis netto */
  messe_price_netto?: number | null;

  /** Rabatt vs. HRP (dealer_invoice_price) in % */
  display_discount_vs_hrp_percent?: number | null;

  // -------------------------------------
  //   Snapshot (extrem wichtig für DB!)
  // -------------------------------------

  /** Maximal erlaubte Menge pro Händler innerhalb der Aktion */
  max_qty_per_dealer?: number | null;
  /** Maximal erlaubte Gesamtmenge pro Händler innerhalb der Aktion */
  max_total_qty_per_dealer?: number | null;

  /** Maximal erlaubte Display-Menge pro Händler innerhalb der Aktion */
  max_display_qty_per_dealer?: number | null;

  /** Maximal erlaubte Messe-Menge pro Händler innerhalb der Aktion */
  max_messe_qty_per_dealer?: number | null;

  // -------------------------------------
  //   Snapshot (extrem wichtig für DB!)
  // -------------------------------------

  /** Snapshot der Preisberechnung */
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

    /** final gespeicherter Preis */
    final_unit_price?: number | null;

    /** Rabatt vs HRP */
    display_discount_vs_hrp_percent?: number | null;

    calculated_at?: string | null;
  } | null;
}