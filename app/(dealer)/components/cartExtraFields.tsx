"use client";

import { Input } from "@/components/ui/input";

export function CartExtraFields({ mode, extra, theme }: any) {
  // VERKAUF: Share + KW
  if (mode === "verkauf") {
    return (
      <div className="border-t pt-4 space-y-3">
        <div className="flex gap-4">
          <Input
            type="number"
            placeholder="Inhouse Share (%)"
            value={extra.inhouseShare ?? ""}
            onChange={(e) => extra.set("inhouseShare", +e.target.value)}
            className="w-28 text-center"
          />
          <Input
            type="number"
            placeholder="Kalenderwoche"
            value={extra.calendarWeek ?? ""}
            onChange={(e) => extra.set("calendarWeek", +e.target.value)}
            className="w-28 text-center"
          />
        </div>
      </div>
    );
  }

  // SOFORTRABATT: Rechnung upload
  if (mode === "sofortrabatt") {
    return (
      <div className="border-t pt-4 space-y-3">
        <label className="block text-sm">Rechnung hochladen (PDF oder Bild)</label>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => extra.set("invoice", e.target.files?.[0] || null)}
        />
      </div>
    );
  }

  return null;
}
