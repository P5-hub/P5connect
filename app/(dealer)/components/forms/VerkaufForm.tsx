"use client";

import { useState, useMemo } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardVerkauf from "@/app/(dealer)/components/ProductCardVerkauf";
import UnifiedCart from "@/app/(dealer)/components/cart/UnifiedCart";

import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type CsvRow = {
  ean: string;
  product_name: string;
  quantity: number;
  stock_quantity: number;
  price: number;
  date?: string;
  stock_date?: string;
  comment?: string;
};

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

function getTodayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function num(value: any): number {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const cleaned = String(value)
    .trim()
    .replace("CHF", "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getField(row: any, aliases: string[]): any {
  if (!row || typeof row !== "object") return undefined;

  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null) {
      return row[alias];
    }
  }

  const keys = Object.keys(row);

  for (const alias of aliases) {
    const foundKey = keys.find(
      (key) =>
        key.trim().toLowerCase() === alias.trim().toLowerCase()
    );

    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }

  return undefined;
}

function normalizeEan(value: any): string {
  if (value === null || value === undefined || value === "") return "";

  if (typeof value === "number") {
    return value.toFixed(0);
  }

  let s = String(value).trim();

  if (s.includes("e") || s.includes("E")) {
    const n = Number(s);
    if (Number.isFinite(n)) {
      return n.toFixed(0);
    }
  }

  if (s.endsWith(".0")) {
    s = s.slice(0, -2);
  }

  return s;
}

function normalizeDate(value: any): string {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed) {
      const yyyy = String(parsed.y).padStart(4, "0");
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const s = String(value).trim();

  if (!s) return "";

  if (/^\d+(\.\d+)?$/.test(s)) {
    const parsed = XLSX.SSF.parse_date_code(Number(s));

    if (parsed) {
      const yyyy = String(parsed.y).padStart(4, "0");
      const mm = String(parsed.m).padStart(2, "0");
      const dd = String(parsed.d).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    }
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }

  if (s.includes(".")) {
    const parts = s.split(".");

    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2].slice(0, 4));

      if (
        Number.isFinite(day) &&
        Number.isFinite(month) &&
        Number.isFinite(year)
      ) {
        return `${String(year).padStart(4, "0")}-${String(month).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
      }
    }
  }

  const parsed = new Date(s);

  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return s;
}

function getCurrentIsoCalendarWeek(): number {
  const d = new Date();
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}

function getLastCalendarWeek(): number {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - 7);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}

function getCalendarWeekFromDate(dateStr: string): number | null {
  if (!dateStr) return null;

  let date: Date | null = null;

  if (dateStr.includes(".")) {
    const parts = dateStr.split(".");

    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);

      date = new Date(Date.UTC(year, month, day));
    }
  }

  if (!date && dateStr.includes("-")) {
    const parsed = new Date(dateStr);

    if (!isNaN(parsed.getTime())) {
      date = new Date(
        Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
      );
    }
  }

  if (!date || isNaN(date.getTime())) return null;

  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

  return Math.ceil(
    (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function VerkaufForm() {
  const { dealer, loading } = useActiveDealer();
  const { t } = useI18n();

  const [step, setStep] = useState<"choose" | "manual" | "upload">("choose");

  const [cart, setCart] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState<CsvRow[]>([]);

  const [calendarWeek, setCalendarWeek] = useState<number>(getLastCalendarWeek());
  const [inhouseQtyShare, setInhouseQtyShare] = useState<number>(50);
  const [inhouseRevenueShare, setInhouseRevenueShare] = useState<number>(50);
  const [confirmSonyShareCsv, setConfirmSonyShareCsv] = useState(false);

  /* ------------------------------------------------------------------ */
  /* CSV / XLSX PARSER */
  /* ------------------------------------------------------------------ */

  const normalizeRows = (data: any[]): CsvRow[] =>
    data
      .map((r) => {
        const rawDate = getField(r, ["Datum", "date", "Verkaufsdatum"]);
        const rawStockDate = getField(r, [
          "Lagerdatum",
          "Stockdatum",
          "stock_date",
          "stockDate",
        ]);

        const date = normalizeDate(rawDate);
        const stockDate =
          normalizeDate(rawStockDate) ||
          date ||
          getTodayIsoDate();

        return {
          ean: normalizeEan(getField(r, ["EAN", "ean"])),

          product_name: String(
            getField(r, [
              "Produktname",
              "Produkt",
              "product_name",
              "product",
              "Modell",
              "Artikel",
              "sony_article",
              "SonyArtikel",
            ]) ?? ""
          ).trim(),

          quantity: num(
            getField(r, ["Menge", "quantity", "Anzahl", "Verkauf", "Verkauft"])
          ),

          stock_quantity: num(
            getField(r, [
              "Lagerbestand",
              "Lager",
              "Stock",
              "stock",
              "stock_quantity",
              "stockQuantity",
            ])
          ),

          price: num(
            getField(r, [
              "Verkaufspreis",
              "Preis",
              "price",
              "VK",
              "Retail",
              "Zwischensumme",
            ])
          ),

          date,
          stock_date: stockDate,

          comment: String(
            getField(r, ["Kommentar", "Kommentar_Item", "comment"]) ?? ""
          ),
        };
      })
      .filter((r) => r.ean || r.product_name);

  const parseFile = async (file: File) => {
    try {
      if (file.name.toLowerCase().endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            const normalized = normalizeRows(res.data as any[]);

            setRows(normalized);
            setConfirmSonyShareCsv(false);

            const firstDate =
              normalized.find((r) => r.date)?.date ||
              normalized.find((r) => r.stock_date)?.stock_date;

            const kw = firstDate ? getCalendarWeekFromDate(firstDate) : null;

            if (kw) {
              setCalendarWeek(kw);
            }
          },
          error: () => {
            toast.error(t("sales.page.fileReadError"));
          },
        });

        return;
      }

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {
        type: "array",
        cellDates: true,
      });

      const ws = wb.Sheets[wb.SheetNames[0]];

      const data = XLSX.utils.sheet_to_json(ws, {
        raw: true,
        defval: "",
      });

      const normalized = normalizeRows(data as any[]);

      setRows(normalized);
      setConfirmSonyShareCsv(false);

      const firstDate =
        normalized.find((r) => r.date)?.date ||
        normalized.find((r) => r.stock_date)?.stock_date;

      const kw = firstDate ? getCalendarWeekFromDate(firstDate) : null;

      if (kw) {
        setCalendarWeek(kw);
      }
    } catch {
      toast.error(t("sales.page.fileReadError"));
    }
  };

  /* ------------------------------------------------------------------ */
  /* BERECHNUNGEN */
  /* ------------------------------------------------------------------ */

  const sonyQty = useMemo(
    () => rows.reduce((s, r) => s + Number(r.quantity || 0), 0),
    [rows]
  );

  const stockTotal = useMemo(
    () => rows.reduce((s, r) => s + Number(r.stock_quantity || 0), 0),
    [rows]
  );

  const sonyRevenue = useMemo(
    () =>
      rows.reduce(
        (s, r) => s + Number(r.quantity || 0) * Number(r.price || 0),
        0
      ),
    [rows]
  );

  const totalQty = inhouseQtyShare > 0 ? sonyQty / (inhouseQtyShare / 100) : 0;

  const totalRevenue =
    inhouseRevenueShare > 0 ? sonyRevenue / (inhouseRevenueShare / 100) : 0;

  /* ------------------------------------------------------------------ */
  /* SUBMIT CSV */
  /* ------------------------------------------------------------------ */

  const submitCsvSales = async () => {
    if (!confirmSonyShareCsv) {
      toast.error(t("sales.errors.confirmSonyShare"));
      return;
    }

    try {
      if (!dealer?.dealer_id) {
        toast.error(t("sales.errors.dealerNotFound"));
        return;
      }

      const res = await fetch("/api/verkauf/csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          calendar_week: calendarWeek,
          inhouse_share_qty: inhouseQtyShare,
          inhouse_share_revenue: inhouseRevenueShare,
          sony_qty: sonyQty,
          sony_revenue: sonyRevenue,
          total_qty: totalQty,
          total_revenue: totalRevenue,
          stock_total: stockTotal,
          rows,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("sales.page.saveError"));
      }

      toast.success(t("sales.page.success"));

      setRows([]);
      setConfirmSonyShareCsv(false);
      setStep("choose");
    } catch (err: any) {
      toast.error(err?.message || t("sales.page.submitError"));
    }
  };

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */

  if (loading) return <p>{t("sales.loading.dealerData")}</p>;

  if (!dealer) {
    return <p className="text-red-500">{t("sales.errors.dealerNotFound")}</p>;
  }

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {step === "choose" && (
          <motion.div key="choose">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-5 rounded-xl">
                <h2 className="font-semibold mb-2">
                  {t("sales.page.manualTitle")}
                </h2>

                <Button
                  onClick={() => {
                    setCalendarWeek(getCurrentIsoCalendarWeek());
                    setStep("manual");
                  }}
                >
                  {t("sales.page.next")}
                </Button>
              </div>

              <div className="border p-5 rounded-xl">
                <h2 className="font-semibold mb-2">
                  {t("sales.page.uploadTitle")}
                </h2>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const r = await fetch("/api/csv-template");
                      const b = await r.blob();
                      const url = URL.createObjectURL(b);
                      const a = document.createElement("a");

                      a.href = url;
                      a.download = "verkauf_template.csv";
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t("sales.page.template")}
                  </Button>

                  <Button onClick={() => setStep("upload")}>
                    {t("sales.page.next")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "manual" && (
          <motion.div key="manual">
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("sales.page.back")}
            </Button>

            <ProductList
              CardComponent={ProductCardVerkauf}
              cardProps={{
                onReportSale: (i: any) => {
                  setCart((p) => [...p, i]);
                },
              }}
            />

            <UnifiedCart
              mode="verkauf"
              cart={cart}
              setCart={setCart}
              open={open}
              setOpen={setOpen}
              onSuccess={() => setCart([])}
              extra={{
                calendarWeek,
                sony_share_qty: inhouseQtyShare,
                sony_share_revenue: inhouseRevenueShare,
              }}
            />
          </motion.div>
        )}

        {step === "upload" && (
          <motion.div key="upload">
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("sales.page.back")}
            </Button>

            <div className="mt-6 space-y-4">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => e.target.files && parseFile(e.target.files[0])}
              />

              {rows.length > 0 && (
                <>
                  <table className="w-full border text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.ean")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.product")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.quantity")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.stockQuantity")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.price")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.date")}
                        </th>
                        <th className="text-left px-2 py-1">
                          {t("sales.upload.fileTable.stockDate")}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td className="text-left px-2 py-1">{r.ean}</td>
                          <td className="text-left px-2 py-1">
                            {r.product_name}
                          </td>
                          <td className="text-left px-2 py-1">{r.quantity}</td>
                          <td className="text-left px-2 py-1">
                            {r.stock_quantity}
                          </td>
                          <td className="text-left px-2 py-1">{r.price}</td>
                          <td className="text-left px-2 py-1">{r.date}</td>
                          <td className="text-left px-2 py-1">
                            {r.stock_date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        {t("sales.upload.calendarWeek")}
                      </label>

                      <Input
                        type="number"
                        min={1}
                        max={53}
                        value={calendarWeek}
                        onChange={(e) => setCalendarWeek(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        {t("sales.upload.sonyShareQty")}
                      </label>

                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={inhouseQtyShare}
                        onChange={(e) =>
                          setInhouseQtyShare(Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        {t("sales.upload.sonyShareRevenue")}
                      </label>

                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={inhouseRevenueShare}
                        onChange={(e) =>
                          setInhouseRevenueShare(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>

                  <div className="border rounded p-4 text-sm">
                    <p>
                      {t("sales.upload.sonyQty")}: {sonyQty}
                    </p>

                    <p>{t("sales.upload.reportedStock")}: {stockTotal}</p>

                    <p>
                      {t("sales.upload.totalQty")}: {Math.round(totalQty)}
                    </p>

                    <p>
                      {t("sales.upload.sonyRevenue")}: CHF{" "}
                      {sonyRevenue.toFixed(2)}
                    </p>

                    <p>
                      {t("sales.upload.totalRevenue")}: CHF{" "}
                      {totalRevenue.toFixed(2)}
                    </p>
                  </div>

                  <div className="border-t pt-3">
                    <label className="flex items-start gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmSonyShareCsv}
                        onChange={(e) =>
                          setConfirmSonyShareCsv(e.target.checked)
                        }
                        className="mt-0.5"
                      />

                      <span>{t("sales.upload.confirmSonyShare")}</span>
                    </label>
                  </div>

                  <Button
                    className="bg-green-600 text-white"
                    disabled={!confirmSonyShareCsv}
                    onClick={submitCsvSales}
                  >
                    {t("sales.page.submit")}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}