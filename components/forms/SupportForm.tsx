"use client";

import { useState } from "react";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductList from "@/components/ProductList";
import ProductCardSupport from "@/components/ProductCardSupport";
import ProductCardSupportCost from "@/components/ProductCardSupportCost";
import CartSupport from "@/components/CartSupport";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { HandCoins, FileText } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext"; // 🎨 Theme-Integration

type SupportType = "sellout" | "custom";

export default function SupportForm() {
  const dealer = useDealer();
  const { t } = useI18n();
  const theme = useTheme();

  const [cart, setCart] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [supportType, setSupportType] = useState<SupportType>("sellout");
  const [comment, setComment] = useState(""); // ✅ Fehlende Variable hinzugefügt

  /** 🔹 Produkt zum Warenkorb hinzufügen */
  const onAdd = (item: any) => {
    if (!item) return;
    const entry = { ...item, support_type: supportType };

    setCart((prev) => {
      const idx = prev.findIndex(
        (p) =>
          p.product_name === entry.product_name &&
          p.support_type === entry.support_type
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: (next[idx].quantity ?? 0) + (entry.quantity ?? 1),
          supportbetrag:
            (next[idx].supportbetrag ?? 0) + (entry.supportbetrag ?? 0),
        };
        return next;
      }
      return [
        ...prev,
        {
          ...entry,
          quantity: entry.quantity ?? 1,
          supportbetrag: entry.supportbetrag ?? 0,
        },
      ];
    });

    setOpen(true);
  };

  if (!dealer)
    return <p className="text-gray-500">⏳ Händlerdaten werden geladen...</p>;

  /** 🔹 Theme-basierte Klassen */
  const activeButtonClass = `${theme.color.replace("text-", "bg-")} hover:opacity-90 text-white`;
  const inactiveButtonClass = `${theme.color} ${theme.border} hover:${theme.bgLight}`;

  /** 🔹 Render */
  return (
    <div className="space-y-6">
      {/* 🔸 Titel */}
      <h2 className={`text-xl font-semibold ${theme.color}`}>
        {t("support.title", { defaultValue: "Support-Antrag" })}
      </h2>

      {/* 🔶 Kopfbereich: Auswahl */}
      <Card className={`${theme.border} ${theme.bgLight}`}>
        <CardContent className="space-y-3 pt-6">
          <div className="flex gap-3 flex-wrap justify-start">
            {/* Sell-Out Support */}
            <Button
              onClick={() => setSupportType("sellout")}
              size="sm"
              className={`flex items-center gap-1 ${
                supportType === "sellout"
                  ? activeButtonClass
                  : inactiveButtonClass
              }`}
            >
              <HandCoins className="w-4 h-4" />
              {t("support.type.sellout", {
                defaultValue: "Sell-Out Support",
              })}
            </Button>

            {/* Sonstige Supports */}
            <Button
              onClick={() => setSupportType("custom")}
              size="sm"
              className={`flex items-center gap-1 ${
                supportType === "custom"
                  ? activeButtonClass
                  : inactiveButtonClass
              }`}
            >
              <FileText className="w-4 h-4" />
              {t("support.type.other", {
                defaultValue: "Sonstige Supports",
              })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔸 Inhalt */}
      {supportType === "sellout" ? (
        <ProductList
          key="sellout"
          CardComponent={ProductCardSupport}
          cardProps={{ onAddToCart: onAdd }}
          supportType="sellout"
        />
      ) : (
        <div className="flex justify-center">
          <div className="max-w-md w-full">
            <ProductCardSupportCost onAddToCart={onAdd} />
          </div>
        </div>
      )}

      {/* 🧾 Warenkorb */}
      <CartSupport
        cart={cart}
        setCart={setCart}
        open={open}
        setOpen={setOpen}
        details={{ type: supportType, comment }} // ✅ dynamisch & gültig
        onSuccess={() => setCart([])}
      />
    </div>
  );
}
