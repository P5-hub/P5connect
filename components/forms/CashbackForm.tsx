"use client";

import { useState } from "react";
import { submitCashback } from "@/lib/api";
import { toast } from "sonner";

export default function CashbackForm({
  dealer,
  onSuccess,
}: {
  dealer: any;
  onSuccess: () => void;
}) {
  const [cashbackType, setCashbackType] = useState<"Single" | "Double">("Single");
  const [cashbackBetrag, setCashbackBetrag] = useState<number | "">("");
  const [seriennummer, setSeriennummer] = useState("");
  const [seriennummerSB, setSeriennummerSB] = useState("");
  const [soundbarEan, setSoundbarEan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!cashbackBetrag || cashbackBetrag <= 0) {
      toast.error("Ungültiger Betrag", {
        description: "Bitte Cashback-Betrag eingeben!",
      });
      return;
    }
    if (!seriennummer) {
      toast.error("Fehlende Seriennummer", {
        description: "Bitte Seriennummer des Produkts eingeben!",
      });
      return;
    }
    if (cashbackType === "Double" && (!seriennummerSB || !soundbarEan)) {
      toast.error("Fehlende Soundbar-Daten", {
        description: "Für Double Cashback bitte auch Soundbar-Daten eingeben!",
      });
      return;
    }

    setLoading(true);
    try {
      await submitCashback(
        dealer.dealer_id,
        cashbackType,
        Number(cashbackBetrag),
        seriennummer,
        seriennummerSB || undefined,
        soundbarEan || undefined
      );
      setCashbackBetrag("");
      setSeriennummer("");
      setSeriennummerSB("");
      setSoundbarEan("");
      onSuccess();
      toast.success("✅ Cashback gesendet", {
        description: "Der Cashback-Antrag wurde erfolgreich gespeichert.",
      });
    } catch (err) {
      console.error("Cashback API Error:", err);
      toast.error("❌ Fehler beim Cashback", {
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* hier dein bestehendes Formular */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md transition"
      >
        {loading ? "⏳ Sende..." : "✅ Cashback absenden"}
      </button>
    </div>
  );
}
