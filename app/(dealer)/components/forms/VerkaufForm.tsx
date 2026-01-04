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

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type CsvRow = {
  ean: string;
  product_name: string;
  quantity: number;
  price: number;
  seriennummer?: string;
  date?: string;
  comment?: string;
};

/* ------------------------------------------------------------------ */
function getCurrentIsoCalendarWeek(): number {
  const d = new Date();
  const date = new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  ));

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

  // Fall 1: deutsches Format DD.MM.YYYY
  if (dateStr.includes(".")) {
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);
      date = new Date(Date.UTC(year, month, day));
    }
  }

  // Fall 2: ISO-Format YYYY-MM-DD
  if (!date && dateStr.includes("-")) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      date = new Date(
        Date.UTC(
          parsed.getFullYear(),
          parsed.getMonth(),
          parsed.getDate()
        )
      );
    }
  }

  if (!date || isNaN(date.getTime())) return null;

  // ISO-Kalenderwoche
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(
    (((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7
  );
}


export default function VerkaufForm() {
  const { dealer, loading } = useActiveDealer();

  const [step, setStep] = useState<"choose" | "manual" | "upload">("choose");

  /* ---------------- MANUELL ---------------- */

  const [cart, setCart] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  /* ---------------- CSV ---------------- */

  const [rows, setRows] = useState<CsvRow[]>([]);

  // ✅ Erweiterung: letzte abgeschlossene KW
  const [calendarWeek, setCalendarWeek] = useState<number>(
    getLastCalendarWeek()
  );

  // ❗ bewusst number lassen (damit Manual NICHT kaputt geht)
  const [inhouseQtyShare, setInhouseQtyShare] = useState<number>(50);
  const [inhouseRevenueShare, setInhouseRevenueShare] = useState<number>(50);
  // CSV Bestätigung (Stufe 3)
  const [confirmSonyShareCsv, setConfirmSonyShareCsv] = useState(false);

  /* ------------------------------------------------------------------ */
  /* CSV PARSER */
  /* ------------------------------------------------------------------ */

  const parseFile = async (file: File) => {
    const normalize = (data: any[]): CsvRow[] =>
      data.map((r) => ({
        ean: String(r.EAN ?? r.ean ?? ""),
        product_name: String(r.Produktname ?? r.product_name ?? ""),
        quantity: Number(r.Menge ?? r.quantity ?? 0),
        price: Number(r.Verkaufspreis ?? r.price ?? 0),
        seriennummer: r.Seriennummer ?? "",
        date: r.Datum ?? "",
        comment: r.Kommentar ?? "",
      }));

    try {
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (res) => {
            const normalized = normalize(res.data as any[]);
            setRows(normalized);
            setConfirmSonyShareCsv(false);


            // ⬇️⬇️⬇️ SCHRITT 2: HIER ⬇️⬇️⬇️
            const firstDate = normalized.find(r => r.date)?.date;
            const kw = firstDate
              ? getCalendarWeekFromDate(firstDate)
              : null;


            if (kw) {
              setCalendarWeek(kw);
            }
          },

        });
      } else {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const normalized = normalize(data as any[]);
        setRows(normalized);
        setConfirmSonyShareCsv(false);


        // ⬇️⬇️⬇️ SCHRITT 2: HIER ⬇️⬇️⬇️
        const firstDate = normalized.find(r => r.date)?.date;
        const kw = firstDate
          ? getCalendarWeekFromDate(firstDate)
          : null;


        if (kw) {
          setCalendarWeek(kw);
        }

      }
    } catch {
      toast.error("Fehler beim Lesen der Datei");
    }
  };

  /* ------------------------------------------------------------------ */
  /* BERECHNUNGEN */
  /* ------------------------------------------------------------------ */

  const sonyQty = useMemo(
    () => rows.reduce((s, r) => s + r.quantity, 0),
    [rows]
  );

  const sonyRevenue = useMemo(
    () => rows.reduce((s, r) => s + r.quantity * r.price, 0),
    [rows]
  );

  const totalQty =
    inhouseQtyShare > 0 ? sonyQty / (inhouseQtyShare / 100) : 0;

  const totalRevenue =
    inhouseRevenueShare > 0
      ? sonyRevenue / (inhouseRevenueShare / 100)
      : 0;

  /* ------------------------------------------------------------------ */
  /* SUBMIT CSV */
  /* ------------------------------------------------------------------ */

  const submitCsvSales = async () => {
    // ✅ Erweiterung: bewusste Bestätigung erzwingen
    if (
      inhouseQtyShare <= 0 ||
      inhouseRevenueShare <= 0
    ) {
      toast.error(
        "Bitte bestätigen Sie den SONY-Anteil für Stück und Umsatz."
      );
      return;
    }


    try {
      if (!dealer?.dealer_id) {
        toast.error("Händler nicht gefunden.");
        return;
      }

      const res = await fetch("/api/verkauf/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          calendar_week: calendarWeek,
          inhouse_share_qty: inhouseQtyShare,
          inhouse_share_revenue: inhouseRevenueShare,
          sony_qty: sonyQty,
          sony_revenue: sonyRevenue,
          total_qty: totalQty,
          total_revenue: totalRevenue,
          rows,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Speichern");
      }

      toast.success("Verkaufsdaten erfolgreich gemeldet");

      setRows([]);
      setStep("choose");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Melden");
    }
  };

  /* ------------------------------------------------------------------ */

  if (loading) return <p>⏳ Händlerdaten werden geladen…</p>;
  if (!dealer) return <p className="text-red-500">Händler nicht gefunden</p>;

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {/* ================= STEP CHOOSE ================= */}

        {step === "choose" && (
          <motion.div key="choose">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border p-5 rounded-xl">
                <h2 className="font-semibold mb-2">Manuell melden</h2>
                <Button
                  onClick={() => {
                    setCalendarWeek(getCurrentIsoCalendarWeek());
                    setStep("manual");
                  }}
                >
                  Weiter
                </Button>

              </div>

              <div className="border p-5 rounded-xl">
                <h2 className="font-semibold mb-2">CSV / Excel Upload</h2>
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
                    CSV-Vorlage
                  </Button>

                  <Button onClick={() => setStep("upload")}>Weiter</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STEP MANUAL ================= */}

        {step === "manual" && (
          <motion.div key="manual">
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
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

        {/* ================= STEP UPLOAD ================= */}

        {step === "upload" && (
          <motion.div key="upload">
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </Button>

            <div className="mt-6 space-y-4">
              <Input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) =>
                  e.target.files && parseFile(e.target.files[0])
                }
              />

              {rows.length > 0 && (
                <>
                  <table className="w-full border text-sm">
                    <thead>
                      <tr>
                        <th>EAN</th>
                        <th>Produkt</th>
                        <th>Menge</th>
                        <th>Preis</th>
                        <th>Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td>{r.ean}</td>
                          <td>{r.product_name}</td>
                          <td>{r.quantity}</td>
                          <td>{r.price}</td>
                          <td>{r.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Kalenderwoche
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={53}
                        value={calendarWeek}
                        onChange={(e) =>
                          setCalendarWeek(Number(e.target.value))
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        SONY Anteil Stück (%)
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
                        SONY Anteil Umsatz (%)
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
                    <p>Sony Stückzahl: {sonyQty}</p>
                    <p>Gesamtstückzahl Händler: {Math.round(totalQty)}</p>
                    <p>Sony Umsatz: CHF {sonyRevenue.toFixed(2)}</p>
                    <p>
                      Gesamtumsatz Händler: CHF {totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="border-t pt-3">
                    <label className="flex items-start gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={confirmSonyShareCsv}
                        onChange={(e) => setConfirmSonyShareCsv(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        Ich bestätige, dass die gemeldeten <b>SONY-Anteile (Stück & Umsatz)</b>
                        den tatsächlichen Verkaufsverhältnissen dieser Kalenderwoche entsprechen.
                      </span>
                    </label>
                  </div>

                  <Button
                    className="bg-green-600 text-white"
                    disabled={!confirmSonyShareCsv}
                    onClick={submitCsvSales}
                  >
                    Verkaufsdaten melden
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
