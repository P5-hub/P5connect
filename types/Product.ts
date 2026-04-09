// types/Product.ts

export type Product = {
  product_id: number;
  ean: string | null;
  product_name: string | null;
  sony_article: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  dealer_invoice_price: number | null;
  product_description: string | null;
  active_sofortrabatt: boolean | null;
  ph2: string | null;
  product_image_url?: string | null;

  /** optionale UI-/Alias-Felder */
  name?: string;
};