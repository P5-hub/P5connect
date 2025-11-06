"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  X,
  Mail,
  RotateCcw,
  Clock,
  ListFilter,
  Search,
  Hash,
  User,
  PencilLine,
  Save,
  XCircle,
} from "lucide-react";

import {
  parseNum,
  calcNettoUPE,
  calcMarge,
  calcPOI,
  calcPriceFromTargetMargin,
  calcInvestByRule,
} from "@/lib/helpers/calcHelpers";
import {
  buildOrderMeta,
  updateStatus,
  resetStatusToPending,
} from "@/lib/helpers/orderHelpers";
import { sendMail } from "@/lib/mailer";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import { useOptimisticSave } from "@/lib/hooks/useOptimisticSave";

/** ---------- Zusätzliche Typen ---------- */
type EditSource = "price" | "margin" | null;

type BestellungenDashboardProps = {
  submissionId?: number;
  mode?: string;
};

type Distributor = {
  id: string;
  code?: string | null;
  name?: string | null;
  email?: string | null;
};

type SubmissionItem = {
  item_id: number;
  submission_id: number;
  product_id: number | null;
  menge?: number;
  lowest_price_brutto?: number | null;
  lowest_price_netto?: number | null;
  lowest_price_source?: string | null;
  lowest_price_source_custom?: string | null;
  margin_street?: number | null;

  // editierbar / berechnet
  preis: number | null;
  calc_price_on_invoice: number | null;
  invest: number | null;
  netto_retail: number | null;
  marge_alt: number | null;
  marge_neu: number | null;
  invest_calc: number | null;
  poi_alt: number | null;
  poi_neu: number | null;

  // artikel
  product_name: string | null;
  ean: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  vrg: number | null;

  // preishistorie
  dealer_invoice_price: number | null;
  price_on_invoice: number | null;
  support_on_invoice: number | null;
  tactical_support: number | null;
  suisa: number | null;

  // distributor
  distributor_id?: string | null;
  distributor_name: string | null;
  distributor_code: string | null;
  distributor_email: string | null;
};

type Bestellung = {
  submission_id: number;
  created_at: string;
  status: "pending" | "approved" | "rejected" | null;
  dealer_name?: string | null;
  dealer_email?: string | null;
  dealer_login_nr?: string | null;
  dealer_contact_person?: string | null;
  kam_name?: string | null;
  kam?: string | null;
  kam_email?: string | null;
  kam_email_sony?: string | null;
  submission_items: SubmissionItem[];
  distributor_names?: string[] | null;
  distributor_codes?: string[] | null;
};

