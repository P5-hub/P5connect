export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          product_id: string;
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
          created_at?: string | null;
          updated_at?: string | null;
        };
        Insert: {
          product_id?: string;
          ean?: string | null;
          product_name?: string | null;
          sony_article?: string | null;
          brand?: string | null;
          gruppe?: string | null;
          category?: string | null;
          retail_price?: number | null;
          dealer_invoice_price?: number | null;
          product_description?: string | null;
          active_sofortrabatt?: boolean | null;
          ph2?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          product_id?: string;
          ean?: string | null;
          product_name?: string | null;
          sony_article?: string | null;
          brand?: string | null;
          gruppe?: string | null;
          category?: string | null;
          retail_price?: number | null;
          dealer_invoice_price?: number | null;
          product_description?: string | null;
          active_sofortrabatt?: boolean | null;
          ph2?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
