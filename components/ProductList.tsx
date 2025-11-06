"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/Product";
import { createClient } from "@/utils/supabase/client";
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
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/I18nProvider";
import ProductCardSupportCost from "@/components/ProductCardSupportCost";

type SortKey = "sony_article_asc" | "sony_article_desc" | "price_asc" | "price_desc";

type Props<T extends { product: Product }> = {
  CardComponent: React.ComponentType<T>;
  cardProps?: Omit<T, "product">;
  sofortrabattOnly?: boolean;
  onCSVImport?: (items: any[]) => void;
  showCSVButton?: boolean;
  supportType?: "sellout" | "werbung" | "event" | "sonstiges"| "aktion";
  customProducts?: any[]; // ✅ erlaubt das direkte Übergeben eigener Produktlisten (z. B. Aktionen)

};

export default function ProductList<T extends { product: Product }>({
  CardComponent,
  cardProps,
  sofortrabattOnly,
  onCSVImport,
  showCSVButton = false,
  supportType = "sellout",
  customProducts, // ✅ hier ergänzen
}: Props<T>) {
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gruppe, setGruppe] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("sony_article_asc");
  const [openGruppe, setOpenGruppe] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  /** 🟢 Wenn customProducts übergeben wurden, direkt rendern */
  if (customProducts && customProducts.length > 0) {
    const handleAddToCart = (item: any) => {
      if (typeof (cardProps as any)?.onAddToCart === "function") {
        (cardProps as any).onAddToCart(item);
      }
    };

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customProducts.map((p, index) => (
          <CardComponent
            key={index}
            product={p}
            {...(cardProps as any)}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    );
  }


  /** 🟡 Early return: Wenn kein Sell-Out, zeige nur Support-Cost-Card */
  if (supportType !== "sellout") {
    const handleAddToCart = (item: any) => {
      if (typeof (cardProps as any)?.onAddToCart === "function") {
        (cardProps as any).onAddToCart(item);
      }
    };

    return (
      <div className="max-w-lg">
        <ProductCardSupportCost onAddToCart={handleAddToCart} />
      </div>
    );
  }

  /** 🔹 Produkte nur bei Sell-Out laden */
  useEffect(() => {
    if (supportType !== "sellout") return;

    (async () => {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(`
          product_id,
          ean,
          product_name,
          sony_article,
          brand,
          gruppe,
          category,
          retail_price,
          dealer_invoice_price,
          product_description,
          active_sofortrabatt,
          ph2
        `);

      if (sofortrabattOnly) query = query.eq("active_sofortrabatt", true);

      const { data, error } = await query;

      console.log("🟢 Supabase products query:", { error, dataCount: data?.length, data });

      if (error) {
        console.error("❌ Fehler beim Laden der Produkte:", error.message || error);
      } else if (data) {
        setProducts(
          data.map((p: any) => ({
            ...p,
            name: p.product_name ?? p.sony_article ?? "Unbekannt",
          }))
        );
      } else {
        console.warn("⚠️ Keine Produktdaten erhalten!");
      }

      setLoading(false);

    })();
  }, [sofortrabattOnly, supabase, supportType]);

  /** 🔹 CSV Upload Handler */
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[];
        if (!rows.length) {
          toast.error(t("product.csv.nodata"));
          setUploading(false);
          return;
        }

        const findKey = (obj: any, keys: string[]) =>
          Object.keys(obj).find((k) =>
            keys.some((x) => k.toLowerCase().includes(x.toLowerCase()))
          );

        const newItems = rows
          .map((row) => {
            const eanKey = findKey(row, ["ean", "barcode", "artikel"]);
            const qtyKey = findKey(row, ["menge", "qty", "anzahl"]);
            const priceKey = findKey(row, ["preis", "amount", "value"]);
            const nameKey = findKey(row, ["produkt", "modell", "bezeichnung"]);
            const serialKey = findKey(row, ["serien", "sn"]);

            return {
              ean: eanKey ? row[eanKey] ?? "" : "",
              quantity: qtyKey ? parseInt(row[qtyKey]) || 1 : 1,
              price: priceKey ? parseFloat(row[priceKey]) || undefined : undefined,
              product_name: nameKey ? row[nameKey] ?? "" : "",
              serial: serialKey ? row[serialKey] ?? "" : "",
            };

          })
          .filter((r) => r.ean);

        if (!newItems.length) {
          toast.error(t("product.csv.novalid"));
          setUploading(false);
          return;
        }

        onCSVImport?.(newItems);
        toast.success(t("product.csv.success", { count: newItems.length }));
        if (fileInputRef.current) fileInputRef.current.value = "";
        setUploading(false);
      },
      error: () => {
        toast.error(t("product.csv.error"));
        setUploading(false);
      },
    });
  };

  /** 🔹 Filter & Sortierung vorbereiten */
  const gruppen = Array.from(new Set(products.map((p) => p.gruppe).filter(Boolean)));
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const filtered = products
    .filter(
      (p) =>
        (p.sony_article?.toLowerCase().includes(search.toLowerCase()) ||
          p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.ean?.toLowerCase().includes(search.toLowerCase())) &&
        (gruppe ? p.gruppe === gruppe : true) &&
        (category ? p.category === category : true)
    )
    .sort((a, b) => {
      if (a.ph2 === "TME" && b.ph2 !== "TME") return -1;
      if (a.ph2 !== "TME" && b.ph2 === "TME") return 1;

      switch (sort) {
        case "sony_article_asc":
          return (a.sony_article || "").localeCompare(b.sony_article || "");
        case "sony_article_desc":
          return (b.sony_article || "").localeCompare(a.sony_article || "");
        case "price_asc":
          return (a.retail_price ?? 0) - (b.retail_price ?? 0);
        case "price_desc":
          return (b.retail_price ?? 0) - (a.retail_price ?? 0);
        default:
          return 0;
      }
    });

  /** 🔹 Reset Handler */
  const resetFilters = () => {
    setSearch("");
    setGruppe(null);
    setCategory(null);
    setSort("sony_article_asc");
  };

  /** 🔹 AddToCart-Wrapper */
  const handleAddToCart = (item: any) => {
    if (typeof (cardProps as any)?.onAddToCart === "function") {
      (cardProps as any).onAddToCart(item);
    } else {
      console.warn("⚠️ Kein onAddToCart-Handler definiert!");
    }
  };

  /** 🔸 Render Sell-Out Liste */
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="sticky top-[96px] z-20 flex flex-wrap items-center gap-4 bg-white dark:bg-gray-900 p-4 shadow-sm border rounded-xl">
        {showCSVButton && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVUpload}
              disabled={uploading}
            />
            <Button
              variant="outline"
              className="border-green-600 text-green-700 hover:bg-green-50"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? t("product.csv.loading") : t("product.csv.upload")}
            </Button>
          </>
        )}

        <Input
          placeholder={t("product.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Gruppenfilter */}
        <Popover open={openGruppe} onOpenChange={setOpenGruppe}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-[180px] justify-between">
              {gruppe || t("product.groups.all")}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder={t("product.groups.search")} />
              <CommandList>
                <CommandEmpty>{t("product.groups.empty")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem key="all" onSelect={() => setGruppe(null)}>
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
            <Button variant="outline" role="combobox" className="w-[180px] justify-between">
              {category || t("product.categories.all")}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder={t("product.categories.search")} />
              <CommandList>
                <CommandEmpty>{t("product.categories.empty")}</CommandEmpty>
                <CommandGroup>
                  <CommandItem key="all" onSelect={() => setCategory(null)}>
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

        <Button variant="outline" onClick={resetFilters}>
          {t("product.reset")}
        </Button>
      </div>

      {/* Produktgrid */}
      {loading ? (
        <p className="text-gray-500">{t("product.loading")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <CardComponent
              key={p.product_id}
              product={p}
              {...(cardProps as any)}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
