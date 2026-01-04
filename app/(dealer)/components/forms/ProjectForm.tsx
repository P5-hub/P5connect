"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectFileUpload from "@/app/(dealer)/components/project/ProjectFileUpload";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ClipboardList,
  Briefcase,
  FolderKanban,
  User,
  MapPin,
  Folder,
  CalendarRange,
  MessageSquare,
} from "lucide-react";

import ProductList from "@/app/(dealer)/components/ProductList";
import ProductCardProject from "@/app/(dealer)/components/ProductCardProject";

// WICHTIG: GlobalCartProvider
import { useCart } from "@/app/(dealer)/GlobalCartProvider";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProjectForm() {
  const { t } = useI18n();
  const { addItem, openCart, setProjectDetails, getItems } = useCart();

  /* ------------------------------
     Lokale States
  ------------------------------ */
  const [step, setStep] = useState<"details" | "products">("details");

  const [details, setDetails] = useState<{
    type: string;
    name: string;
    customer: string;
    location: string;
    start: string;
    end: string;
    comment: string;
    files: File[];
  }>({
    type: "standard",
    name: "",
    customer: "",
    location: "",
    start: "",
    end: "",
    comment: "",
    files: [],
  });

  const patchDetails = (
    patch: Partial<typeof details>
  ) => setDetails((d) => ({ ...d, ...patch }));

  /* ------------------------------
     Cart Count (Badge)
  ------------------------------ */
  const projectItemCount = useMemo(
    () => getItems("projekt")?.length || 0,
    [getItems]
  );

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

    // ✅ Projekt-Details inkl. Dateien in GLOBALEN Cart speichern
    setProjectDetails({
      submission_id: Date.now(), // oder echte ID, wenn vorhanden
      project_name: details.name || null,
      customer: details.customer || null,
    });


    setStep("products");
  };

  /* ------------------------------
     Produkt zum globalen Cart hinzufügen
  ------------------------------ */
  const handleAdd = (item: any) => {
    addItem("projekt", item);
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
                    patchDetails({ name: e.target.value })
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
                    patchDetails({ customer: e.target.value })
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
                    patchDetails({ location: e.target.value })
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
                    patchDetails({ type: e.target.value })
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
                    patchDetails({ start: e.target.value })
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
                    patchDetails({ end: e.target.value })
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
                  patchDetails({ comment: e.target.value })
                }
              />
            </div>

            {/* 📎 FILE UPLOAD – HIER GEHÖRT ER HIN */}
            <ProjectFileUpload
              files={details.files}
              onChange={(files) => patchDetails({ files })}
            />

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

            {/* Projekt-Zusammenfassung */}
            <div className="border rounded-xl p-3 bg-purple-50 text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2 text-purple-700">
                <ClipboardList className="w-4 h-4" />
                Projekt
              </p>

              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span>{details.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{details.customer}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{details.location}</span>
              </div>

              {details.files.length > 0 && (
                <div className="text-xs text-gray-600">
                  📎 {details.files.length} Datei(en) angehängt
                </div>
              )}
            </div>

            <ProductList
              CardComponent={ProductCardProject}
              cardProps={{ onAddToCart: handleAdd }}
            />

            {projectItemCount > 0 && (
              <div className="fixed bottom-5 right-5 z-50">
                <Button
                  onClick={() => openCart("projekt")}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full h-14 w-14"
                >
                  <ClipboardList className="w-6 h-6" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
