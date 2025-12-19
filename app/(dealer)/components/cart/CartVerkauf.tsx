"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/app/(dealer)/GlobalCartProvider";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function CartVerkauf() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const dealerIdFromUrl = searchParams.get("dealer_id");

  const { state, getItems, clearCart, closeCart } = useCart();

  const items = getItems("verkauf");
  const open = state.open && state.currentForm === "verkauf";

  const [dealer, setDealer] = useState<any>(null);
  const [loadingDealer, setLoadingDealer] = useState(true);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ----------------------------------------------------
     🔥 DEALER AUS URL LADEN
  ---------------------------------------------------- */
  useEffect(() => {
    const loadDealer = async () => {
      if (!dealerIdFromUrl) {
        setLoadingDealer(false);
        return;
      }

      const { data, error } = await supabase
        .from("dealers")
        .select("*")
        .eq("dealer_id", dealerIdFromUrl)
        .single();

      if (error || !data) {
        toast.error("Händler konnte nicht geladen werden.");
        setLoadingDealer(false);
        return;
      }

      setDealer(data);
      setLoadingDealer(false);
    };

    loadDealer();
  }, [dealerIdFromUrl, supabase]);

  /* ----------------------------------------------------
     Pflichtfelder
  ---------------------------------------------------- */

  // 🔥 NEU: getrennte Sony-Anteile
  const [sonyShareQty, setSonyShareQty] = useState<number>(30);
  const [sonyShareRevenue, setSonyShareRevenue] = useState<number>(30);

  const [calendarWeek] = useState<number>(() => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(
      ((now.getTime() - onejan.getTime()) / 86400000 +
        onejan.getDay() +
        1) / 7
    );
  });

  /* ----------------------------------------------------
     SUBMIT
  ---------------------------------------------------- */

  const submitSales = async () => {
    if (!dealer?.dealer_id) {
      toast.error("Kein Händler gefunden.");
      return;
    }

    if (items.length === 0) {
      toast.error("Keine Produkte im Warenkorb.");
      return;
    }

    setLoadingSubmit(true);

    try {
      console.log("📤 SEND TO API", {
        sonyShareQty,
        sonyShareRevenue,
      });

      const res = await fetch("/api/verkauf-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealer_id: dealer.dealer_id,
          items,
          calendar_week: calendarWeek,

          // 🔥 ENTSCHEIDEND – GENAU DIESE KEYS
          sony_share_qty: sonyShareQty,
          sony_share_revenue: sonyShareRevenue,
        }),
      });

      if (!res.ok) throw new Error("Serverfehler");

      setSuccess(true);
      toast.success("Verkaufsdaten gespeichert");
      clearCart("verkauf");
    } catch (err: any) {
      toast.error("Fehler beim Speichern", {
        description: err.message,
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  /* ----------------------------------------------------
     RENDER
  ---------------------------------------------------- */

  if (loadingDealer) {
    return <p className="p-4 text-gray-500">⏳ Händler wird geladen…</p>;
  }

  return (
    <Sheet open={open} onOpenChange={closeCart}>
      <SheetContent side="right" className="w-full sm:w-[600px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Verkaufsdaten melden
          </SheetTitle>
        </SheetHeader>

        {/* 🔥 HÄNDLER */}
        {dealer && (
          <div className="mb-4 text-xs">
            <div className="font-semibold text-gray-800">
              {dealer.store_name ??
                dealer.company_name ??
                dealer.name}
            </div>

            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600">
              <div>Kd-Nr.: <b>{dealer.login_nr}</b></div>
              <div>AP: <b>{dealer.contact_person}</b></div>
              <div>Tel.: <b>{dealer.phone}</b></div>
              <div>E-Mail: <b>{dealer.mail_dealer}</b></div>
              <div>
                Ort:{" "}
                <b>
                  {[dealer.zip, dealer.city]
                    .filter(Boolean)
                    .join(" ")}
                </b>
              </div>
              <div>KAM: <b>{dealer.kam_name}</b></div>
            </div>
          </div>
        )}

        {/* 🔥 SONY ANTEILE */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-gray-600">
              SONY Anteil Stück (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={sonyShareQty}
              onChange={(e) =>
                setSonyShareQty(Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">
              SONY Anteil Umsatz (%)
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={sonyShareRevenue}
              onChange={(e) =>
                setSonyShareRevenue(Number(e.target.value))
              }
            />
          </div>
        </div>

        {/* 🔥 SUBMIT */}
        <Button
          className="mt-auto bg-green-600 text-white"
          onClick={submitSales}
          disabled={loadingSubmit}
        >
          {loadingSubmit ? "Speichern…" : "Verkauf melden"}
        </Button>

        {success && (
          <SheetClose asChild>
            <Button className="mt-4 w-full bg-green-700 text-white">
              Schließen
            </Button>
          </SheetClose>
        )}
      </SheetContent>
    </Sheet>
  );
}
