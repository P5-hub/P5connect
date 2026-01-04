"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DealerInfoCompact from "@/app/(dealer)/components/DealerInfoCompact";
import { toast } from "sonner";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/* -------------------------------------------------------
   UNIFIED CART PROPS
------------------------------------------------------- */

export type UnifiedCartProps = {
  mode: "bestellung" | "projekt" | "verkauf" | "support" | "sofortrabatt";
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  details?: Record<string, any>;
  extra?: Record<string, any>;
  onSuccess: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;

  /** SUPPORT: erlaubt Custom-Content */
  children?: React.ReactNode;
};

/* -------------------------------------------------------
   MODE CONFIG
------------------------------------------------------- */

const modeConfig = {
  bestellung: {
    title: "Bestellung abschicken",
    color: "text-blue-700",
    bg: "bg-blue-600 hover:bg-blue-700",
    btn: "border-blue-600 text-blue-700 hover:bg-blue-50",
  },
  projekt: {
    title: "Projektanfrage senden",
    color: "text-purple-700",
    bg: "bg-purple-600 hover:bg-purple-700",
    btn: "border-purple-600 text-purple-700 hover:bg-purple-50",
  },
  verkauf: {
    title: "Verkäufe melden",
    color: "text-green-700",
    bg: "bg-green-600 hover:bg-green-700",
    btn: "border-green-600 text-green-700 hover:bg-green-50",
  },
  support: {
    title: "Support senden",
    color: "text-amber-700",
    bg: "bg-amber-600 hover:bg-amber-700",
    btn: "border-amber-600 text-amber-700 hover:bg-amber-50",
  },
  sofortrabatt: {
    title: "Sofortrabatt beantragen",
    color: "text-red-700",
    bg: "bg-red-600 hover:bg-red-700",
    btn: "border-red-600 text-red-700 hover:bg-red-50",
  },
} as const;

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

const num = (v: any) => {
  const n = typeof v === "string" ? Number(v.replace(",", ".")) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const money = (v: number) =>
  new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);

/* -------------------------------------------------------
   UNIFIED CART
------------------------------------------------------- */

