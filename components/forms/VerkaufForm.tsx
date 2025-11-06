"use client";
import CartVerkauf from "@/components/CartVerkauf";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { FileUp, Download, FileX, ArrowLeft } from "lucide-react";
import ProductList from "@/components/ProductList";
import ProductCardVerkauf from "@/components/ProductCardVerkauf";

export default function VerkaufForm() {
  const dealer = useDealer();
  const [step, setStep] = useState<"choose" | "manual" | "upload">("choose");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [unknownEANs, setUnknownEANs] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // 🔹 Pflichtfeld Inhouse-Share + Kalenderwoche
  const [sonyShare, setSonyShare] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  });

  // 🔹 Datei-Spaltenmapping
  const mapColumns = (header: string[]) => {
    const norm = (s: string) => s.toLowerCase().replace(/\s|_|-/g, "");
    const idx = (keys: string[]) =>
      header.findIndex((h) => keys.some((k) => norm(h).includes(k)));
    return {
      ean: idx(["ean", "barcode", "gtin"]),
      menge: idx(["menge", "qty", "anzahl"]),
      price: idx(["preis", "verkaufspreis", "amount"]),
      serial: idx(["seriennummer", "serial", "sn"]),
      date: idx(["datum", "date"]),
      comment: idx(["kommentar", "note"]),
    };
  };

  const normalizeDate = (input: string | null | undefined): string | null => {
    if (!input) return null;
    const s = String(input).trim();
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (iso.test(s)) return s;
    const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return null;
  };

  // 🔹 Produktnamen anhand EAN abrufen
  const fetchProductNames = async (items: any[]) => {
    try {
      const eans = [...new Set(items.map((i) => i.ean).filter(Boolean))];
      if (eans.length === 0) return items;

      const res = await fetch(`/api/products/by-eans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eans }),
      });

      if (!res.ok) {
        console.warn("⚠️ Produktnamen konnten nicht geladen werden");
        return items.map((i) => ({ ...i, product_name: "Unbekannt" }));
      }

      const data = await res.json();
      const productMap = Object.fromEntries(data.map((p: any) => [p.ean, p.product_name]));
      return items.map((i) => ({
        ...i,
        product_name: productMap[i.ean] || "Unbekannt",
      }));
    } catch (err) {
      console.error("Fehler beim Laden der Produktnamen:", err);
      return items.map((i) => ({ ...i, product_name: "Unbekannt" }));
    }
  };

  // 🔹 Datei einlesen (CSV/Excel)
  const parseFile = async (file: File) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith(".xlsx") || name.endsWith(".xls");

    try {
      let rows: any[] = [];
      let unknown: string[] = [];

      if (isExcel) {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });
        const header = (json[0] as string[]).map((h) => String(h || "").trim());
        const map = mapColumns(header);

        for (let i = 1; i < json.length; i++) {
          const row = json[i] as any[];
          if (!row) continue;
          const get = (idx: number) => (idx >= 0 ? row[idx] : "");
          const ean = String(get(map.ean) || "").replace(/\D/g, "");
          if (!ean) continue;
          const menge = parseInt(String(get(map.menge) || "1"), 10);
          const price = parseFloat(String(get(map.price) || "0").replace(",", "."));
          const serial = String(get(map.serial) || "").trim();
          const date = normalizeDate(String(get(map.date) || ""));
          const comment = String(get(map.comment) || "").trim();
          if (!/^\d{7,14}$/.test(ean)) unknown.push(ean);
          else rows.push({ ean, menge, price, serial, date, comment });
        }
      } else {
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (res) => {
              const header = res.meta.fields || Object.keys(res.data[0] || {});
              const map = mapColumns(header);
              for (const r of res.data as any[]) {
                const get = (idx: number) =>
                  idx >= 0 ? r[header[idx] as keyof typeof r] : "";
                const ean = String(get(map.ean) || "").replace(/\D/g, "");
                if (!ean) continue;
                const menge = parseInt(String(get(map.menge) || "1"), 10);
                const price = parseFloat(String(get(map.price) || "0").replace(",", "."));
                const serial = String(get(map.serial) || "").trim();
                const date = normalizeDate(String(get(map.date) || ""));
                const comment = String(get(map.comment) || "").trim();
                if (!/^\d{7,14}$/.test(ean)) unknown.push(ean);
                else rows.push({ ean, menge, price, serial, date, comment });
              }
              resolve();
            },
            error: reject,
          });
        });
      }

      const rowsWithNames = await fetchProductNames(rows);
      setPreviewRows(rowsWithNames);
      setUnknownEANs(unknown);
      toast.success(`${rowsWithNames.length} Zeilen erkannt (${unknown.length} ignoriert)`);
    } catch (e: any) {
      console.error(e);
      toast.error("Fehler beim Lesen der Datei");
    }
  };

  // 🔹 Upload (für CSV & Warenkorb)
  const uploadData = async (rowsToUpload: any[]) => {
    if (rowsToUpload.length === 0) {
      toast.error("Keine Daten zum Hochladen gefunden.");
      return;
    }

    if (sonyShare === null || isNaN(sonyShare)) {
      toast.error("Bitte geben Sie den Inhouse-Share ein.");
      return;
    }

    setUploading(true);
    try {
      const res = await fetch("/api/verkauf-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealer_id: dealer?.dealer_id,
          items: rowsToUpload,
          sony_share: sonyShare,
          calendar_week: selectedWeek,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload fehlgeschlagen");
      }

      const result = await res.json();
      toast.success(`✅ ${result.inserted} Verkaufszeilen erfolgreich gespeichert.`);
      setPreviewRows([]);
      setCart([]);
      // 🔁 Reset Inhouse Share nach Upload
      setSonyShare(null);
    } catch (err: any) {
      console.error("❌ Upload-Fehler:", err);
      toast.error(err.message || "Fehler beim Upload");
    } finally {
      setUploading(false);
    }

    
  };

  if (!dealer) return <p>⏳ Händlerdaten werden geladen…</p>;

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {/* STEP 1 - Auswahl */}
        {step === "choose" && (
          <motion.div key="choose" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-2">Manuell melden</h2>
                <Button onClick={() => setStep("manual")}>Weiter</Button>
              </div>
              <div className="border rounded-xl p-5">
                <h2 className="text-lg font-semibold mb-2">CSV / Excel Upload</h2>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const res = await fetch("/api/csv-template");
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
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

        {/* STEP 2 - Manuell */}
        {step === "manual" && (
          <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between mb-3">
              <Button variant="outline" onClick={() => setStep("choose")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </div>

            <ProductList
              CardComponent={ProductCardVerkauf}
              cardProps={{ onReportSale: (item: any) => setCart((prev) => [...prev, item]) }}
            />
          </motion.div>
        )}

        {/* STEP 3 - CSV Upload */}
        {step === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between mb-3">
              <Button variant="outline" onClick={() => setStep("choose")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreviewRows([]);
                    toast.message("CSV geleert");
                  }}
                >
                  <FileX className="w-4 h-4 mr-2" /> CSV leeren
                </Button>
              </div>
            </div>

            {/* 🔹 Inhouse-Share + Kalenderwoche */}
            <div className="flex flex-wrap items-center gap-4 border border-gray-200 rounded-xl p-4 bg-gray-50 mb-6">
              <div className="flex flex-col">
                <label htmlFor="sonyShare" className="text-sm font-semibold mb-1">
                  Inhouse-Share (%)
                </label>
                <input
                  id="sonyShare"
                  type="number"
                  value={sonyShare ?? ""}
                  onChange={(e) => setSonyShare(Number(e.target.value))}
                  className="w-28 border rounded-md px-3 py-1 text-right font-medium"
                  min={0}
                  max={100}
                  required
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="kw" className="text-sm font-semibold mb-1">
                  Kalenderwoche
                </label>
                <input
                  id="kw"
                  type="number"
                  min={1}
                  max={53}
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(Number(e.target.value))}
                  className="w-28 border rounded-md px-3 py-1 text-center font-medium"
                />
              </div>

              <div className="text-gray-600 text-sm italic">
                Gilt automatisch für alle Datensätze im Upload.
              </div>
            </div>

            {/* Drag & Drop */}
            <div
              onDragEnter={() => setDragActive(true)}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) parseFile(f);
                setDragActive(false);
              }}
              className={`border-2 border-dashed rounded-xl p-8 text-center ${
                dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
              }`}
            >
              <FileUp className="w-8 h-8 mx-auto mb-2" />
              <p>Datei hierher ziehen oder auswählen</p>
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                id="fileInput"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    parseFile(f);
                    e.target.value = ""; // 🔁 Reset für zweiten Upload
                  }
                }}
              />
              <label htmlFor="fileInput" className="text-blue-600 underline cursor-pointer">
                Datei wählen
              </label>
            </div>

            {/* Vorschau */}
            {previewRows.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">
                  Vorschau ({previewRows.length} Zeilen)
                </h3>

                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
                  <table className="min-w-full text-sm text-gray-800">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold">Produktname</th>
                        <th className="text-left px-4 py-2 font-semibold">EAN</th>
                        <th className="text-right px-4 py-2 font-semibold">Menge</th>
                        <th className="text-right px-4 py-2 font-semibold">Preis</th>
                        <th className="text-left px-4 py-2 font-semibold">Seriennummer</th>
                        <th className="text-center px-4 py-2 font-semibold">Datum</th>
                        <th className="text-left px-4 py-2 font-semibold">Kommentar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2">{r.product_name}</td>
                          <td className="px-4 py-2">{r.ean}</td>
                          <td className="px-4 py-2 text-right">{r.menge}</td>
                          <td className="px-4 py-2 text-right">
                            {r.price?.toLocaleString("de-CH")}
                          </td>
                          <td className="px-4 py-2">{r.serial}</td>
                          <td className="px-4 py-2 text-center">{r.date || "-"}</td>
                          <td className="px-4 py-2">{r.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    disabled={uploading}
                    onClick={() => uploadData(previewRows)}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                  >
                    {uploading ? "Wird hochgeladen…" : "Upload bestätigen"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar-Warenkorb nur im manuellen Modus */}
      {step === "manual" && (
        <CartVerkauf
          dealer={dealer}
          cart={cart}
          setCart={setCart}
          open={cartOpen}
          setOpen={setCartOpen}
          onSaleSuccess={() => setCart([])}
        />
      )}
    </div>
  );
}