interface DashboardItemProps {
  item: SubmissionItem;
  b: Bestellung;
  supabase: ReturnType<typeof createClient>;
  editItemId: number | null;
  setEditItemId: React.Dispatch<React.SetStateAction<number | null>>;
  editedPrice: string;
  setEditedPrice: React.Dispatch<React.SetStateAction<string>>;
  editedMargin: string;
  setEditedMargin: React.Dispatch<React.SetStateAction<string>>;
  editedSource: EditSource;
  setEditedSource: React.Dispatch<React.SetStateAction<EditSource>>;
  editedDistributorId: string | null;
  setEditedDistributorId: React.Dispatch<React.SetStateAction<string | null>>;
  distributors: Distributor[];
  saveItem: (b: Bestellung, item: SubmissionItem) => Promise<void>;
  fetchRows: () => Promise<void>;
}


  function DashboardItem({
    item,
    b,
    supabase,
    editItemId,
    setEditItemId,
    editedPrice,
    setEditedPrice,
    editedMargin,
    setEditedMargin,
    editedSource,
    setEditedSource,
    editedDistributorId,
    setEditedDistributorId,
    distributors,
    saveItem,
    fetchRows,
  }: DashboardItemProps) {
    const retail = item.retail_price ?? 0;
    const vrg = item.vrg ?? 0;
    const ekAlt = item.dealer_invoice_price ?? 0;
    const poiAlt = item.price_on_invoice ?? 0;
    const netto = retail ? retail / 1.081 - vrg : 0;
    const mAlt = item.marge_alt ?? ((netto && ekAlt) ? ((netto - ekAlt) / netto) * 100 : null);

    const isEditing = editItemId === item.item_id;
    const currentPrice = item.preis ?? 0;
    const mNeuCurrent = netto ? ((netto - currentPrice) / netto) * 100 : null;

    const { optimisticUpdate } = useOptimisticSave(supabase, fetchRows);

    // ðŸ§® Lokale States (alle Werte persistent halten)
    const [streetBrutto, setStreetBrutto] = useState(item.lowest_price_brutto ?? 0);
    const [streetNetto, setStreetNetto] = useState(item.lowest_price_netto ?? 0);
    const [investVal, setInvestVal] = useState(item.invest ?? 0);
    const [marginStreet, setMarginStreet] = useState<number | null>(item.margin_street ?? null);
    const [newDealerPrice, setNewDealerPrice] = useState(item.preis ?? 0);

    useEffect(() => {
      // Nach Speichern oder neuem Edit sicherstellen, dass States wieder aus Item kommen
      if (!isEditing) {
        setStreetBrutto(item.lowest_price_brutto ?? 0);
        setStreetNetto(item.lowest_price_netto ?? 0);
        setInvestVal(item.invest ?? 0);
        setMarginStreet(item.margin_street ?? null);
        setNewDealerPrice(item.preis ?? 0);
      }
    }, [item, isEditing]);

    return (
      <div key={`i-${b.submission_id}-${item.item_id}`} className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
          {/* Kopfzeile */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-xs text-gray-900">{item.product_name}</p>
            <p className="text-[11px] text-gray-500">
              EAN: {item.ean} . Menge: {item.menge}
            </p>
          </div>

          {!isEditing ? (
            <Button
              size="sm"
              variant="outline"
              className={`h-7 px-2 text-[11px] rounded-full ${
                b.status !== "pending"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-100 hover:text-gray-800"
              }`}
              onClick={() => {
                if (b.status !== "pending") return;
                setEditItemId(item.item_id);
                setEditedPrice(isFinite(currentPrice) ? currentPrice.toFixed(2) : "");
                setEditedMargin(mNeuCurrent == null ? "" : mNeuCurrent.toFixed(1));
                setEditedSource(null);
                setEditedDistributorId(item.distributor_id ?? null);
              }}
              disabled={b.status !== "pending"}
            >
              <PencilLine className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex gap-1">
              {/* ✅ Neuer Save-Button mit korrektem Verhalten */}
              <Button
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={async () => {
                  const safeNum = (v: any) =>
                    isFinite(v) && !isNaN(v) ? parseFloat(v.toFixed(2)) : 0;

                  const priceNew = safeNum(newDealerPrice);
                  const investNew = safeNum(investVal);
                  const marginNew = safeNum(marginStreet ?? 0);
                  const bruttoNew = safeNum(streetBrutto);
                  const nettoNew =
                    streetNetto && streetNetto > 0
                      ? safeNum(streetNetto)
                      : safeNum(streetBrutto / 1.081);

                  try {
                    await supabase
                      .from("submission_items")
                      .update({
                        preis: priceNew,
                        invest: investNew,
                        lowest_price_brutto: bruttoNew,
                        lowest_price_netto: nettoNew,
                        margin_street: marginNew,
                      })
                      .eq("item_id", item.item_id);

                    // UI sofort aktualisieren
                    await fetchRows();

                    // Eingaben zurücksetzen
                    setEditItemId(null);
                    setEditedPrice("");
                    setEditedMargin("");
                    setEditedSource(null);
                    setEditedDistributorId(item.distributor_id ?? null);
                  } catch (err: any) {
                    console.error("❌ Supabase update failed:", err.message || err);
                    alert("Fehler beim Speichern: " + (err.message || err));
                  }
                }}
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>


              {/* Cancel bleibt wie bisher */}
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px]"
                onClick={() => {
                  setEditItemId(null);
                  setEditedPrice("");
                  setEditedMargin("");
                  setEditedSource(null);
                  setEditedDistributorId(item.distributor_id ?? null);
                  fetchRows();
                }}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
              </Button>
            </div>
          )}
        </div>


        {/* ---- Werte-Bereich ---- */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t pt-2 border-gray-200">
          {/* --- UPE --- */}
          <div className="col-span-2 font-medium text-gray-700 mb-1">UPE / Verkaufspreise</div>
          <div>
            <span className="text-gray-500">UPE brutto:</span>{" "}
            {retail ? (
              <>
                {`${retail.toFixed(2)} CHF `}
                <span className="text-gray-400 text-[10px]">
                  (−{(retail - retail / 1.081).toFixed(2)} MwSt,&nbsp;−{vrg.toFixed(2)} VRG)
                </span>
              </>
            ) : (
              "–"
            )}
          </div>
          <div className="text-right">
            <span className="text-gray-500">UPE netto:</span>{" "}
            {netto ? <span className="text-gray-700 font-medium">{`${netto.toFixed(2)} CHF`}</span> : "–"}
          </div>

          {/* --- Händlerpreise alt --- */}
          <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">Händlerpreise (alt)</div>
          <div>
            <span className="text-gray-500">EK alt:</span>{" "}
            {item.dealer_invoice_price ? `${item.dealer_invoice_price.toFixed(2)} CHF` : "–"}
          </div>
          <div className="text-right">
            <span className="text-gray-500">EK Disti alt (POI alt):</span>{" "}
            {item.poi_alt ? `${item.poi_alt.toFixed(2)} CHF` : "–"}
          </div>

          <div className="col-span-2 border-b border-gray-200 my-1"></div>

          {/* --- Streetprice & Händlerpreis (neu, verknüpft) --- */}
          <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">
            Streetprice / Händlerpreis (neu)
          </div>

          {/* Streetprice brutto */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Streetprice brutto</label>
            <input
              disabled={!isEditing}
              type="number"
              step="0.01"
              value={streetBrutto ?? ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                const brutto = isFinite(v) ? v : 0;
                setStreetBrutto(brutto);

                const nettoCalc = brutto / 1.081 - (vrg ?? 0);
                const nettoRounded = parseFloat(nettoCalc.toFixed(2));
                setStreetNetto(nettoRounded);

                const m = nettoRounded && newDealerPrice
                  ? ((nettoRounded - newDealerPrice) / nettoRounded) * 100
                  : null;
                const mRounded = m == null ? null : parseFloat(m.toFixed(1));
                setMarginStreet(mRounded);

                optimisticUpdate(item.item_id, item, {
                  lowest_price_brutto: brutto,
                  lowest_price_netto: nettoRounded,
                  margin_street: mRounded,
                });
              }}

              className="w-28 h-7 border rounded text-xs text-right px-2"
            />
            <div className="text-[10px] text-gray-400 mt-1">
              (−{((streetBrutto ?? 0) - (streetBrutto ?? 0) / 1.081).toFixed(2)} MwSt,&nbsp;−{(vrg ?? 0).toFixed(2)} VRG)
            </div>
          </div>

          {/* Streetprice netto */}
          <div className="text-right">
            <label className="block text-[11px] text-gray-500 mb-1">Streetprice netto</label>
            <div className="text-gray-700 font-medium">
              {streetNetto ? `${streetNetto.toFixed(2)} CHF` : "–"}
            </div>
          </div>

          {/* Invest & Marge Street */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Invest (CHF)</label>
            <input
              disabled={!isEditing}
              type="number"
              step="0.01"
              value={investVal ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                const v = parseFloat(val.replace(",", "."));
                if (!isFinite(v)) return;
                setInvestVal(v);

                const poiAltLocal = item.poi_alt ?? 0;
                const priceNew = parseFloat((poiAltLocal - v).toFixed(2));
                setNewDealerPrice(priceNew);

                const m = streetNetto && priceNew
                  ? ((streetNetto - priceNew) / streetNetto) * 100
                  : null;
                const mRounded = m == null ? null : parseFloat(m.toFixed(1));
                setMarginStreet(mRounded);

                optimisticUpdate(item.item_id, item, {
                  invest: v,
                  preis: priceNew,
                  margin_street: mRounded,
                  lowest_price_brutto: streetBrutto,
                  lowest_price_netto: streetNetto,
                });

              }}

              className="w-28 h-7 border rounded text-xs text-right px-2"
            />
          </div>

          <div className="text-right">
            <label className="block text-[11px] text-gray-500 mb-1">Marge auf Streetprice (%)</label>
            <input
              disabled={!isEditing}
              type="number"
              step="0.1"
              value={marginStreet ?? ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                const mTarget = isFinite(v) ? v : 0;
                setMarginStreet(mTarget);

                if (!streetNetto || streetNetto <= 0) return;

                // ðŸ§® Händlerpreis neu berechnen
                const priceNew = parseFloat((streetNetto - (streetNetto * mTarget) / 100).toFixed(2));
                setNewDealerPrice(priceNew);
                setEditedPrice(priceNew.toFixed(2));

                // ðŸ§® Invest neu berechnen
                const poiAltLocal = item.poi_alt ?? 0;
                const investNew = parseFloat((poiAltLocal - priceNew).toFixed(2));
                setInvestVal(investNew);

                // ðŸ’¾ Speichern (debounced, um Flackern zu vermeiden)
                clearTimeout((window as any)._street_margin_db);
                (window as any)._street_margin_db = setTimeout(async () => {
                  await supabase
                    .from("submission_items")
                    .update({
                      preis: priceNew,
                      invest: investNew,
                      margin_street: mTarget,
                      lowest_price_brutto: streetBrutto,
                      lowest_price_netto: streetNetto,
                    })
                    .eq("item_id", item.item_id);
                }, 600);
              }}


              className="w-28 h-7 border rounded text-xs text-right px-2"
            />
          </div>

          {/* Händler-EK / Marge UPE */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Händlerpreis / EK neu (CHF)</label>
            <input
              disabled={!isEditing}
              type="number"
              step="0.01"
              value={isEditing ? editedPrice : newDealerPrice.toFixed(2)}
              onChange={(e) => {
                const val = e.target.value;
                setEditedPrice(val);

                const p = parseFloat(val.replace(",", "."));
                if (!isFinite(p) || p <= 0) return;

                // ðŸ§® Händler-EK neu
                setNewDealerPrice(p);

                // ðŸ§® Street-Marge live berechnen
                const m = streetNetto ? ((streetNetto - p) / streetNetto) * 100 : null;
                const mRounded = m == null ? null : parseFloat(m.toFixed(1));
                setMarginStreet(mRounded);

                // ðŸ§® Invest neu berechnen (vom POI alt abhängig)
                const poiAltLocal = item.poi_alt ?? 0;
                const investNew = parseFloat((poiAltLocal - p).toFixed(2));
                setInvestVal(investNew);

                // ðŸ’¾ Debounced Update
                optimisticUpdate(item.item_id, item, {
                  preis: p,
                  invest: investNew,
                  margin_street: mRounded,
                  lowest_price_brutto: streetBrutto,
                  lowest_price_netto: streetNetto,
                });

              }}
              onBlur={() => {
                const p = parseFloat(editedPrice.replace(",", "."));
                if (isFinite(p)) setEditedPrice(p.toFixed(2));
              }}
              className="w-28 h-7 border rounded text-xs text-right px-2"
            />


          </div>

          <div className="text-right">
            <label className="block text-[11px] text-gray-500 mb-1">Marge zum UPE netto</label>
            <div className="text-gray-700 font-medium">
              {netto ? `${(((netto - (newDealerPrice || 0)) / netto) * 100).toFixed(1)} %` : "–"}
            </div>
          </div>

          {/* ðŸ”¹ Günstigster Anbieter / Preis laut Markt */}
          {/* ðŸ”¹ Günstigster Anbieter / Preis laut Markt */}
          <div className="col-span-2 mt-3 font-medium text-gray-700 mb-1">
            Günstigster Anbieter (Markt)
          </div>

          {/* Anbieter / Quelle */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Anbieter / Quelle</label>
            {isEditing ? (
              <>
                <select
                  value={item.lowest_price_source ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    optimisticUpdate(item.item_id, item, {
                      lowest_price_source: val,
                      lowest_price_source_custom:
                        val === "Andere" ? item.lowest_price_source_custom ?? "" : null,
                    });
                  }}
                  className="w-full h-7 border rounded text-xs px-2"
                >
                  <option value="">Bitte auswählen</option>
                  <option value="Digitec">Digitec</option>
                  <option value="Mediamarkt">Mediamarkt</option>
                  <option value="Interdiscount">Interdiscount</option>
                  <option value="Fnac">Fnac</option>
                  <option value="Brack">Brack</option>
                  <option value="Fust">Fust</option>
                  <option value="Andere">Andere</option>
                </select>

                {/* Zusatzfeld bei „Andere“ */}
                {item.lowest_price_source === "Andere" && (
                  <div className="mt-1">
                    <input
                      type="text"
                      placeholder="Name des Händlers (Pflichtfeld)"
                      value={item.lowest_price_source_custom ?? ""}
                      onChange={(e) =>
                        optimisticUpdate(item.item_id, item, {
                          lowest_price_source_custom: e.target.value,
                        })
                      }
                      className="w-full h-7 border border-amber-400 rounded text-xs px-2"
                    />
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Bitte genauen Händlernamen angeben.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm font-medium text-gray-800">
                {item.lowest_price_source === "Andere" && item.lowest_price_source_custom
                  ? `Andere (${item.lowest_price_source_custom})`
                  : item.lowest_price_source || "–"}
              </div>
            )}
          </div>

          {/* Preis brutto + netto nebeneinander */}
          <div className="text-right">
            <label className="block text-[11px] text-gray-500 mb-1">Preis brutto (CHF)</label>
            {isEditing ? (
              <input
                type="number"
                step="0.01"
                value={item.lowest_price_brutto ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  const brutto = isFinite(v) ? v : null;
                  const nettoCalc = brutto ? brutto / 1.081 - (item.vrg ?? 0) : null;
                  optimisticUpdate(item.item_id, item, {
                    lowest_price_brutto: brutto,
                    lowest_price_netto: nettoCalc,
                  });
                }}
                className="w-28 h-7 border rounded text-xs text-right px-2"
              />
            ) : (
              <div className="text-sm font-medium text-gray-800">
                {item.lowest_price_brutto ? `${item.lowest_price_brutto.toFixed(2)} CHF` : "–"}
              </div>
            )}
            {item.lowest_price_netto && (
              <div className="text-[10px] text-gray-400 mt-1">
                Netto: {item.lowest_price_netto.toFixed(2)} CHF
              </div>
            )}
          </div>

          {/* Distributor */}
          <div className="col-span-2 mt-2">
            <label className="block text-[11px] text-gray-500 mb-1">Distributor</label>
            <select
              disabled={!isEditing}
              value={isEditing ? editedDistributorId || "" : item.distributor_id || ""}
              onChange={(e) => {
                const newId = e.target.value || null;
                setEditedDistributorId(newId);
                if (!newId) return;

                const dist = distributors.find((d) => d.id === newId);
                // @ts-ignore – invest_rule evtl. nicht im Typ
                const rule = dist?.invest_rule || "default";

                const poiAltLocal = item.poi_alt ?? 0;
                const newPrice = newDealerPrice || 0;
                const newInvest = parseFloat(calcInvestByRule(rule, newPrice, poiAltLocal).toFixed(2));
                setInvestVal(newInvest);

                const m =
                  streetNetto && newPrice ? ((streetNetto - newPrice) / streetNetto) * 100 : null;
                const mRounded = m == null ? null : parseFloat(m.toFixed(1));
                setMarginStreet(mRounded);

                optimisticUpdate(item.item_id, item, {
                  distributor_id: newId,
                  invest: newInvest,
                  margin_street: mRounded,
                });
              }}
              className="h-8 text-xs border border-gray-300 rounded-md px-2 w-full bg-white"
            >
              <option value="">– auswählen –</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.code ? `(${d.code})` : ""}
                </option>
              ))}
            </select>
          </div>



        </div>
      </div>
    );
  }



  /** ---------- Komponente ---------- */
  export default function BestellungenDashboard({
    submissionId,
    mode,
  }: BestellungenDashboardProps) {

    const supabase = createClient();
    // … Rest unverändert


  
    /** ---------- UI State ---------- */
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "alle">("pending");
    const [searchQuery, setSearchQuery] = useState("");

    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [editItemId, setEditItemId] = useState<number | null>(null);
    const [editedPrice, setEditedPrice] = useState<string>("");
    const [editedMargin, setEditedMargin] = useState<string>("");
    const [editedSource, setEditedSource] = useState<EditSource>(null);
    const [editedDistributorId, setEditedDistributorId] = useState<string | null>(null);

    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const searchParams = useSearchParams();

  // --- Initialwerte aus der URL übernehmen ---
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    if (statusParam && ["pending", "approved", "rejected", "alle"].includes(statusParam)) {
      setStatusFilter(statusParam as any);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // --- URL aktualisieren, wenn Filter/Suche geändert werden ---
  useEffect(() => {
    // ⚠️ Nur in der Listenansicht aktiv (nicht in Detailansicht mit submissionId)
    if (submissionId) return;

    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "pending") params.set("status", statusFilter);
    if (searchQuery) params.set("search", searchQuery);
    router.replace(`/admin/bestellungen?${params.toString()}`);
  }, [statusFilter, searchQuery, submissionId]);



    /** ---------- Session / Admin ---------- */
    /** ---------- Session / Admin ---------- */
    useEffect(() => {
      const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role === "admin") {
          setIsAdmin(true);
        }
      };
      checkAdmin();
    }, [supabase]);


    /** ---------- Stammdaten: Distributors ---------- */
    /** ---------- Stammdaten: Distributors ---------- */
    useEffect(() => {
      (async () => {
        const { data, error } = await supabase
          .from("distributors")
          .select("id, code, name, email, invest_rule")  // ✅ invest_rule hinzugefügt
          .eq("active", true)
          .order("name", { ascending: true });

        if (!error && data) setDistributors(data as Distributor[]);
      })();
    }, [supabase]);


    /** ---------- Laden aus View (roh) ---------- */
    const fetchRows = useCallback(async () => {
      setLoading(true);
      try {
        // 1ï¸âƒ£ View laden (wie bisher)
        const { data: viewData, error: viewError } = await supabase
          .from("bestellung_dashboard")
          .select("*")
          .order("created_at", { ascending: false });

        if (viewError) throw viewError;

        // 2ï¸âƒ£ Alle item_ids aus der View sammeln
        const itemIds = (viewData || [])
          .map((r) => r.item_id)
          .filter((id): id is number => typeof id === "number");

        if (itemIds.length === 0) {
          setRows(viewData || []);
          return;
        }

        // 3ï¸âƒ£ Zusätzliche Daten aus submission_items holen
        const { data: itemsExtra, error: itemsError } = await supabase
          .from("submission_items")
          .select("item_id, lowest_price_brutto, lowest_price_netto, margin_street, invest, preis, lowest_price_source, lowest_price_source_custom")
          .in("item_id", itemIds);

        if (itemsError) console.warn("âš ï¸ Konnte Zusatzfelder nicht laden:", itemsError);

        // 4ï¸âƒ£ Merge: Streetprice-Daten in View-Daten einfügen
        const merged = (viewData || []).map((row) => {
          const extra = itemsExtra?.find((x) => x.item_id === row.item_id);
          return extra ? { ...row, ...extra } : row;
        });

        // 5ï¸âƒ£ In State übernehmen
        setRows(merged || []);
      } catch (err: any) {
        console.error("❌ Fehler beim Laden:", err?.message || err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }, [supabase]);


    /** ---------- Initial & Refresh ---------- */
    useEffect(() => {
      fetchRows();
    }, [fetchRows]);

    /** ---------- Realtime direkt auf View ---------- */
    useEffect(() => {
      const channel = supabase
        .channel("bestellung-dashboard-rt")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bestellung_dashboard",
          },
          () => fetchRows()
        )
        .subscribe();

      return () => void supabase.removeChannel(channel);
    }, [supabase, fetchRows]);

    /** ---------- Gruppieren zu Bestellungen ---------- */
    const bestellungen: Bestellung[] = useMemo(() => {
      // Statusfilter
      const filteredByStatus =
        statusFilter === "alle"
          ? rows
          : rows.filter((r) => {
              const st = r.status as Bestellung["status"];
              return statusFilter === "pending" ? (!st || st === "pending") : st === statusFilter;
            });


            
      // Suchfilter (Händler, Produktname, EAN, Kd.-Nr., Ansprechpartner…)
      const term = (searchQuery || "").toLowerCase().trim();
      const filtered = !term
        ? filteredByStatus
        : filteredByStatus.filter((r) => {
            const hay =
              [
                r.dealer_name,
                r.dealer_email,
                r.dealer_login_nr,
                r.dealer_contact_person,
                r.product_name,
                r.ean,
                r.distributor_name,
                r.distributor_code,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase() || "";
            return hay.includes(term);
          });

      // Gruppieren pro submission_id
      const grouped: Record<number, Bestellung> = {};
      for (const row of filtered) {
        const sid = row.submission_id as number;
        if (!grouped[sid]) {
          grouped[sid] = {
            submission_id: sid,
            created_at: row.created_at,
            status: row.status,
            dealer_name: row.dealer_name,
            dealer_email: row.dealer_email,
            dealer_login_nr: row.dealer_login_nr,
            dealer_contact_person: row.dealer_contact_person,
            kam_name: row.kam_name,
            kam: row.kam,
            kam_email: row.kam_email,
            kam_email_sony: row.kam_email_sony,
            submission_items: [],
          };
        }

        const it: SubmissionItem = {
          item_id: row.item_id,
          submission_id: row.submission_id,
          product_id: row.product_id,
          menge: row.menge ?? undefined,
          
          lowest_price_brutto: row.lowest_price_brutto ?? null,
          lowest_price_netto: row.lowest_price_netto ?? null,
          margin_street: row.margin_street ?? null,
          lowest_price_source: row.lowest_price_source ?? null,
          lowest_price_source_custom: row.lowest_price_source_custom ?? null,


          preis: row.preis,
          calc_price_on_invoice: row.calc_price_on_invoice,
          invest: row.invest ?? row.invest_calc ?? null,
          netto_retail: row.netto_retail,
          marge_alt: row.marge_alt,
          marge_neu: row.marge_neu,
          invest_calc: row.invest_calc,
          poi_alt: row.poi_alt ?? row.price_on_invoice ?? null,
          poi_neu: row.poi_neu ?? row.calc_price_on_invoice ?? null,

          product_name: row.product_name,
          ean: row.ean,
          brand: row.brand,
          gruppe: row.gruppe,
          category: row.category,
          retail_price: row.retail_price,
          vrg: row.vrg,

          dealer_invoice_price: row.dealer_invoice_price,
          price_on_invoice: row.price_on_invoice,
          support_on_invoice: row.support_on_invoice,
          tactical_support: row.tactical_support,
          suisa: row.suisa,

          distributor_id: row.distributor_id ?? null, // falls die View das Feld liefert
          distributor_name: row.distributor_name,
          distributor_code: row.distributor_code,
          distributor_email: row.distributor_email,
        };

        grouped[sid].submission_items.push(it);
      }

      return Object.values(grouped);
    }, [rows, statusFilter, searchQuery]);


  

    // ---------------------------------------------------------------------
    // ðŸ“¬ Vorschau öffnen – zeigt identisch dasselbe HTML wie echte E-Mail
    // ---------------------------------------------------------------------
    async function openPreview(b: Bestellung) {
      try {
        const { html } = await sendOrderNotification({
          submissionId: b.submission_id,
          stage: "placed",
          preview: true, // Vorschau â†’ keine echte Mail
        });

        setPreviewHtml(html ?? "<p>Keine Daten gefunden.</p>");
      } catch (err) {
        console.error("❌ Fehler bei E-Mail-Vorschau:", err);
        setPreviewHtml("<p>Fehler beim Laden der Vorschau.</p>");
      }
    }


    // ---------------------------------------------------------------------
    // ✅ Bestellung bestätigen & E-Mail wirklich senden
    // ---------------------------------------------------------------------
    async function handleMailConfirmAndApprove(b: Bestellung) {
      try {
        const { ok, detail } = await sendOrderNotification({
          submissionId: b.submission_id,
          stage: "confirmed", // jetzt echte Bestätigungsmail
        });

        if (!ok) throw new Error("E-Mail-Versand fehlgeschlagen");

        console.log("✅ Bestellungsmail versendet:", detail);

        // Status nach Versand aktualisieren
        await updateStatus(b.submission_id, "approved");

        // Tabelle neu laden
        fetchRows();
      } catch (err) {
        console.error("❌ Fehler beim Versand der Bestellbestätigung:", err);
      }
    


    }
      // ðŸ” Einzelne Bestellung zurücksetzen und neu laden
      async function handleReset(submissionId: number) {
        try {
          const { error } = await supabase
            .from("submissions")
            .update({ status: "pending" })
            .eq("submission_id", submissionId);

          if (error) throw error;

          console.log(`✅ Bestellung #${submissionId} zurückgesetzt`);
          await fetchRows(); // ✅ richtig, nicht fetchBestellungen
        } catch (err: any) {
          console.error("❌ Fehler beim Reset:", err.message || err);
        }
      }

    /** ---------- Einzelposition speichern (Preis / Marge / Distributor) ---------- */
    async function saveItem(parent: Bestellung, item: SubmissionItem) {
      const itemId = item.item_id;




      // Zahlenbasis
      const netto = parseNum(item.netto_retail);
      const ekAlt = parseNum(item.dealer_invoice_price);
      const poiAlt = parseNum(item.price_on_invoice ?? ekAlt ?? 0);

      // Preisquelle bestimmen
      // Preisquelle bestimmen
      let newPrice: number | null = null;
      if (editedSource === "price") {
        newPrice = parseNum(editedPrice);
      } else if (editedSource === "margin") {
        if (!netto) return;
        newPrice = calcPriceFromTargetMargin(netto, parseNum(editedMargin));
      } else {
        if (editedPrice !== "") newPrice = parseNum(editedPrice);
        else if (editedMargin !== "" && netto)
          newPrice = calcPriceFromTargetMargin(netto, parseNum(editedMargin));
      }

      if (newPrice == null || !isFinite(newPrice) || newPrice < 0) return;

      // ðŸ§© Distributor-Regel prüfen
      const poiNeu = calcPOI(newPrice);
      const dist = (distributors.find((d) => d.id === editedDistributorId) as Distributor) || {};
      // @ts-ignore – invest_rule ist evtl. noch nicht im Typ
      const rule = dist.invest_rule || "default";

      // ðŸ” DEBUG-Ausgabe direkt nach Definition
      console.log("DEBUG Distributor", {
        editedDistributorId,
        dist,
        rule,
        poiAlt,
        poiNeu,
        newPrice,
      });

      // Invest & Margen berechnen
      const investVal =
        poiAlt && newPrice
          ? parseFloat(calcInvestByRule(rule, newPrice, poiAlt).toFixed(2))
          : null;

      const margeAlt = calcMarge(netto, ekAlt);
      const margeNeu = calcMarge(netto, newPrice);

      // Update-Objekt
      const payload: any = {
        preis: newPrice,
        calc_price_on_invoice: poiNeu,
        netto_retail: netto || null, // <– Netto-UPE sauber übernehmen
        marge_alt: margeAlt,
        marge_neu: margeNeu,
        invest: investVal,
      };

      // Distributor speichern, wenn gewählt
      if (editedDistributorId !== undefined) {
        payload.distributor_id = editedDistributorId || null;
      }

      // Update in submission_items
      const { error } = await supabase
        .from("submission_items")
        .update(payload)
        .eq("item_id", itemId);


      // Bestellung wieder "pending" setzen (falls gewünscht)
      await supabase.from("submissions").update({ status: "pending" }).eq("submission_id", parent.submission_id);

      // kurz warten, dann reload (damit View konsistent ist)
      await new Promise((r) => setTimeout(r, 400));
      await fetchRows();

      // UI reset
      setEditItemId(null);
      setEditedPrice("");
      setEditedMargin("");
      setEditedSource(null);
      setEditedDistributorId(null);
    }

    /** ---------- Summen/Hilfswerte ---------- */
    function calcTotals(b: Bestellung) {
      const items = b.submission_items || [];
      const totalSum = items.reduce((s, it) => s + (parseNum(it.preis) || 0), 0);
      const totalQty = items.reduce((s, it) => s + (parseNum(it.menge) || 0), 0);
      return { totalSum, totalQty };
    }

    /** ---------- Render ---------- */
    return (
      <>
        {/* Vorschau-Modal */}
        <Dialog open={!!previewHtml} onOpenChange={(o) => !o && setPreviewHtml(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>E-Mail-Vorschau</DialogTitle>
            </DialogHeader>
            <div
              className="prose max-w-none border rounded-md p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
            />
          </DialogContent>
        </Dialog>

        <div className="p-6 space-y-6">
          <Card className="border border-gray-200 rounded-2xl shadow-sm">
            {/* Wenn KEIN submissionId → normale Übersicht */}
            {!submissionId ? (
              <CardHeader className="pb-3 border-b">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 flex-wrap">
                  {/* Suche + Filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Suche Händler, Produkt, EAN oder Kd.-Nr."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-sm w-72"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant={statusFilter === "pending" ? "default" : "outline"} onClick={() => setStatusFilter("pending")} className="rounded-full text-xs font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1" /> Offen
                      </Button>
                      <Button size="sm" variant={statusFilter === "approved" ? "default" : "outline"} onClick={() => setStatusFilter("approved")} className="rounded-full text-xs font-medium">
                        <Check className="w-3.5 h-3.5 mr-1" /> Bestätigt
                      </Button>
                      <Button size="sm" variant={statusFilter === "rejected" ? "default" : "outline"} onClick={() => setStatusFilter("rejected")} className="rounded-full text-xs font-medium">
                        <X className="w-3.5 h-3.5 mr-1" /> Abgelehnt
                      </Button>
                      <Button size="sm" variant={statusFilter === "alle" ? "default" : "outline"} onClick={() => setStatusFilter("alle")} className="rounded-full text-xs font-medium">
                        <ListFilter className="w-3.5 h-3.5 mr-1" /> Alle
                      </Button>
                    </div>
                  </div>

                  {/* Globale Aktionen */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Alle bestätigen */}
                    <Button size="sm" onClick={async () => { /* ... wie bisher ... */ }} className="rounded-full text-xs px-3">
                      <Check className="w-4 h-4 mr-1" /> Alle bestätigen
                    </Button>

                    {/* Bestätigen + Mail */}
                    <Button size="sm" onClick={async () => { /* ... wie bisher ... */ }} className="rounded-full text-xs px-3">
                      <Mail className="w-4 h-4 mr-1" /> Bestätigen + Mail
                    </Button>

                    {/* Alle ablehnen */}
                    <Button size="sm" onClick={async () => { /* ... wie bisher ... */ }} className="rounded-full text-xs px-3">
                      <XCircle className="w-4 h-4 mr-1" /> Alle ablehnen
                    </Button>

                    <Button size="sm" variant="outline" onClick={fetchRows} className="rounded-full text-xs px-3">
                      <RotateCcw className="w-4 h-4 mr-1" /> Neu laden
                    </Button>
                  </div>
                </div>
              </CardHeader>
            ) : null}


            <CardContent>
              {loading ? (
                <p className="text-sm text-gray-500">Lade Bestellungen…</p>
              ) : bestellungen.length === 0 ? (
                <p className="text-sm text-gray-500">Keine Bestellungen gefunden.</p>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {bestellungen.map((b) => {
                      const items = b.submission_items || [];
                      const isLocked = b.status === "approved" || b.status === "rejected";
                      const { totalSum, totalQty } = calcTotals(b);

                      return (
                        <motion.div
                          key={`b-${b.submission_id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          onClick={() =>
                            router.push(
                              `/admin/bestellungen/${b.submission_id}?status=${statusFilter}&search=${encodeURIComponent(searchQuery || "")}`
                            )
                          }
                          className="relative flex flex-col p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                        >


                          {/* Kopf */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h3 className="truncate font-semibold text-sm text-gray-900 flex items-center gap-2">
                                <span className="text-gray-400 text-xs font-mono">#{b.submission_id}</span>
                                <span>{b.dealer_name ?? "Unbekannter Händler"}</span>
                              </h3>
                              <p className="truncate text-xs text-gray-500">{b.dealer_email ?? "-"}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(b.created_at).toLocaleDateString("de-CH")}
                              </p>

                              <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Hash className="w-3.5 h-3.5 text-gray-400" />
                                  <span><span className="text-gray-500">Kd-Nr.:</span> {b.dealer_login_nr ?? "–"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-gray-400" />
                                  <span><span className="text-gray-500">Ansprechpartner:</span> {b.dealer_contact_person ?? "–"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-gray-400" />
                                  <span><span className="text-gray-500">KAM:</span> {b.kam_name ?? b.kam ?? "–"}</span>
                                </div>
                              </div>
                            </div>
                          </div>  {/* ✅ dieser war bei dir gefehlt */}
                            {/* Distributor-Badge + Preis oben rechts */}
                            <div className="absolute top-4 right-5 text-right space-y-1">
                              <div>
                                {Array.isArray(b.distributor_names) && b.distributor_names.length > 0 ? (
                                  b.distributor_names.map((name, idx) => (
                                    <span
                                      key={`dist-${b.submission_id}-${idx}`}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-gray-50"
                                    >
                                      {name}
                                      {b.distributor_codes?.[idx] ? (
                                        <span className="text-gray-400">&nbsp;({b.distributor_codes[idx]})</span>
                                      ) : null}
                                    </span>
                                  ))
                                ) : items?.[0]?.distributor_name ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-gray-50">
                                    {items[0].distributor_name}
                                    {items[0].distributor_code ? (
                                      <span className="text-gray-400">&nbsp;({items[0].distributor_code})</span>
                                    ) : null}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-gray-400">–</span>
                                )}
                              </div>

                              {/* Preis + Status */}
                              <div className="mt-1">
                                <p className="text-base font-bold text-blue-600">{totalSum.toFixed(2)} CHF</p>
                                <p className="text-[11px] text-gray-400">{totalQty} Pos. .{" "}
                                  {b.status === "approved"
                                    ? "✅ Bestätigt"
                                    : b.status === "rejected"
                                    ? "❌ Abgelehnt"
                                    : "⏳ Offen"}
                                </p>
                              </div>
                            </div>

                          {/* Positionen */}
                          <div className="space-y-3">
                            {items.map((item) => (
                              <DashboardItem
                                key={`i-${b.submission_id}-${item.item_id}`}
                                item={item}
                                b={b}
                                supabase={supabase}
                                editItemId={editItemId}
                                setEditItemId={setEditItemId}
                                editedPrice={editedPrice}
                                setEditedPrice={setEditedPrice}
                                editedMargin={editedMargin}
                                setEditedMargin={setEditedMargin}
                                editedSource={editedSource}
                                setEditedSource={setEditedSource}
                                editedDistributorId={editedDistributorId}
                                setEditedDistributorId={setEditedDistributorId}
                                distributors={distributors}
                                saveItem={saveItem}
                                fetchRows={fetchRows}
                              />
                            ))}
                          </div>



                          {/* Footer-Aktionen */}
                          {/* Footer-Aktionen */}
                          {/* Footer-Aktionen */}
                          <div className="flex flex-col items-center justify-center border-t pt-4 mt-5 gap-2">
                            {isLocked ? (
                              // ✅ Wenn bereits bestätigt oder abgelehnt â†’ nur Vorschau + Reset (Admin)
                              <div className="flex flex-wrap justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPreview(b)}
                                  className="text-xs rounded-full border-blue-500 text-blue-600 hover:bg-blue-100/40 bg-white px-3 py-1.5 min-w-[120px]"
                                >
                                  <Mail className="w-4 h-4 mr-1 text-blue-600" /> Vorschau
                                </Button>

                                {isAdmin && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReset(b.submission_id)}
                                    className="text-xs rounded-full border-orange-500 text-orange-600 hover:bg-orange-100/40 hover:text-orange-700 bg-white px-3 py-1.5 min-w-[120px]"
                                  >
                                    <RotateCcw className="w-4 h-4 mr-1 text-orange-600" /> Reset
                                  </Button>
                                )}
                              </div>
                            ) : (
                              // ðŸŸ¡ Wenn offen â†’ alle Aktionen in einer Zeile
                              <div className="flex flex-wrap justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPreview(b)}
                                  className="text-xs rounded-full border-blue-500 text-blue-600 hover:bg-blue-100/40 bg-white px-3 py-1.5 min-w-[120px]"
                                >
                                  <Mail className="w-4 h-4 mr-1 text-blue-600" /> Vorschau
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMailConfirmAndApprove(b)}
                                  className="text-xs rounded-full border-blue-600 text-blue-700 hover:bg-blue-100/40 bg-white px-3 py-1.5 min-w-[140px]"
                                >
                                  <Mail className="w-4 h-4 mr-1 text-blue-600" /> Bestätigen + Mail
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(b.submission_id, "approved")}
                                  className="text-xs rounded-full border-green-600 text-green-700 hover:bg-green-100/40 bg-white px-3 py-1.5 min-w-[120px]"
                                >
                                  <Check className="w-4 h-4 mr-1 text-green-600" /> Bestätigen
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(b.submission_id, "rejected")}
                                  className="text-xs rounded-full border-red-600 text-red-700 hover:bg-red-100/40 bg-white px-3 py-1.5 min-w-[120px]"
                                >
                                  <X className="w-4 h-4 mr-1 text-red-600" /> Ablehnen
                                </Button>
                              </div>
                            )}
                          </div>



                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }


