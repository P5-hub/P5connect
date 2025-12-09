"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardProject from "@/app/(dealer)/components/ProductCardProject";

// WICHTIG: GlobalCartProvider
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProjectForm() {
  const { t } = useI18n();
  const { addItem, openCart, setProjectDetails } = useCart();

  /* ------------------------------
     Lokale States
  ------------------------------ */
  const [step, setStep] = useState<"details" | "products">("details");

  const [details, setDetails] = useState({
    type: "standard",
    name: "",
    customer: "",
    location: "",
    start: "",
    end: "",
    comment: "",
  });

  /* ------------------------------
     VALIDIERUNG
  ------------------------------ */
  const canProceed =
    details.name.trim().length > 2 &&
    details.customer.trim().length > 2 &&
    details.location.trim().length > 2;

  /* ------------------------------
     Weiter zu Step 2
  ------------------------------ */
  const goToProducts = () => {
    if (!canProceed) return;

    // Projekt-Details in GLOBALEN Cart speichern
    setProjectDetails(details);

    // Schritt wechseln
    setStep("products");

    // Projekt-Cart öffnen
    openCart("projekt");
  };

  /* ------------------------------
     Produkt zum globalen Cart hinzufügen
  ------------------------------ */
  const handleAdd = (item: any) => {
    addItem("projekt", item);
    openCart("projekt");
  };

  /* ------------------------------
     RENDER
  ------------------------------ */

  return (
    <div className="p-4">
      <AnimatePresence mode="wait">
        {/* STEP 1 – Projektdetails */}
        {step === "details" && (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">{t("project.details")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Projektname */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.name")}
                </label>
                <input
                  type="text"
                  className="border px-2 py-1 rounded w-full"
                  value={details.name}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, name: e.target.value }))
                  }
                />
              </div>

              {/* Kunde */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.customer")}
                </label>
                <input
                  type="text"
                  className="border px-2 py-1 rounded w-full"
                  value={details.customer}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, customer: e.target.value }))
                  }
                />
              </div>

              {/* Ort */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.location")}
                </label>
                <input
                  type="text"
                  className="border px-2 py-1 rounded w-full"
                  value={details.location}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, location: e.target.value }))
                  }
                />
              </div>

              {/* Projekt-Typ */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.type")}
                </label>

                <select
                  value={details.type}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, type: e.target.value }))
                  }
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="standard">
                    {t("project.type.standard")}
                  </option>
                  <option value="ausschreibung">
                    {t("project.type.tender")}
                  </option>
                  <option value="promotion">
                    {t("project.type.promo")}
                  </option>
                </select>
              </div>

              {/* Start */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.start")}
                </label>
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  value={details.start}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, start: e.target.value }))
                  }
                />
              </div>

              {/* Ende */}
              <div>
                <label className="block text-sm mb-1">
                  {t("project.end")}
                </label>
                <input
                  type="date"
                  className="border px-2 py-1 rounded w-full"
                  value={details.end}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, end: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Kommentar */}
            <div>
              <label className="block text-sm mb-1">
                {t("project.comment")}
              </label>
              <textarea
                rows={3}
                className="border px-2 py-1 rounded w-full"
                value={details.comment}
                onChange={(e) =>
                  setDetails((d) => ({ ...d, comment: e.target.value }))
                }
              />
            </div>

            {/* Weiter */}
            <div className="pt-4">
              <Button
                disabled={!canProceed}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={goToProducts}
              >
                {t("project.next")}
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2 – Produkte auswählen */}
        {step === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between mb-2">
              <Button variant="outline" onClick={() => setStep("details")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("project.back")}
              </Button>
            </div>

            <h2 className="text-xl font-semibold">
              {t("project.products")}
            </h2>

            {/* Produktliste */}
            <ProductList
              CardComponent={ProductCardProject}
              cardProps={{
                onAddToCart: (item: any) => handleAdd(item),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
