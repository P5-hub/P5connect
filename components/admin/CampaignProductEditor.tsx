"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, RotateCcw, Trash2 } from "lucide-react";

export type PricingMode = "standard" | "messe" | "display" | "mixed";

export type ProductOption = {
  product_id: number;
  product_name: string;
  brand: string | null;
  ean: string;
  category?: string | null;
  gruppe?: string | null;
};

export type CampaignProductRow = {
  local_id?: string;
  product_id: string;
  active: boolean;
  pricing_mode: PricingMode;
  messe_price_netto: string;
  display_discount_percent: string;
  display_price_netto: string;
  bonus_relevant: boolean;
  max_qty_per_dealer: string;
  max_total_qty_per_dealer: string;
  max_display_qty_per_dealer: string;
  max_messe_qty_per_dealer: string;
  notes: string;
};

type ProductFilterState = {
  search: string;
  brand: string;
  category: string;
};

type Props = {
  products: ProductOption[];
  rows: CampaignProductRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: keyof CampaignProductRow,
    value: string | boolean
  ) => void;
  title?: string;
};

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

export default function CampaignProductEditor({
  products,
  rows,
  onAdd,
  onRemove,
  onUpdate,
  title = "Produkte",
}: Props) {
  const [filters, setFilters] = useState<Record<number, ProductFilterState>>({});

  const allBrands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((p) => (p.brand || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "de"));
  }, [products]);

  const allCategories = useMemo(() => {
    return Array.from(
      new Set(
        products
          .flatMap((p) => [p.category || "", p.gruppe || ""])
          .map((v) => v.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "de"));
  }, [products]);

  const getFilter = (index: number): ProductFilterState => {
    return (
      filters[index] || {
        search: "",
        brand: "",
        category: "",
      }
    );
  };

  const updateFilter = (
    index: number,
    field: keyof ProductFilterState,
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [index]: {
        ...getFilter(index),
        [field]: value,
      },
    }));
  };

  const resetFilter = (index: number) => {
    setFilters((prev) => ({
      ...prev,
      [index]: {
        search: "",
        brand: "",
        category: "",
      },
    }));
  };

  const getFilteredProducts = (index: number) => {
    const filter = getFilter(index);
    const q = normalize(filter.search);
    const brand = normalize(filter.brand);
    const category = normalize(filter.category);

    return products.filter((p) => {
      const matchesSearch =
        !q ||
        [
          p.product_name,
          p.brand,
          p.ean,
          p.category,
          p.gruppe,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesBrand = !brand || normalize(p.brand) === brand;

      const matchesCategory =
        !category ||
        normalize(p.category) === category ||
        normalize(p.gruppe) === category;

      return matchesSearch && matchesBrand && matchesCategory;
    });
  };

  return (
    <Card className="p-5 rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <Button variant="outline" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Produkt hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((row, index) => {
          const filter = getFilter(index);
          const filteredProducts = getFilteredProducts(index);

          return (
            <div
              key={row.local_id || `${row.product_id}-${index}`}
              className="rounded-xl border border-gray-200 p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="font-medium text-sm text-gray-900">
                  Produkt {index + 1}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => onRemove(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Suche
                  </label>
                  <Input
                    value={filter.search}
                    onChange={(e) =>
                      updateFilter(index, "search", e.target.value)
                    }
                    placeholder="Name, Marke, EAN..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Marke
                  </label>
                  <select
                    value={filter.brand}
                    onChange={(e) =>
                      updateFilter(index, "brand", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Alle Marken</option>
                    {allBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Kategorie / Gruppe
                  </label>
                  <select
                    value={filter.category}
                    onChange={(e) =>
                      updateFilter(index, "category", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Alle Kategorien</option>
                    {allCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => resetFilter(index)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Filter zurücksetzen
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="xl:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">
                    Produkt *
                  </label>
                  <select
                    value={row.product_id}
                    onChange={(e) =>
                      onUpdate(index, "product_id", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Bitte wählen...</option>
                    {filteredProducts.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                        {p.brand ? ` | ${p.brand}` : ""}
                        {p.category ? ` | ${p.category}` : ""}
                        {p.gruppe ? ` | ${p.gruppe}` : ""}
                        {` | ${p.ean}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {filteredProducts.length} passende Produkte
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Pricing Mode
                  </label>
                  <select
                    value={row.pricing_mode}
                    onChange={(e) =>
                      onUpdate(index, "pricing_mode", e.target.value)
                    }
                    className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="standard">standard</option>
                    <option value="messe">messe</option>
                    <option value="display">display</option>
                    <option value="mixed">mixed</option>
                  </select>
                </div>

                <div className="flex items-end gap-5">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.active}
                      onChange={(e) =>
                        onUpdate(index, "active", e.target.checked)
                      }
                    />
                    Aktiv
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.bonus_relevant}
                      onChange={(e) =>
                        onUpdate(index, "bonus_relevant", e.target.checked)
                      }
                    />
                    Bonus relevant
                  </label>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Messepreis netto
                  </label>
                  <Input
                    value={row.messe_price_netto}
                    onChange={(e) =>
                      onUpdate(index, "messe_price_netto", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Display Rabatt %
                  </label>
                  <Input
                    value={row.display_discount_percent}
                    onChange={(e) =>
                      onUpdate(index, "display_discount_percent", e.target.value)
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Displaypreis netto
                  </label>
                  <Input
                    value={row.display_price_netto}
                    onChange={(e) =>
                      onUpdate(index, "display_price_netto", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Qty / Dealer
                  </label>
                  <Input
                    value={row.max_qty_per_dealer}
                    onChange={(e) =>
                      onUpdate(index, "max_qty_per_dealer", e.target.value)
                    }
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Total Qty / Dealer
                  </label>
                  <Input
                    value={row.max_total_qty_per_dealer}
                    onChange={(e) =>
                      onUpdate(index, "max_total_qty_per_dealer", e.target.value)
                    }
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Display Qty / Dealer
                  </label>
                  <Input
                    value={row.max_display_qty_per_dealer}
                    onChange={(e) =>
                      onUpdate(index, "max_display_qty_per_dealer", e.target.value)
                    }
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Max Messe Qty / Dealer
                  </label>
                  <Input
                    value={row.max_messe_qty_per_dealer}
                    onChange={(e) =>
                      onUpdate(index, "max_messe_qty_per_dealer", e.target.value)
                    }
                    placeholder="3"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-4">
                  <label className="block text-sm text-gray-700 mb-1">
                    Notiz
                  </label>
                  <Input
                    value={row.notes}
                    onChange={(e) => onUpdate(index, "notes", e.target.value)}
                    placeholder="Interne Bemerkung"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}