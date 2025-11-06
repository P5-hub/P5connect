"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Filter, RefreshCcw } from "lucide-react";
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
import Papa from "papaparse";
import { toast } from "sonner";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { Product } from "@/types/Product";
import ProductCardVerkauf from "@/components/ProductCardVerkauf";

export default function ProductListVerkauf({
  onReportSale,
}: {
  onReportSale: (item: any) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [sort, setSort] = useState("sony_article-asc");
  const [groups, setGroups] = useState<string[]>([]);
  const [openGroup, setOpenGroup] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  // 🔹 Produkte laden
  useEffect(() => {
    (async () => {
      setLoading(true);
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase.from("products").select("*").limit(200);
      if (error) {
        console.error(error);
        toast.error("Fehler beim Laden der Produkte");
        return;
      }

      const uniqueGroups = Array.from(
        new Set(
          data.map((p) => p.gruppe || p.category || (p as any).product_group).filter(Boolean)
        )
      );
      setGroups(uniqueGroups);
      setProducts(
        data.map((p: any) => ({
          ...p,
          product_id: String(p.product_id),
        }))
      );
      setLoading(false);
    })();
  }, []);

  // 🔹 Filter + Suche kombinieren
  const filteredProducts = products
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        (!search ||
          p.product_name?.toLowerCase().includes(s) ||
          p.sony_article?.toLowerCase().includes(s) ||
          p.ean?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s)) &&
        (!groupFilter ||
          p.gruppe === groupFilter ||
          p.category === groupFilter ||
          (p as any).product_group === groupFilter)
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case "sony_article-asc":
          return (a.sony_article || "").localeCompare(b.sony_article || "");
        case "sony_article-desc":
          return (b.sony_article || "").localeCompare(a.sony_article || "");
        case "price-asc":
          return (a.retail_price ?? 0) - (b.retail_price ?? 0);
        case "price-desc":
          return (b.retail_price ?? 0) - (a.retail_price ?? 0);
        default:
          return 0;
      }
    });

  // 🔹 CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result: any) => {
        const rows = result.data;
        let count = 0;

        rows.forEach((row: any) => {
          const produkt = products.find(
            (p) =>
              p.product_name?.toLowerCase() === row.sony_article?.toLowerCase() ||
              p.sony_article?.toLowerCase() === row.sony_article?.toLowerCase() ||
              p.ean === row.ean
          );
          if (produkt) {
            onReportSale({
              ...produkt,
              quantity: parseInt(row.menge) || 1,
              price: row.preis ? parseFloat(row.preis) : undefined,
              serial: row.seriennummer || "",
              date: row.datum || new Date().toISOString().split("T")[0],
            });
            count++;
          }
        });

        toast.success(`✅ ${count} Verkäufe aus CSV übernommen`);
      },
    });
  };

  return (
    <div className="space-y-6 pb-20 relative z-0">
      {/* Sticky Filterbar unterhalb der Navigation */}
      <div
        className="sticky top-[96px] z-20 flex flex-wrap items-center gap-4 
                   bg-white dark:bg-gray-900 p-4 shadow-sm border rounded-xl"
      >
        <Input
          placeholder="🔍 Suche nach Artikel, Name oder EAN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />

        {/* Gruppenfilter */}
        <Popover open={openGroup} onOpenChange={setOpenGroup}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-[180px] justify-between">
              <Filter className="w-4 h-4 opacity-60 text-green-600" />
              {groupFilter || "Alle Gruppen"}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Suche Gruppe..." />
              <CommandList>
                <CommandEmpty>Keine Gruppe gefunden.</CommandEmpty>
                <CommandGroup>
                  <CommandItem key="all" onSelect={() => setGroupFilter(null)}>
                    Alle Gruppen
                  </CommandItem>
                  {groups.map((g) => (
                    <CommandItem key={g} onSelect={() => setGroupFilter(g)}>
                      {g}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Sortierung */}
        <Popover open={openSort} onOpenChange={setOpenSort}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" className="w-[180px] justify-between">
              Sortierung
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Sortieren..." />
              <CommandList>
                <CommandGroup>
                  <CommandItem onSelect={() => setSort("sony_article-asc")}>
                    Artikel A-Z
                  </CommandItem>
                  <CommandItem onSelect={() => setSort("sony_article-desc")}>
                    Artikel Z-A
                  </CommandItem>
                  <CommandItem onSelect={() => setSort("price-asc")}>
                    Preis aufsteigend
                  </CommandItem>
                  <CommandItem onSelect={() => setSort("price-desc")}>
                    Preis absteigend
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Reset */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setSearch("");
            setGroupFilter(null);
            setSort("sony_article-asc");
          }}
        >
          <RefreshCcw className="w-4 h-4 text-green-600" />
        </Button>

        {/* CSV Upload */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-gray-600 font-medium">📂 CSV</label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="cursor-pointer text-xs"
          />
        </div>
      </div>

      {/* ⬇️ Abstand unterhalb der Sticky-Leiste */}
      <div className="h-4" />

      {/* Produktliste */}
      {loading ? (
        <p className="text-gray-500 p-4">⏳ Lade Produkte...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-gray-500 p-4">⚠️ Keine Produkte gefunden.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCardVerkauf
              key={p.product_id}
              product={p}
              onReportSale={(item) => onReportSale(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