export default function UnifiedCart({
  mode,
  cart,
  setCart,
  details = {},
  extra = {},
  onSuccess,
  open,
  setOpen,
}: UnifiedCartProps) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");
  const contextDealer = useDealer();

  const [activeDealer, setActiveDealer] = useState<any | null>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmSonyShare, setConfirmSonyShare] = useState(false);


  const cfg = modeConfig[mode];

  /* -------------------------------------------------------
     DEALER LADEN
  ------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadDealer = async () => {
      setLoadingDealer(true);

      if (dealerIdFromUrl) {
        const { data } = await supabase
          .from("dealers")
          .select("*")
          .eq("dealer_id", dealerIdFromUrl)
          .maybeSingle();

        if (!cancelled) {
          setActiveDealer(data ?? contextDealer ?? null);
          setLoadingDealer(false);
        }
      } else {
        setActiveDealer(contextDealer ?? null);
        setLoadingDealer(false);
      }
    };

    loadDealer();
    return () => {
      cancelled = true;
    };
  }, [dealerIdFromUrl, supabase, contextDealer]);

  /* -------------------------------------------------------
     VERKAUF META – Fallback-sicherer State
  ------------------------------------------------------- */

  const getIsoCalendarWeek = () => {
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
  };

  const [calendarWeekLocal, setCalendarWeekLocal] = useState<number>(
    num(extra?.calendarWeek) || getIsoCalendarWeek()
  );

  const [inhouseQtyShareLocal, setInhouseQtyShareLocal] = useState<number>(
    num(extra?.inhouseQtyShare) || 50
  );
  const [inhouseRevenueShareLocal, setInhouseRevenueShareLocal] =
    useState<number>(num(extra?.inhouseRevenueShare) || 50);

  useEffect(() => {
    if (!open) return;

    setCalendarWeekLocal(
      num(extra?.calendarWeek) || getIsoCalendarWeek()
    );

    setInhouseQtyShareLocal(num(extra?.inhouseQtyShare) || 50);
    setInhouseRevenueShareLocal(num(extra?.inhouseRevenueShare) || 50);
    setConfirmSonyShare(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pushExtra = (key: string, value: any) => {
    if (typeof extra?.set === "function") {
      extra.set(key, value);
    }
  };

  /* -------------------------------------------------------
     BERECHNUNGEN (nur Verkauf)
  ------------------------------------------------------- */

  const sonyQty = useMemo(
    () => cart.reduce((s, i) => s + num(i.quantity ?? i.menge ?? 0), 0),
    [cart]
  );

  const sonyRevenue = useMemo(() => {
    return cart.reduce((s, i) => {
      const q = num(i.quantity ?? i.menge ?? 0);
      const p = num(i.price ?? i.verkaufspreis ?? 0);
      return s + q * p;
    }, 0);
  }, [cart]);

  const totalQty =
    mode === "verkauf" && inhouseQtyShareLocal > 0
      ? sonyQty / (inhouseQtyShareLocal / 100)
      : 0;

  const totalRevenue =
    mode === "verkauf" && inhouseRevenueShareLocal > 0
      ? sonyRevenue / (inhouseRevenueShareLocal / 100)
      : 0;

  /* -------------------------------------------------------
     CART HELPERS
  ------------------------------------------------------- */

  const updateItem = (index: number, field: string, value: any) => {
    setCart((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const handleSubmit = async () => {
    if (!activeDealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Keine Produkte im Warenkorb.");
      return;
    }
    if (mode === "verkauf" && !confirmSonyShare) {
      toast.error(
        "Bitte bestätigen Sie die Korrektheit der SONY-Anteile."
      );
      return;
    }

    // SUPPORT: Supportbetrag muss > 0 sein
    if (mode === "support") {
      const invalid = cart.some(
        (i) => !Number(i.supportbetrag) || Number(i.supportbetrag) <= 0
      );

      if (invalid) {
        toast.error("Bitte Supportbetrag pro Produkt eingeben.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        dealer_id: activeDealer.dealer_id,
        items: cart,
      };

      // Standard "kommentar" für bestehende Endpoints (Projekt/Bestellung etc.)
      // (nicht kaputtmachen)
      payload.kommentar = details?.kommentar ?? details?.comment ?? null;

      // VERKAUF extra
      if (mode === "verkauf") {
        payload.calendar_week = calendarWeekLocal;

        payload.sony_share_qty = inhouseQtyShareLocal;
        payload.sony_share_revenue = inhouseRevenueShareLocal;
      }


      // SUPPORT (flach passend zum Backend)
      if (mode === "support") {
        const totalCost = num(details?.totalCost);
        const sonyShare = num(details?.sonyShare);

        payload.type = details?.type ?? "sellout";
        payload.comment = details?.comment ?? details?.kommentar ?? null;
        payload.totalCost = totalCost || null;
        payload.sonyShare = sonyShare || null;
        payload.sonyAmount =
          totalCost > 0 && sonyShare > 0 ? (totalCost * sonyShare) / 100 : null;

        // Wichtig: document_path kommt aus SupportForm nach Upload
        payload.document_path = details?.document_path ?? null;
      }

      const endpoint = {
        bestellung: "/api/bestellung",
        projekt: "/api/projekt",
        verkauf: "/api/verkauf-upload",
        support: "/api/support",
        sofortrabatt: "/api/sofortrabatt",
      }[mode];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Einreichung fehlgeschlagen");
      }

      setSuccess(true);
      setCart(() => []);
      onSuccess();
      toast.success("Erfolgreich gespeichert!");
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Speichern");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={`fixed bottom-6 right-6 z-50 ${cfg.btn} shadow-lg`}
        >
          {cfg.title} {cart.length ? `(${cart.length})` : ""}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className={cfg.color}>{cfg.title}</SheetTitle>
        </SheetHeader>

        {loadingDealer ? (
          <p className="text-sm text-gray-500 mt-2">⏳ Händler wird geladen…</p>
        ) : activeDealer ? (
          <div className="mt-2">
            <DealerInfoCompact dealer={activeDealer} />
          </div>
        ) : (
          <p className="text-sm text-red-500 mt-2">Händler nicht gefunden</p>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <SheetClose asChild>
              <Button className={cfg.bg}>Schließen</Button>
            </SheetClose>
          </div>
        ) : (
          <>
            {/* VERKAUF META + SUMMARY */}
            {mode === "verkauf" && (
              <div className="mt-4 border rounded-2xl p-4 bg-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Verkaufsparameter</h3>
                  <span className="text-xs text-gray-500">
                    Basis: nur SONY Sell-out
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Kalenderwoche</label>
                    <Input
                      type="number"
                      min={1}
                      max={53}
                      value={calendarWeekLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setCalendarWeekLocal(v);
                        pushExtra("calendarWeek", v);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">
                      SONY Anteil – Stückzahl (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={inhouseQtyShareLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setInhouseQtyShareLocal(v);
                        pushExtra("inhouseQtyShare", v);
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">
                      SONY Anteil – Umsatz (%)
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={inhouseRevenueShareLocal}
                      onChange={(e) => {
                        const v = num(e.target.value);
                        setInhouseRevenueShareLocal(v);
                        pushExtra("inhouseRevenueShare", v);
                      }}
                    />
                  </div>
                </div>

                <div className="border rounded-xl bg-white p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Sony Stückzahl</span>
                    <span>{sonyQty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Gesamtstückzahl Händler</span>
                    <span>{Math.round(totalQty)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sony Umsatz</span>
                    <span>{money(sonyRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Gesamtumsatz Händler</span>
                    <span>{money(totalRevenue)}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="border-t pt-3">
              <label className="flex items-start gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={confirmSonyShare}
                  onChange={(e) => setConfirmSonyShare(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Ich bestätige, dass die gemeldeten <b>SONY-Anteile (Stück & Umsatz)</b>
                  den tatsächlichen Verkaufsverhältnissen dieser Kalenderwoche entsprechen.
                </span>
              </label>
            </div>

            {/* ITEMS */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Noch keine Produkte ausgewählt.
                </p>
              ) : (
                cart.map((item, i) => {
                  const name = item.product_name ?? item.sony_article ?? "Produkt";
                  const ean = item.ean ?? "-";
                  const serienWert = item.seriennummer ?? item.serial ?? "";

                  return (
                    <div
                      key={i}
                      className="border p-4 rounded-2xl bg-white shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-semibold">{name}</p>
                          <p className="text-xs text-gray-500">EAN: {ean}</p>
                        </div>
                        <Trash2
                          className="w-4 h-4 text-red-500 cursor-pointer mt-1"
                          onClick={() => removeItem(i)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-600">Menge</label>
                          <Input
                            type="number"
                            min={1}
                            value={num(item.quantity ?? 1)}
                            onChange={(e) =>
                              updateItem(
                                i,
                                "quantity",
                                Math.max(1, num(e.target.value))
                              )
                            }
                          />
                        </div>

                        {/* PREIS / SUPPORTBETRAG – MODE-SPEZIFISCH */}
                        {mode !== "support" && (
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Preis (CHF)
                            </label>
                            <Input
                              type="number"
                              value={item.price ?? ""}
                              onChange={(e) =>
                                updateItem(i, "price", num(e.target.value))
                              }
                              placeholder="z.B. 499"
                            />
                          </div>
                        )}

                        {mode === "support" && (
                          <div className="space-y-1">
                            <label className="text-xs text-gray-600">
                              Supportbetrag pro Stück (CHF)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={item.supportbetrag ?? ""}
                              onChange={(e) =>
                                updateItem(i, "supportbetrag", num(e.target.value))
                              }
                              placeholder="z.B. 50"
                            />
                          </div>
                        )}

                        {mode === "verkauf" && (
                          <div className="space-y-1">
                            <label className="text-xs text-gray-600">
                              Seriennummer
                            </label>
                            <Input
                              type="text"
                              value={serienWert}
                              onChange={(e) => {
                                updateItem(i, "seriennummer", e.target.value);
                              }}
                              placeholder="SN…"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <Button
                onClick={handleSubmit}
                disabled={loading || (mode === "verkauf" && !confirmSonyShare)}
                className={`w-full ${cfg.bg} text-white font-semibold`}
              >

                {loading ? "Bitte warten…" : cfg.title}
              </Button>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
