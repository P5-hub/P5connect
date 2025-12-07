"use client";

import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

export function CartItemUI({ mode, item, index, setCart, removeItem, theme }: any) {
  const update = (field: string, value: any) =>
    setCart((prev: any[]) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );

  return (
    <div className="border rounded-xl p-3 space-y-2 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">
            {item.product_name || item.sony_article}
          </p>
          {item.ean && (
            <p className="text-xs text-gray-500">EAN: {item.ean}</p>
          )}
        </div>

        <button
          onClick={() => removeItem(index)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* FIELDS JE MODE */}
      {mode === "bestellung" && (
        <Input
          type="number"
          min={1}
          value={item.quantity ?? 1}
          onChange={(e) => update("quantity", Math.max(1, +e.target.value))}
          className="text-center"
        />
      )}

      {mode === "verkauf" && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => update("quantity", Math.max(1, +e.target.value))}
          />

          <Input
            type="number"
            value={item.price ?? ""}
            onChange={(e) => update("price", Math.max(0, +e.target.value))}
          />

          <Input
            type="date"
            value={item.date ?? new Date().toISOString().split("T")[0]}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
      )}

      {mode === "projekt" && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => update("quantity", Math.max(1, +e.target.value))}
          />
          <Input
            type="number"
            value={item.price ?? ""}
            onChange={(e) => update("price", Math.max(0, +e.target.value))}
          />
        </div>
      )}

      {mode === "support" && (
        <div className="grid grid-cols-2 gap-2 text-center">
          <Input
            type="number"
            value={item.supportbetrag ?? ""}
            onChange={(e) =>
              update("supportbetrag", Math.max(0, +e.target.value))
            }
          />
          <Input
            value={item.comment ?? ""}
            onChange={(e) => update("comment", e.target.value)}
          />
        </div>
      )}

      {mode === "sofortrabatt" && (
        <>
          <p className={`${theme.color} font-semibold`}>
            Rabatt: {item.rabatt || item.sofortrabatt_amount} CHF
          </p>

          <Input
            type="text"
            placeholder="Seriennummer"
            value={item.seriennummer ?? ""}
            onChange={(e) => update("seriennummer", e.target.value)}
          />
        </>
      )}
    </div>
  );
}
