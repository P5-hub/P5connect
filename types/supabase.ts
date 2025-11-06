export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cashback_claims: {
        Row: {
          cashback_betrag: number | null
          cashback_type: string | null
          claim_id: number
          created_at: string | null
          document_path: string | null
          document_path_sb: string | null
          seriennummer: string | null
          seriennummer_sb: string | null
          soundbar_ean: string | null
          status: string | null
          submission_id: number
          updated_at: string | null
        }
        Insert: {
          cashback_betrag?: number | null
          cashback_type?: string | null
          claim_id?: number
          created_at?: string | null
          document_path?: string | null
          document_path_sb?: string | null
          seriennummer?: string | null
          seriennummer_sb?: string | null
          soundbar_ean?: string | null
          status?: string | null
          submission_id: number
          updated_at?: string | null
        }
        Update: {
          cashback_betrag?: number | null
          cashback_type?: string | null
          claim_id?: number
          created_at?: string | null
          document_path?: string | null
          document_path_sb?: string | null
          seriennummer?: string | null
          seriennummer_sb?: string | null
          soundbar_ean?: string | null
          status?: string | null
          submission_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_ext"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "projekt_claims_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_full"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_nextjs"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      dealers: {
        Row: {
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          customer_classification: string | null
          customer_type: string | null
          dealer_id: number
          description: string | null
          distribution: string | null
          ecot4: string | null
          email: string | null
          fax: string | null
          fivej_gv: string | null
          kam: string | null
          kam_email_sony: string | null
          kam_name: string | null
          language: string | null
          login_email: string
          login_nr: string
          mail_bg: string | null
          mail_bg2: string | null
          mail_dealer: string | null
          mail_kam: string | null
          mail_kam2: string | null
          mail_sony: string | null
          name: string
          password_plain: string | null
          phone: string | null
          plz: string | null
          role: string | null
          sds: string | null
          serp: string | null
          store_name: string | null
          street: string | null
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          customer_classification?: string | null
          customer_type?: string | null
          dealer_id?: number
          description?: string | null
          distribution?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          kam_email_sony?: string | null
          kam_name?: string | null
          language?: string | null
          login_email: string
          login_nr: string
          mail_bg?: string | null
          mail_bg2?: string | null
          mail_dealer?: string | null
          mail_kam?: string | null
          mail_kam2?: string | null
          mail_sony?: string | null
          name: string
          password_plain?: string | null
          phone?: string | null
          plz?: string | null
          role?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          customer_classification?: string | null
          customer_type?: string | null
          dealer_id?: number
          description?: string | null
          distribution?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          kam_email_sony?: string | null
          kam_name?: string | null
          language?: string | null
          login_email?: string
          login_nr?: string
          mail_bg?: string | null
          mail_bg2?: string | null
          mail_dealer?: string | null
          mail_kam?: string | null
          mail_kam2?: string | null
          mail_sony?: string | null
          name?: string
          password_plain?: string | null
          phone?: string | null
          plz?: string | null
          role?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      dealers_backup_yyyymmdd: {
        Row: {
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          customer_classification: string | null
          customer_type: string | null
          dealer_id: number | null
          description: string | null
          distribution: string | null
          ecot4: string | null
          email: string | null
          fax: string | null
          fivej_gv: string | null
          kam: string | null
          kam_name: string | null
          language: string | null
          login_email: string | null
          login_nr: string | null
          mail_bg: string | null
          mail_bg2: string | null
          mail_dealer: string | null
          mail_kam: string | null
          mail_kam2: string | null
          mail_sony: string | null
          name: string | null
          password_plain: string | null
          phone: string | null
          plz: string | null
          role: string | null
          sds: string | null
          serp: string | null
          store_name: string | null
          street: string | null
          updated_at: string | null
          website: string | null
          zip: string | null
        }
        Insert: {
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          customer_classification?: string | null
          customer_type?: string | null
          dealer_id?: number | null
          description?: string | null
          distribution?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          kam_name?: string | null
          language?: string | null
          login_email?: string | null
          login_nr?: string | null
          mail_bg?: string | null
          mail_bg2?: string | null
          mail_dealer?: string | null
          mail_kam?: string | null
          mail_kam2?: string | null
          mail_sony?: string | null
          name?: string | null
          password_plain?: string | null
          phone?: string | null
          plz?: string | null
          role?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          customer_classification?: string | null
          customer_type?: string | null
          dealer_id?: number | null
          description?: string | null
          distribution?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          kam_name?: string | null
          language?: string | null
          login_email?: string | null
          login_nr?: string | null
          mail_bg?: string | null
          mail_bg2?: string | null
          mail_dealer?: string | null
          mail_kam?: string | null
          mail_kam2?: string | null
          mail_sony?: string | null
          name?: string | null
          password_plain?: string | null
          phone?: string | null
          plz?: string | null
          role?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      dealers_import: {
        Row: {
          city: string | null
          created_at: string | null
          customer_classification: string | null
          customer_type: string | null
          description: string | null
          ecot4: string | null
          email: string | null
          fax: string | null
          fivej_gv: string | null
          kam: string | null
          language: string | null
          login_nr: string | null
          name: string | null
          phone: string | null
          plz: string | null
          sds: string | null
          serp: string | null
          store_name: string | null
          street: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          customer_classification?: string | null
          customer_type?: string | null
          description?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          language?: string | null
          login_nr?: string | null
          name?: string | null
          phone?: string | null
          plz?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          customer_classification?: string | null
          customer_type?: string | null
          description?: string | null
          ecot4?: string | null
          email?: string | null
          fax?: string | null
          fivej_gv?: string | null
          kam?: string | null
          language?: string | null
          login_nr?: string | null
          name?: string | null
          phone?: string | null
          plz?: string | null
          sds?: string | null
          serp?: string | null
          store_name?: string | null
          street?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      dealers_update_staging: {
        Row: {
          contact_person: string | null
          kam_email_sony: string | null
          login_nr: string
        }
        Insert: {
          contact_person?: string | null
          kam_email_sony?: string | null
          login_nr: string
        }
        Update: {
          contact_person?: string | null
          kam_email_sony?: string | null
          login_nr?: string
        }
        Relationships: []
      }
      distributors: {
        Row: {
          active: boolean | null
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          invest_rule: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          invest_rule?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          invest_rule?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      monatsaktionen: {
        Row: {
          aktion_id: number
          beschreibung: string | null
          created_at: string | null
          end_date: string
          produkte: Json | null
          start_date: string
          titel: string
        }
        Insert: {
          aktion_id?: never
          beschreibung?: string | null
          created_at?: string | null
          end_date: string
          produkte?: Json | null
          start_date: string
          titel: string
        }
        Update: {
          aktion_id?: never
          beschreibung?: string | null
          created_at?: string | null
          end_date?: string
          produkte?: Json | null
          start_date?: string
          titel?: string
        }
        Relationships: []
      }
      product_distributors: {
        Row: {
          created_at: string | null
          distributor_id: string
          id: number
          is_primary: boolean | null
          product_id: number
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          id?: number
          is_primary?: boolean | null
          product_id: number
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          id?: number
          is_primary?: boolean | null
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_distributors_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "product_distributors_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "product_distributors_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_distributors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_distributors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_distributors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_distributors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          active_promotion: boolean | null
          active_sofortrabatt: boolean | null
          active_support: boolean | null
          basic_material: string | null
          brand: string | null
          category: string | null
          cfm: string | null
          ci_group: string | null
          comment: string | null
          contract_discount_percent: number | null
          created_at: string
          cust_mat: string | null
          customer_article_number: string | null
          dealer_invoice_price: number | null
          description: string | null
          distri: string | null
          ean: string
          extra_discount_percent: number | null
          features: Json | null
          gruppe: string | null
          image_url: string | null
          image_urls: Json | null
          long_description: string | null
          material: string | null
          min_order_quantity: number | null
          model: string | null
          normal_purchase_price: number | null
          origin: string | null
          ph2: string | null
          ph3: string | null
          ph4: string | null
          price_on_invoice: number | null
          product_description: string | null
          product_id: number
          product_image_url: string | null
          product_name: string
          promotion_amount: number | null
          promotion_conditions: string | null
          promotion_description: string | null
          promotion_end_date: string | null
          promotion_name: string | null
          promotion_start_date: string | null
          promotion_type: string | null
          retail_price: number | null
          sag_code: string | null
          sag_name: string | null
          sds_pds: string | null
          season: string | null
          short_description: string | null
          slsorg: string | null
          soa: string | null
          sofortrabatt_amount: number | null
          sofortrabatt_double_amount: number | null
          sofortrabatt_triple_amount: number | null
          sony_article: string | null
          sony_url: string | null
          specs: Json | null
          suisa: number | null
          support_on_invoice: number | null
          tactical_support: number | null
          units_per_master_carton: number | null
          units_per_palette: number | null
          updated_at: string
          vrg: number | null
          wholesale_price: number | null
        }
        Insert: {
          active?: boolean | null
          active_promotion?: boolean | null
          active_sofortrabatt?: boolean | null
          active_support?: boolean | null
          basic_material?: string | null
          brand?: string | null
          category?: string | null
          cfm?: string | null
          ci_group?: string | null
          comment?: string | null
          contract_discount_percent?: number | null
          created_at?: string
          cust_mat?: string | null
          customer_article_number?: string | null
          dealer_invoice_price?: number | null
          description?: string | null
          distri?: string | null
          ean: string
          extra_discount_percent?: number | null
          features?: Json | null
          gruppe?: string | null
          image_url?: string | null
          image_urls?: Json | null
          long_description?: string | null
          material?: string | null
          min_order_quantity?: number | null
          model?: string | null
          normal_purchase_price?: number | null
          origin?: string | null
          ph2?: string | null
          ph3?: string | null
          ph4?: string | null
          price_on_invoice?: number | null
          product_description?: string | null
          product_id?: number
          product_image_url?: string | null
          product_name: string
          promotion_amount?: number | null
          promotion_conditions?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_name?: string | null
          promotion_start_date?: string | null
          promotion_type?: string | null
          retail_price?: number | null
          sag_code?: string | null
          sag_name?: string | null
          sds_pds?: string | null
          season?: string | null
          short_description?: string | null
          slsorg?: string | null
          soa?: string | null
          sofortrabatt_amount?: number | null
          sofortrabatt_double_amount?: number | null
          sofortrabatt_triple_amount?: number | null
          sony_article?: string | null
          sony_url?: string | null
          specs?: Json | null
          suisa?: number | null
          support_on_invoice?: number | null
          tactical_support?: number | null
          units_per_master_carton?: number | null
          units_per_palette?: number | null
          updated_at?: string
          vrg?: number | null
          wholesale_price?: number | null
        }
        Update: {
          active?: boolean | null
          active_promotion?: boolean | null
          active_sofortrabatt?: boolean | null
          active_support?: boolean | null
          basic_material?: string | null
          brand?: string | null
          category?: string | null
          cfm?: string | null
          ci_group?: string | null
          comment?: string | null
          contract_discount_percent?: number | null
          created_at?: string
          cust_mat?: string | null
          customer_article_number?: string | null
          dealer_invoice_price?: number | null
          description?: string | null
          distri?: string | null
          ean?: string
          extra_discount_percent?: number | null
          features?: Json | null
          gruppe?: string | null
          image_url?: string | null
          image_urls?: Json | null
          long_description?: string | null
          material?: string | null
          min_order_quantity?: number | null
          model?: string | null
          normal_purchase_price?: number | null
          origin?: string | null
          ph2?: string | null
          ph3?: string | null
          ph4?: string | null
          price_on_invoice?: number | null
          product_description?: string | null
          product_id?: number
          product_image_url?: string | null
          product_name?: string
          promotion_amount?: number | null
          promotion_conditions?: string | null
          promotion_description?: string | null
          promotion_end_date?: string | null
          promotion_name?: string | null
          promotion_start_date?: string | null
          promotion_type?: string | null
          retail_price?: number | null
          sag_code?: string | null
          sag_name?: string | null
          sds_pds?: string | null
          season?: string | null
          short_description?: string | null
          slsorg?: string | null
          soa?: string | null
          sofortrabatt_amount?: number | null
          sofortrabatt_double_amount?: number | null
          sofortrabatt_triple_amount?: number | null
          sony_article?: string | null
          sony_url?: string | null
          specs?: Json | null
          suisa?: number | null
          support_on_invoice?: number | null
          tactical_support?: number | null
          units_per_master_carton?: number | null
          units_per_palette?: number | null
          updated_at?: string
          vrg?: number | null
          wholesale_price?: number | null
        }
        Relationships: []
      }
      products_import: {
        Row: {
          category: string | null
          comment: string | null
          contract_discount_percent: string | null
          created_at: string | null
          customer_article_number: string | null
          dealer_invoice_price: string | null
          description: string | null
          ean: string | null
          extra_discount_percent: string | null
          min_order_quantity: string | null
          model: string | null
          name: string | null
          normal_purchase_price: string | null
          origin: string | null
          price_on_invoice: string | null
          retail_price: string | null
          sds_pds: string | null
          soa: string | null
          sony_article: string | null
          suisa: string | null
          support_on_invoice: string | null
          tactical_support: string | null
          units_per_master_carton: string | null
          units_per_palette: string | null
          updated_at: string | null
          vrg: string | null
          wholesale_price: string | null
        }
        Insert: {
          category?: string | null
          comment?: string | null
          contract_discount_percent?: string | null
          created_at?: string | null
          customer_article_number?: string | null
          dealer_invoice_price?: string | null
          description?: string | null
          ean?: string | null
          extra_discount_percent?: string | null
          min_order_quantity?: string | null
          model?: string | null
          name?: string | null
          normal_purchase_price?: string | null
          origin?: string | null
          price_on_invoice?: string | null
          retail_price?: string | null
          sds_pds?: string | null
          soa?: string | null
          sony_article?: string | null
          suisa?: string | null
          support_on_invoice?: string | null
          tactical_support?: string | null
          units_per_master_carton?: string | null
          units_per_palette?: string | null
          updated_at?: string | null
          vrg?: string | null
          wholesale_price?: string | null
        }
        Update: {
          category?: string | null
          comment?: string | null
          contract_discount_percent?: string | null
          created_at?: string | null
          customer_article_number?: string | null
          dealer_invoice_price?: string | null
          description?: string | null
          ean?: string | null
          extra_discount_percent?: string | null
          min_order_quantity?: string | null
          model?: string | null
          name?: string | null
          normal_purchase_price?: string | null
          origin?: string | null
          price_on_invoice?: string | null
          retail_price?: string | null
          sds_pds?: string | null
          soa?: string | null
          sony_article?: string | null
          suisa?: string | null
          support_on_invoice?: string | null
          tactical_support?: string | null
          units_per_master_carton?: string | null
          units_per_palette?: string | null
          updated_at?: string | null
          vrg?: string | null
          wholesale_price?: string | null
        }
        Relationships: []
      }
      products_import2: {
        Row: {
          "Basic Material": string | null
          CFM: string | null
          "CI Group": string | null
          "Cust. mat.": string | null
          Distri: string | null
          EAN: number | null
          Material: string | null
          PH2: string | null
          PH3: string | null
          PH4: string | null
          "SAG Code": string | null
          "SAG Name": string | null
          Season: number | null
          SlsOrg: string | null
        }
        Insert: {
          "Basic Material"?: string | null
          CFM?: string | null
          "CI Group"?: string | null
          "Cust. mat."?: string | null
          Distri?: string | null
          EAN?: number | null
          Material?: string | null
          PH2?: string | null
          PH3?: string | null
          PH4?: string | null
          "SAG Code"?: string | null
          "SAG Name"?: string | null
          Season?: number | null
          SlsOrg?: string | null
        }
        Update: {
          "Basic Material"?: string | null
          CFM?: string | null
          "CI Group"?: string | null
          "Cust. mat."?: string | null
          Distri?: string | null
          EAN?: number | null
          Material?: string | null
          PH2?: string | null
          PH3?: string | null
          PH4?: string | null
          "SAG Code"?: string | null
          "SAG Name"?: string | null
          Season?: number | null
          SlsOrg?: string | null
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          comment: string | null
          created_at: string | null
          customer: string | null
          dealer_id: number
          end_date: string | null
          id: string
          location: string | null
          login_nr: string | null
          project_date: string | null
          project_file_url: string | null
          project_name: string | null
          project_type: string | null
          start_date: string | null
          store_name: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer?: string | null
          dealer_id: number
          end_date?: string | null
          id?: string
          location?: string | null
          login_nr?: string | null
          project_date?: string | null
          project_file_url?: string | null
          project_name?: string | null
          project_type?: string | null
          start_date?: string | null
          store_name?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer?: string | null
          dealer_id?: number
          end_date?: string | null
          id?: string
          location?: string | null
          login_nr?: string | null
          project_date?: string | null
          project_file_url?: string | null
          project_name?: string | null
          project_type?: string | null
          start_date?: string | null
          store_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotion_claims: {
        Row: {
          beleg_url: string | null
          claim_id: number
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          document_path: string | null
          document_uploaded_at: string | null
          product_id: number | null
          product_name: string | null
          promotion_name: string | null
          promotion_typ: string
          rabatt_betrag: number | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          beleg_url?: string | null
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          document_path?: string | null
          document_uploaded_at?: string | null
          product_id?: number | null
          product_name?: string | null
          promotion_name?: string | null
          promotion_typ: string
          rabatt_betrag?: number | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          beleg_url?: string | null
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          document_path?: string | null
          document_uploaded_at?: string | null
          product_id?: number | null
          product_name?: string | null
          promotion_name?: string | null
          promotion_typ?: string
          rabatt_betrag?: number | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      promotion_offers: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          discount_amount: number
          id: number
          image_url: string | null
          level: number
          product_id: number | null
          promotion_price: number | null
          title: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_amount: number
          id?: number
          image_url?: string | null
          level: number
          product_id?: number | null
          promotion_price?: number | null
          title?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number
          id?: number
          image_url?: string | null
          level?: number
          product_id?: number | null
          promotion_price?: number | null
          title?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "monthly_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "monthly_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "monthly_offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
        ]
      }
      reference_prices: {
        Row: {
          created_at: string | null
          ean: string
          price_chf: number
          ref_id: number
          source: string | null
          updated_at: string | null
          valid_from: string | null
        }
        Insert: {
          created_at?: string | null
          ean: string
          price_chf: number
          ref_id?: number
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
        }
        Update: {
          created_at?: string | null
          ean?: string
          price_chf?: number
          ref_id?: number
          source?: string | null
          updated_at?: string | null
          valid_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["ean"]
          },
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["ean"]
          },
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["ean"]
          },
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["ean"]
          },
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "promotion_claims_view"
            referencedColumns: ["ean"]
          },
          {
            foreignKeyName: "reference_prices_ean_fkey"
            columns: ["ean"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["ean"]
          },
        ]
      }
      sofortrabatt_claims: {
        Row: {
          claim_id: number
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          invoice_file_url: string | null
          products: Json | null
          promotion_id: number | null
          rabatt_betrag: number | null
          rabatt_level: number | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }
        Insert: {
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          invoice_file_url?: string | null
          products?: Json | null
          promotion_id?: number | null
          rabatt_betrag?: number | null
          rabatt_level?: number | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Update: {
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          invoice_file_url?: string | null
          products?: Json | null
          promotion_id?: number | null
          rabatt_betrag?: number | null
          rabatt_level?: number | null
          status?: string | null
          submission_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotion_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      sony_product_data: {
        Row: {
          created_at: string | null
          description: string | null
          ean: string | null
          features: Json | null
          image_url: string | null
          name: string | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ean?: string | null
          features?: Json | null
          image_url?: string | null
          name?: string | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ean?: string | null
          features?: Json | null
          image_url?: string | null
          name?: string | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      submission_items: {
        Row: {
          calc_price_on_invoice: number | null
          comment: string | null
          created_at: string | null
          datum: string | null
          distributor_id: string | null
          ean: string | null
          invest: number | null
          item_id: number
          lowest_price_brutto: number | null
          lowest_price_netto: number | null
          lowest_price_source: string | null
          lowest_price_source_custom: string | null
          marge_alt: number | null
          marge_neu: number | null
          margin_street: number | null
          menge: number | null
          netto_retail: number | null
          preis: number | null
          product_id: number | null
          product_name: string | null
          project_id: string | null
          serial: string | null
          sony_article: string | null
          submission_id: number
          updated_at: string | null
        }
        Insert: {
          calc_price_on_invoice?: number | null
          comment?: string | null
          created_at?: string | null
          datum?: string | null
          distributor_id?: string | null
          ean?: string | null
          invest?: number | null
          item_id?: number
          lowest_price_brutto?: number | null
          lowest_price_netto?: number | null
          lowest_price_source?: string | null
          lowest_price_source_custom?: string | null
          marge_alt?: number | null
          marge_neu?: number | null
          margin_street?: number | null
          menge?: number | null
          netto_retail?: number | null
          preis?: number | null
          product_id?: number | null
          product_name?: string | null
          project_id?: string | null
          serial?: string | null
          sony_article?: string | null
          submission_id: number
          updated_at?: string | null
        }
        Update: {
          calc_price_on_invoice?: number | null
          comment?: string | null
          created_at?: string | null
          datum?: string | null
          distributor_id?: string | null
          ean?: string | null
          invest?: number | null
          item_id?: number
          lowest_price_brutto?: number | null
          lowest_price_netto?: number | null
          lowest_price_source?: string | null
          lowest_price_source_custom?: string | null
          marge_alt?: number | null
          marge_neu?: number | null
          margin_street?: number | null
          menge?: number | null
          netto_retail?: number | null
          preis?: number | null
          product_id?: number | null
          product_name?: string | null
          project_id?: string | null
          serial?: string | null
          sony_article?: string | null
          submission_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_ext"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "projekt_claims_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_full"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_nextjs"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      submissions: {
        Row: {
          bestellweg: string | null
          calendar_week: number | null
          created_at: string
          custom_distributor: string | null
          customer_contact: string | null
          customer_name: string | null
          customer_number: string | null
          customer_phone: string | null
          datum: string
          dealer_id: number | null
          dealer_reference: string | null
          distributor: string | null
          kommentar: string | null
          kw: number | null
          order_comment: string | null
          order_number: string | null
          project_id: string | null
          requested_delivery: string | null
          requested_delivery_date: string | null
          sony_share: number | null
          status: string | null
          submission_id: number
          typ: Database["public"]["Enums"]["submission_type"]
          updated_at: string | null
          week_end: string | null
          week_start: string | null
        }
        Insert: {
          bestellweg?: string | null
          calendar_week?: number | null
          created_at?: string
          custom_distributor?: string | null
          customer_contact?: string | null
          customer_name?: string | null
          customer_number?: string | null
          customer_phone?: string | null
          datum?: string
          dealer_id?: number | null
          dealer_reference?: string | null
          distributor?: string | null
          kommentar?: string | null
          kw?: number | null
          order_comment?: string | null
          order_number?: string | null
          project_id?: string | null
          requested_delivery?: string | null
          requested_delivery_date?: string | null
          sony_share?: number | null
          status?: string | null
          submission_id?: number
          typ: Database["public"]["Enums"]["submission_type"]
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Update: {
          bestellweg?: string | null
          calendar_week?: number | null
          created_at?: string
          custom_distributor?: string | null
          customer_contact?: string | null
          customer_name?: string | null
          customer_number?: string | null
          customer_phone?: string | null
          datum?: string
          dealer_id?: number | null
          dealer_reference?: string | null
          distributor?: string | null
          kommentar?: string | null
          kw?: number | null
          order_comment?: string | null
          order_number?: string | null
          project_id?: string | null
          requested_delivery?: string | null
          requested_delivery_date?: string | null
          sony_share?: number | null
          status?: string | null
          submission_id?: number
          typ?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string | null
          week_end?: string | null
          week_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      support_claims: {
        Row: {
          claim_id: number
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          invoice_file_url: string | null
          produkte: Json
          status: string | null
          submission_date: string | null
          support_typ: string
          updated_at: string | null
        }
        Insert: {
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          invoice_file_url?: string | null
          produkte: Json
          status?: string | null
          submission_date?: string | null
          support_typ: string
          updated_at?: string | null
        }
        Update: {
          claim_id?: number
          comment?: string | null
          created_at?: string | null
          dealer_id?: number | null
          invoice_file_url?: string | null
          produkte?: Json
          status?: string | null
          submission_date?: string | null
          support_typ?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      support_details: {
        Row: {
          betrag: number | null
          created_at: string | null
          submission_id: number
          support_id: number
          support_typ: string | null
          updated_at: string | null
        }
        Insert: {
          betrag?: number | null
          created_at?: string | null
          submission_id: number
          support_id?: number
          support_typ?: string | null
          updated_at?: string | null
        }
        Update: {
          betrag?: number | null
          created_at?: string | null
          submission_id?: number
          support_id?: number
          support_typ?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_ext"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "projekt_claims_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_full"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_nextjs"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "support_details_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      verkaufsmeldungen: {
        Row: {
          created_at: string | null
          datum: string
          dealer_id: number
          ean: string
          id: string
          kommentar: string | null
          menge: number
          seriennummer: string | null
          sony_share: number | null
          totalumsatz: number | null
          updated_at: string | null
          verkaufspreis: number | null
        }
        Insert: {
          created_at?: string | null
          datum?: string
          dealer_id: number
          ean: string
          id?: string
          kommentar?: string | null
          menge?: number
          seriennummer?: string | null
          sony_share?: number | null
          totalumsatz?: number | null
          updated_at?: string | null
          verkaufspreis?: number | null
        }
        Update: {
          created_at?: string | null
          datum?: string
          dealer_id?: number
          ean?: string
          id?: string
          kommentar?: string | null
          menge?: number
          seriennummer?: string | null
          sony_share?: number | null
          totalumsatz?: number | null
          updated_at?: string | null
          verkaufspreis?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "verkaufsmeldungen_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "verkaufsmeldungen_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "verkaufsmeldungen_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      wichtige_infos: {
        Row: {
          created_at: string | null
          file_url: string | null
          info_id: number
          text: string | null
          titel: string
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          info_id?: never
          text?: string | null
          titel: string
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          info_id?: never
          text?: string | null
          titel?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard: {
        Row: {
          bestellweg: string | null
          calc_price_on_invoice: number | null
          calendar_week: number | null
          created_at: string | null
          customer_contact: string | null
          customer_name: string | null
          customer_phone: string | null
          dealer_city: string | null
          dealer_contact: string | null
          dealer_country: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_language: string | null
          dealer_login_nr: string | null
          dealer_name: string | null
          dealer_phone: string | null
          dealer_plz: string | null
          dealer_reference: string | null
          dealer_store: string | null
          dealer_zip: string | null
          distributor_code: string | null
          distributor_email: string | null
          distributor_id: string | null
          distributor_name: string | null
          ean: string | null
          invest: number | null
          item_comment: string | null
          item_created_at: string | null
          item_id: number | null
          item_updated_at: string | null
          kam_email: string | null
          kam_email_2: string | null
          kam_email_sony: string | null
          kam_name: string | null
          kommentar: string | null
          lowest_price_brutto: number | null
          lowest_price_netto: number | null
          lowest_price_source: string | null
          lowest_price_source_custom: string | null
          mail_bg: string | null
          mail_bg2: string | null
          mail_dealer: string | null
          marge_alt: number | null
          marge_neu: number | null
          margin_street: number | null
          menge: number | null
          netto_retail: number | null
          order_number: string | null
          preis: number | null
          product_id: number | null
          product_name: string | null
          project_id: string | null
          requested_delivery: string | null
          requested_delivery_date: string | null
          serial: string | null
          sony_share: number | null
          status: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_id"]
          },
          {
            foreignKeyName: "submission_items_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      bestellung_dashboard: {
        Row: {
          bestellweg: string | null
          brand: string | null
          calc_price_on_invoice: number | null
          category: string | null
          created_at: string | null
          dealer_city: string | null
          dealer_contact_person: string | null
          dealer_country: string | null
          dealer_email: string | null
          dealer_invoice_price: number | null
          dealer_language: string | null
          dealer_login_nr: string | null
          dealer_name: string | null
          dealer_phone: string | null
          dealer_reference: string | null
          dealer_street: string | null
          dealer_zip: string | null
          distributor_code: string | null
          distributor_email: string | null
          distributor_id: string | null
          distributor_name: string | null
          ean: string | null
          gruppe: string | null
          invest: number | null
          invest_calc: number | null
          item_id: number | null
          kam_email: string | null
          kam_email_2: string | null
          kam_email_sony: string | null
          kam_name: string | null
          lowest_price_brutto: number | null
          lowest_price_source: string | null
          lowest_price_source_custom: string | null
          mail_bg: string | null
          mail_bg2: string | null
          mail_dealer: string | null
          marge_alt: number | null
          marge_neu: number | null
          menge: number | null
          netto_retail: number | null
          order_number: string | null
          poi_alt: number | null
          poi_neu: number | null
          preis: number | null
          price_on_invoice: number | null
          product_id: number | null
          product_name: string | null
          project_id: string | null
          retail_price: number | null
          status: string | null
          submission_id: number | null
          suisa: number | null
          support_on_invoice: number | null
          tactical_support: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
          vrg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      bestellungen_view: {
        Row: {
          created_at: string | null
          customer_contact: string | null
          customer_name: string | null
          customer_number: string | null
          customer_phone: string | null
          dealer_city: string | null
          dealer_company: string | null
          dealer_country: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_name: string | null
          dealer_phone: string | null
          dealer_reference: string | null
          dealer_street: string | null
          dealer_zip: string | null
          kam: string | null
          kam_email: string | null
          kam_name: string | null
          order_comment: string | null
          requested_delivery: string | null
          requested_delivery_date: string | null
          status: string | null
          submission_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      bestellungen_view_ext: {
        Row: {
          bestellweg: string | null
          created_at: string | null
          custom_distributor: string | null
          dealer_city: string | null
          dealer_contact_person: string | null
          dealer_country: string | null
          dealer_email: string | null
          dealer_language: string | null
          dealer_name: string | null
          dealer_nr: string | null
          dealer_phone: string | null
          dealer_reference: string | null
          dealer_street: string | null
          dealer_zip: string | null
          kam_email: string | null
          kam_email_sony: string | null
          kam_name: string | null
          mail_bg: string | null
          mail_bg2: string | null
          mail_dealer: string | null
          mail_sony: string | null
          main_distributor: string | null
          order_comment: string | null
          order_number: string | null
          project_id: string | null
          status: string | null
          submission_id: number | null
          submission_items: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["main_distributor"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["main_distributor"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["main_distributor"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["main_distributor"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["project_id"]
          },
        ]
      }
      bestellungen_view_flat: {
        Row: {
          bestellweg: string | null
          calc_price_on_invoice: number | null
          created_at: string | null
          custom_distributor: string | null
          dealer_city: string | null
          dealer_company: string | null
          dealer_contact_person: string | null
          dealer_country: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_login_nr: string | null
          dealer_name: string | null
          dealer_phone: string | null
          dealer_reference: string | null
          distributor: string | null
          distributor_code: string | null
          distributor_email: string | null
          distributor_id: string | null
          distributor_name: string | null
          ean: string | null
          invest: number | null
          item_id: number | null
          kam: string | null
          kam_email_sony: string | null
          kam_name: string | null
          kommentar: string | null
          mail_bg: string | null
          mail_bg2: string | null
          mail_kam: string | null
          mail_kam2: string | null
          marge_alt: number | null
          marge_neu: number | null
          menge: number | null
          netto_retail: number | null
          order_comment: string | null
          order_number: string | null
          preis: number | null
          product_id: number | null
          product_name: string | null
          requested_delivery: string | null
          requested_delivery_date: string | null
          status: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["code"]
          },
        ]
      }
      cashback_claims_view: {
        Row: {
          cashback_betrag: number | null
          cashback_type: string | null
          claim_id: number | null
          created_at: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_name: string | null
          document_path: string | null
          document_path_sb: string | null
          seriennummer: string | null
          seriennummer_sb: string | null
          soundbar_ean: string | null
          status: string | null
          submission_id: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_ext"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "projekt_claims_view"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_full"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_submission_history_nextjs"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "cashback_claims_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "view_project_overview"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      product_view: {
        Row: {
          active_sofortrabatt: boolean | null
          allowed_distributors: string | null
          brand: string | null
          category: string | null
          dealer_invoice_price: number | null
          distri: string | null
          ean: string | null
          gruppe: string | null
          ph2: string | null
          product_description: string | null
          product_id: number | null
          product_name: string | null
          retail_price: number | null
          sony_article: string | null
        }
        Relationships: []
      }
      products_with_sofortrabatt: {
        Row: {
          active_sofortrabatt: boolean | null
          basic_material: string | null
          category: string | null
          cfm: string | null
          ci_group: string | null
          cust_mat: string | null
          distri: string | null
          ean: string | null
          material: string | null
          name: string | null
          ph2: string | null
          ph3: string | null
          ph4: string | null
          product_id: number | null
          sag_code: string | null
          sag_name: string | null
          season: string | null
          slsorg: string | null
          sofortrabatt_amount: number | null
          sofortrabatt_double_amount: number | null
          sofortrabatt_triple_amount: number | null
          sony_article: string | null
        }
        Insert: {
          active_sofortrabatt?: boolean | null
          basic_material?: string | null
          category?: string | null
          cfm?: string | null
          ci_group?: string | null
          cust_mat?: string | null
          distri?: string | null
          ean?: string | null
          material?: string | null
          name?: string | null
          ph2?: string | null
          ph3?: string | null
          ph4?: string | null
          product_id?: number | null
          sag_code?: string | null
          sag_name?: string | null
          season?: string | null
          slsorg?: string | null
          sofortrabatt_amount?: number | null
          sofortrabatt_double_amount?: number | null
          sofortrabatt_triple_amount?: number | null
          sony_article?: string | null
        }
        Update: {
          active_sofortrabatt?: boolean | null
          basic_material?: string | null
          category?: string | null
          cfm?: string | null
          ci_group?: string | null
          cust_mat?: string | null
          distri?: string | null
          ean?: string | null
          material?: string | null
          name?: string | null
          ph2?: string | null
          ph3?: string | null
          ph4?: string | null
          product_id?: number | null
          sag_code?: string | null
          sag_name?: string | null
          season?: string | null
          slsorg?: string | null
          sofortrabatt_amount?: number | null
          sofortrabatt_double_amount?: number | null
          sofortrabatt_triple_amount?: number | null
          sony_article?: string | null
        }
        Relationships: []
      }
      projekt_claims_view: {
        Row: {
          created_at: string | null
          dealer_id: number | null
          dealer_name: string | null
          kommentar: string | null
          product_list: string | null
          produkte: Json | null
          status: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      promotion_claims_view: {
        Row: {
          beleg_url: string | null
          claim_id: number | null
          comment: string | null
          created_at: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_name: string | null
          document_path: string | null
          ean: string | null
          product_id: number | null
          product_name: string | null
          promotion_amount: number | null
          promotion_name: string | null
          promotion_type: string | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "fk_promotion_claims_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "promotion_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      sofortrabatt_claims_pending: {
        Row: {
          claim_id: number | null
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          dealer_name: string | null
          invoice_file_url: string | null
          product_list: string | null
          products: Json | null
          rabatt_betrag: number | null
          rabatt_level: number | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      sofortrabatt_claims_view: {
        Row: {
          claim_id: number | null
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          dealer_name: string | null
          invoice_file_url: string | null
          product_list: string | null
          products: Json | null
          rabatt_betrag: number | null
          rabatt_level: number | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "sofortrabatt_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      support_claims_view: {
        Row: {
          claim_id: number | null
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          dealer_name: string | null
          invoice_file_url: string | null
          product_list: string | null
          status: string | null
          support_typ: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "support_claims_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      v_products_with_images: {
        Row: {
          brand: string | null
          category: string | null
          contract_discount_percent: number | null
          dealer_invoice_price: number | null
          ean: string | null
          extra_discount_percent: number | null
          gruppe: string | null
          model: string | null
          normal_purchase_price: number | null
          price_on_invoice: number | null
          product_description: string | null
          product_id: number | null
          product_image_url: string | null
          product_name: string | null
          retail_price: number | null
          sku: string | null
          sony_description: string | null
          sony_image_url: string | null
          sony_updated_at: string | null
          support_on_invoice: number | null
          tactical_support: number | null
          wholesale_price: number | null
        }
        Relationships: []
      }
      v_recent_activity_all: {
        Row: {
          betrag: number | null
          created_at: string | null
          dealer_id: number | null
          id: number | null
          pdf_url: string | null
          reference: string | null
          status: string | null
          title: string | null
          typ: string | null
        }
        Relationships: []
      }
      v_submission_history: {
        Row: {
          bestellweg: string | null
          datum: string | null
          ean: string | null
          kommentar: string | null
          kw: number | null
          login_nr: string | null
          menge: number | null
          preis: number | null
          produktname: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
        }
        Relationships: []
      }
      v_submission_history_full: {
        Row: {
          bestellweg: string | null
          brand: string | null
          created_at: string | null
          datum: string | null
          dealer_id: number | null
          dealer_name: string | null
          ean: string | null
          gruppe: string | null
          item_id: number | null
          kommentar: string | null
          kw: number | null
          login_nr: string | null
          menge: number | null
          model: string | null
          preis: number | null
          product_id: number | null
          product_name: string | null
          status: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      v_submission_history_nextjs: {
        Row: {
          bestellweg: string | null
          brand: string | null
          created_at: string | null
          datum: string | null
          dealer_id: number | null
          ean: string | null
          gruppe: string | null
          kommentar: string | null
          kw: number | null
          menge: number | null
          preis: number | null
          product_id: number | null
          produktname: string | null
          submission_id: number | null
          typ: Database["public"]["Enums"]["submission_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_view"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_with_sofortrabatt"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submission_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_products_with_images"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["dealer_id"]
          },
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "verkaufsreport_view"
            referencedColumns: ["dealer_id"]
          },
        ]
      }
      verkaufsreport_view: {
        Row: {
          anzahl_meldungen: number | null
          avg_preis: number | null
          avg_sony_share: number | null
          city: string | null
          dealer_id: number | null
          erster_verkauf: string | null
          gesamtumsatz: number | null
          haendler_email: string | null
          haendlername: string | null
          kam_name: string | null
          language: string | null
          letzter_verkauf: string | null
          mail_bg: string | null
          mail_kam: string | null
          mail_sony: string | null
          plz: string | null
          sony_umsatz: number | null
          sony_umsatzanteil_prozent: number | null
          store_name: string | null
          total_stueck: number | null
        }
        Relationships: []
      }
      view_project_overview: {
        Row: {
          bestellweg: string | null
          comment: string | null
          custom_distributor: string | null
          customer: string | null
          dealer_email: string | null
          dealer_id: number | null
          dealer_name: string | null
          dealer_phone: string | null
          distributor: string | null
          distributor_email: string | null
          ean: string | null
          end_date: string | null
          location: string | null
          login_nr: string | null
          mail_kam: string | null
          price: number | null
          product_name: string | null
          project_created: string | null
          project_date: string | null
          project_id: string | null
          project_name: string | null
          project_type: string | null
          project_updated: string | null
          quantity: number | null
          start_date: string | null
          status: string | null
          store_name: string | null
          submission_comment: string | null
          submission_created: string | null
          submission_id: number | null
          submission_type: Database["public"]["Enums"]["submission_type"] | null
          submission_updated: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "admin_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellung_dashboard"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "bestellungen_view_flat"
            referencedColumns: ["distributor_code"]
          },
          {
            foreignKeyName: "submissions_distributor_fkey"
            columns: ["distributor"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Functions: {
      get_pending_sofortrabatt_claims: {
        Args: never
        Returns: {
          claim_id: number | null
          comment: string | null
          created_at: string | null
          dealer_id: number | null
          dealer_name: string | null
          invoice_file_url: string | null
          product_list: string | null
          products: Json | null
          rabatt_betrag: number | null
          rabatt_level: number | null
          status: string | null
          submission_date: string | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "sofortrabatt_claims_view"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      jwt_login_nr: { Args: never; Returns: string }
      jwt_role: { Args: never; Returns: string }
    }
    Enums: {
      submission_type:
        | "verkauf"
        | "projekt"
        | "bestellung"
        | "support"
        | "cashback"
        | "order"
        | "project"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      submission_type: [
        "verkauf",
        "projekt",
        "bestellung",
        "support",
        "cashback",
        "order",
        "project",
      ],
    },
  },
} as const
