"use client";

import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardVerkauf from "@/app/(dealer)/components/ProductCardVerkauf";

import UnifiedCart from "@/app/(dealer)/components/cart/UnifiedCart";
import { useDealer } from "@/app/(dealer)/DealerContext";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileUp, Download, FileX } from "lucide-react";

export default function VerkaufForm() {
  const dealer = useDealer();

  const [step, setStep] = useState<"choose" | "manual" | "upload">("choose");

  const [cart, setCart] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [unknownEANs, setUnknownEANs] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [sonyShare, setSonyShare] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7
    );
  });

  const onReportSale = (item: any) => {
    setCart((prev) => [...prev, item]);
    setOpen(true);
  };

  if (!dealer) return <p>⏳ Händlerdaten werden geladen…</p>;

  return (
    <div className="p-4">
      <AnimatePresence>
        {/* STEP 1 */}
        {step === "choose" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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

        {/* STEP 2: MANUAL */}
        {step === "manual" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>

            <ProductList
              CardComponent={ProductCardVerkauf}
              cardProps={{ onReportSale }}
            />

            <UnifiedCart
              mode="verkauf"
              cart={cart}
              setCart={setCart}
              open={open}
              setOpen={setOpen}
              onSuccess={() => setCart([])}
              extra={{
                inhouseShare: sonyShare,
                calendarWeek: selectedWeek,

                // ✅ FIX: TypeScript-Fehler behoben
                set: (
                  key: "inhouseShare" | "calendarWeek",
                  val: any
                ) => {
                  if (key === "inhouseShare") setSonyShare(val);
                  if (key === "calendarWeek") setSelectedWeek(val);
                },
              }}
            />
          </motion.div>
        )}

        {/* STEP 3: UPLOAD */}
        {step === "upload" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="outline" onClick={() => setStep("choose")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Zurück
            </Button>

            {/* Upload-Logik bleibt unverändert */}
            {/* ... */}

            <UnifiedCart
              mode="verkauf"
              cart={previewRows}
              setCart={setPreviewRows}
              open={open}
              setOpen={setOpen}
              onSuccess={() => setPreviewRows([])}
              extra={{
                inhouseShare: sonyShare,
                calendarWeek: selectedWeek,

                // ❗ gleicher Fix wie oben
                set: (
                  key: "inhouseShare" | "calendarWeek",
                  val: any
                ) => {
                  if (key === "inhouseShare") setSonyShare(val);
                  if (key === "calendarWeek") setSelectedWeek(val);
                },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
