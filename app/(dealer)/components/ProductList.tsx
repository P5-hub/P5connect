"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/Product";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { ChevronsUpDown } from "lucide-react";
import Papa from "papaparse";
import { useI18n } from "@/lib/i18n/I18nProvider";

import ProductCardSupportCost from "@/app/(dealer)/components/ProductCardSupportCost";

/* --------------------------------------------------------------------
   ProductList: GENERISCHER TYP
   Jede Karte gibt selbst vor, welche Props sie braucht.
-------------------------------------------------------------------- */

export type ProductListProps<T extends { product: Product }> = {
  CardComponent: ComponentType<T>;
  cardProps?: Omit<T, "product">;
  sofortrabattOnly?: boolean;
  onCSVImport?: (items: any[]) => void;
  showCSVButton?: boolean;
  supportType?: "sellout" | "werbung" | "event" | "sonstiges" | "aktion";
  customProducts?: any[];
};

/* --------------------------------------------------------------------
   Sortierschlüssel
-------------------------------------------------------------------- */

type SortKey =
  | "sony_article_asc"
  | "sony_article_desc"
  | "price_asc"
  | "price_desc";

/* --------------------------------------------------------------------
   COMPONENT
-------------------------------------------------------------------- */

export default function ProductList<T extends { product: Product }>({
  CardComponent,
  cardProps = {} as Omit<T, "product">,
  sofortrabattOnly = false,
  onCSVImport,
  showCSVButton = false,
  supportType = "sellout",
  customProducts,
}: ProductListProps<T>) {
  const { t } = useI18n();
  const supabase = createClient();

  const effectiveSupportType = supportType ?? "sellout";

  /* Lokale States */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gruppe, setGruppe] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("sony_article_asc");

  const [openGruppe, setOpenGruppe] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);

  /* CSV Upload */
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ====================================================================
     1) CUSTOM PRODUCTS (z. B. Aktionen)
  ==================================================================== */

  if (customProducts?.length) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customProducts.map((p, i) => (
          <CardComponent key={i} {...({ product: p, ...cardProps } as T)} />
        ))}
      </div>
    );
  }

  /* ====================================================================
     2) SUPPORT MODE → Spezialkarte
  ==================================================================== */

  if (effectiveSupportType !== "sellout") {
    return (
      <div className="max-w-lg">
        <ProductCardSupportCost
          // SupportCard nutzt immer onAddToCart
          onAddToCart={(cardProps as any)?.onAddToCart ?? (() => {})}
        />
      </div>
    );
  }

  /* ====================================================================
     3) SUPABASE PRODUKTE LADEN
  ==================================================================== */

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let query = supabase.from("products").select(`
        product_id,
        ean,
        product_name,
        sony_article,
        brand,
        gruppe,
        category,
        retail_price,
        dealer_invoice_price,
        active_sofortrabatt,
        ph2
      `);

      if (sofortrabattOnly) {
        query = query.eq("active_sofortrabatt", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase Error:", error.message);
        setLoading(false);
        return;
      }

      setProducts(
        (data ?? []).map((p: any) => ({
          ...p,
          name: p.product_name || p.sony_article || "Unbekannt",
        }))
      );

      setLoading(false);
    };

    load();
  }, [effectiveSupportType, sofortrabattOnly, supabase]);

  /* ====================================================================
     CSV IMPORT
  ==================================================================== */

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const items = results.data.map((row: any) => ({
          ean: row.ean || "",
          quantity: parseInt(row.menge) || 1,
          price: parseFloat(row.preis) || undefined,
        }));

        onCSVImport?.(items);
        setUploading(false);
      },
    });
  };

  /* ====================================================================
     FILTERS & SORTING
  ==================================================================== */

  const gruppen = Array.from(new Set(products.map((p) => p.gruppe).filter(Boolean)));
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  const sortWithinBlock = (a: Product, b: Product) => {
    switch (sort) {
      case "sony_article_asc":
        return (a.sony_article ?? "").localeCompare(b.sony_article ?? "");
      case "sony_article_desc":
        return (b.sony_article ?? "").localeCompare(a.sony_article ?? "");
      case "price_asc":
        return (a.retail_price ?? 0) - (b.retail_price ?? 0);
      case "price_desc":
        return (b.retail_price ?? 0) - (a.retail_price ?? 0);
      default:
        return 0;
    }
  };

  const filtered = products
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        (!s ||
          p.product_name?.toLowerCase().includes(s) ||
          p.sony_article?.toLowerCase().includes(s) ||
          p.ean?.toLowerCase().includes(s)) &&
        (!gruppe || p.gruppe === gruppe) &&
        (!category || p.category === category)
      );
    })
    .sort((a, b) => {
      const aTV = a.ph2 === "TME";
      const bTV = b.ph2 === "TME";
      if (aTV && !bTV) return -1;
      if (!aTV && bTV) return 1;
      return sortWithinBlock(a, b);
    });

  /* ====================================================================
     RENDER
  ==================================================================== */

  return (
    <div className="space-y-6">
      {/* FILTERBAR */}
      <div className="sticky top-[96px] bg-white dark:bg-gray-900 p-4 border rounded-xl flex flex-wrap gap-4 z-20">
        <Input
          placeholder={t("product.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Gruppenfilter */}
        <Popover open={openGruppe} onOpenChange={setOpenGruppe}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {gruppe || t("product.groups.all")}
              <ChevronsUpDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder={t("product.groups.search")} />
              <CommandList>
                <CommandEmpty>{t("product.groups.empty")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => setGruppe(null)}>
                    {t("product.groups.all")}
                  </CommandItem>

                  {gruppen.map((g) => (
                    <CommandItem key={g} onSelect={() => setGruppe(g)}>
                      {g}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Kategorienfilter */}
        <Popover open={openCategory} onOpenChange={setOpenCategory}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {category || t("product.categories.all")}
              <ChevronsUpDown className="w-4 h-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder={t("product.categories.search")} />
              <CommandList>
                <CommandEmpty>{t("product.categories.empty")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => setCategory(null)}>
                    {t("product.categories.all")}
                  </CommandItem>
                  {categories.map((c) => (
                    <CommandItem key={c} onSelect={() => setCategory(c)}>
                      {c}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Reset */}
        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setGruppe(null);
            setCategory(null);
            setSort("sony_article_asc");
          }}
        >
          {t("product.reset")}
        </Button>

        {/* CSV-Import */}
        {showCSVButton && (
          <>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="hidden"
              onChange={handleCSV}
            />
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? t("product.csvUploading") : t("product.csvImport")}
            </Button>
          </>
        )}
      </div>

      {/* PRODUKTGRID */}
      {loading ? (
        <p className="text-gray-500">{t("product.loading")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <CardComponent
              key={p.product_id}
              {...({ product: p, ...cardProps } as T)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
