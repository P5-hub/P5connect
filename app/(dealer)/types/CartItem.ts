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
}
