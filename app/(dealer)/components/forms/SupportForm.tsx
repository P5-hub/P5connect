"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HandCoins, FileText, ArrowLeft } from "lucide-react";

import UnifiedCart from "@/app/(dealer)/components/cart/UnifiedCart";
import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardSupport from "@/app/(dealer)/components/ProductCardSupport";
import ProductCardSupportCost from "@/app/(dealer)/components/ProductCardSupportCost";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useTheme } from "@/lib/theme/ThemeContext";

export default function SupportForm() {
  const { t } = useI18n();
  const theme = useTheme();

  /* -------------------------------
     STEP HANDLING
  -------------------------------- */
  const [step, setStep] = useState<"details" | "products">("details");

  /* -------------------------------
     SUPPORT DETAILS
     (werden an UnifiedCart übergeben)
  -------------------------------- */
  const [details, setDetails] = useState({
    type: "sellout", // "sellout" | "custom"
    comment: "",
  });

  /* -------------------------------
     UnifiedCart states
  -------------------------------- */
  const [cart, setCart] = useState<any[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  /* -------------------------------
     UI
  -------------------------------- */

  const activeBtn = `${theme.color.replace(
    "text-",
    "bg-"
  )} text-white hover:opacity-90`;

  const inactiveBtn = `${theme.color} ${theme.border} hover:${theme.bgLight}`;

  return (
    <div className="space-y-6 p-2">
      {/* -------------------------------------------------------- */}
      {/* STEP 1 — SUPPORT DETAILS                                 */}
      {/* -------------------------------------------------------- */}
      {step === "details" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {t("support.title", { defaultValue: "Support wählen" })}
          </h2>

          <Card className={`${theme.border} ${theme.bgLight}`}>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-sm font-medium text-gray-600">
                {t("support.type.title", { defaultValue: "Support-Typ" })}
              </h3>

              <div className="flex gap-3 flex-wrap">
                {/* SELLOUT */}
                <Button
                  size="sm"
                  onClick={() =>
                    setDetails((d) => ({ ...d, type: "sellout" }))
                  }
                  className={`flex items-center gap-1 ${
                    details.type === "sellout" ? activeBtn : inactiveBtn
                  }`}
                >
                  <HandCoins className="w-4 h-4" />
                  {t("support.type.sellout", {
                    defaultValue: "Sell-Out Support",
                  })}
                </Button>

                {/* CUSTOM */}
                <Button
                  size="sm"
                  onClick={() =>
                    setDetails((d) => ({ ...d, type: "custom" }))
                  }
                  className={`flex items-center gap-1 ${
                    details.type === "custom" ? activeBtn : inactiveBtn
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {t("support.type.other", {
                    defaultValue: "Sonstige Supports",
                  })}
                </Button>
              </div>

              {/* Kommentar */}
              <div className="pt-2">
                <label className="block text-sm text-gray-600 mb-1">
                  {t("support.comment", { defaultValue: "Kommentar" })}
                </label>
                <textarea
                  rows={3}
                  className="border rounded-md px-2 py-1 w-full"
                  value={details.comment}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, comment: e.target.value }))
                  }
                />
              </div>

              {/* Weiter */}
              <Button
                className={`${activeBtn} mt-2`}
                onClick={() => setStep("products")}
              >
                {t("support.next", { defaultValue: "Weiter zu Produkten" })}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* STEP 2 — PRODUKTE                                        */}
      {/* -------------------------------------------------------- */}
      {step === "products" && (
        <div className="space-y-6">
          {/* BACK BUTTON */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep("details")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("support.back", { defaultValue: "Zurück" })}
          </Button>

          <h2 className="text-xl font-semibold">
            {t("support.products", { defaultValue: "Produkte auswählen" })}
          </h2>

          {/* PRODUCT LIST */}
          {details.type === "sellout" ? (
            <ProductList
              CardComponent={ProductCardSupport}
              cardProps={{
                onAddToCart: (item: any) => {
                  setCart((prev) => [...prev, item]);
                  setCartOpen(true);
                },
              }}
              supportType="sellout"
            />
          ) : (
            <div className="flex justify-center">
              <div className="max-w-md w-full">
                <ProductCardSupportCost
                  onAddToCart={(item: any) => {
                    setCart((prev) => [...prev, item]);
                    setCartOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* UnifiedCart ersetzt alten CartSupport */}
          <UnifiedCart
            mode="support"
            cart={cart}
            setCart={setCart}
            open={cartOpen}
            setOpen={setCartOpen}
            onSuccess={() => {
              setCart([]);
              setStep("details");
              setDetails({
                type: "sellout",
                comment: "",
              });
            }}
            details={details}
          />
        </div>
      )}
    </div>
  );
}
