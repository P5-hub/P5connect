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
  calcInvestByRule,
} from "@/lib/helpers/calcHelpers";

import { updateStatus } from "@/lib/helpers/orderHelpers";
import { sendOrderNotification } from "@/lib/notifications/sendOrderNotification";
import { useOptimisticSave } from "@/lib/hooks/useOptimisticSave";

/* ---------------------------------------------------------
   Typen
--------------------------------------------------------- */

type EditSource = "price" | "margin" | null;

type Distributor = {
  id: string;
  code?: string | null;
  name?: string | null;
  email?: string | null;
  invest_rule?: string | null;
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

  preis: number | null;
  calc_price_on_invoice: number | null;
  invest: number | null;
  netto_retail: number | null;
  marge_alt: number | null;
  marge_neu: number | null;
  invest_calc: number | null;
  poi_alt: number | null;
  poi_neu: number | null;

  product_name: string | null;
  ean: string | null;
  brand: string | null;
  gruppe: string | null;
  category: string | null;
  retail_price: number | null;
  vrg: number | null;

  dealer_invoice_price: number | null;
  price_on_invoice: number | null;
  support_on_invoice: number | null;
  tactical_support: number | null;
  suisa: number | null;

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

type Dealer = {
  dealer_id: number;
  dealer_login_nr?: string | null;
  contact_person?: string | null;
  email?: string | null;
  company_name?: string | null;
  store_name?: string | null;
};

/* ---------------------------------------------------------
   🔥 Invest-Berechnung für ganze Bestellung
--------------------------------------------------------- */

async function calculateInvestForAllItems(
  
  submissionId: number,
  supabase: ReturnType<typeof createClient>,
  distributors: Distributor[]
) {
  const { data: items, error } = await supabase
    .from("submission_items")
    .select(`
      item_id,
      preis,
      poi_alt,
      lowest_price_brutto,
      lowest_price_netto,
      distributor_id
    `)
    .eq("submission_id", submissionId);

  if (error) {
    console.error("❌ Fehler beim Laden der Items:", error);
    return;
  }
  if (!items || items.length === 0) return;

  const rules = Object.fromEntries(
    distributors.map((d: Distributor) => [d.id, d.invest_rule || "default"])

  );

  const updates = items.map((it) => {
    const poi = Number(it.poi_alt) || Number(it.preis) || 0;
    const brutto = Number(it.lowest_price_brutto) || 0;

    const netto =
      it.lowest_price_netto !== null && isFinite(Number(it.lowest_price_netto))
        ? Number(it.lowest_price_netto)
        : brutto > 0
        ? brutto / 1.081
        : 0;

    const dealerPrice = Number(it.preis) || poi;
    const rule = rules[it.distributor_id] ?? "default";

    const calc = calcInvestByRule(rule, dealerPrice, poi);
    const invest = isFinite(calc) ? Number(calc.toFixed(2)) : 0;

    return {
      item_id: it.item_id,
      invest,
      lowest_price_netto: netto,
    };
  });

  const { error: bulkErr } = await supabase.rpc(
    "bulk_update_submission_items",
    { updates }
  );

  if (bulkErr) {
    console.error("❌ Bulk-Update fehlgeschlagen:", bulkErr);
  }
}


/* ---------------------------------------------------------
   DashboardItem Component (mit korrigiertem Invest-Handling)
--------------------------------------------------------- */

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
  fetchRows,
}: any) {

  const retail = item.retail_price ?? 0;
  const vrg = item.vrg ?? 0;
  const nettoBase = retail ? retail / 1.081 - vrg : 0;

  const isEditing = editItemId === item.item_id;
  const { optimisticUpdate } = useOptimisticSave(supabase, fetchRows);

  // ---------- STATES ----------
  const [streetBrutto, setStreetBrutto] = useState(item.lowest_price_brutto ?? 0);
  const [streetNetto, setStreetNetto] = useState(item.lowest_price_netto ?? 0);
  const [investVal, setInvestVal] = useState(item.invest ?? 0);
  const [editedInvest, setEditedInvest] = useState(item.invest ?? 0);
  const [marginStreet, setMarginStreet] = useState(item.margin_street ?? null);
  const [newDealerPrice, setNewDealerPrice] = useState(item.preis ?? 0);

  /* ---------------------------------------------------------
     INVEST BEIM LADEN AUTOMATISCH BERECHNEN, FALLS DB NULL
  --------------------------------------------------------- */
  useEffect(() => {
    if (item.invest === null || item.invest === undefined) {
      const poi = item.poi_alt ?? item.preis ?? 0;
      const dealer = item.preis ?? poi;

      const rule =
        distributors.find((d: Distributor) => d.id === item.distributor_id)?.invest_rule ||
        "default";

      const calculated = calcInvestByRule(rule, dealer, poi);
      const safe = isFinite(calculated) ? Number(calculated.toFixed(2)) : 0;

      setInvestVal(safe);
      setEditedInvest(safe);
    }
  }, [item, distributors]);

  /* ---------------------------------------------------------
     AUTO-SAVE INVEST WENN DB NULL
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing && (item.invest === null || item.invest === undefined)) {
      const safe = isFinite(investVal) ? Number(investVal.toFixed(2)) : 0;

      supabase
        .from("submission_items")
        .update({ invest: safe })
        .eq("item_id", item.item_id)
        .then(() => {
          optimisticUpdate(item.item_id, item, { invest: safe });
        });
    }
  }, [item.invest, isEditing, investVal]);

  /* ---------------------------------------------------------
     Reset bei Wechsel des Items oder Verlassen des Edit-Modus
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isEditing) {
      setStreetBrutto(item.lowest_price_brutto ?? 0);
      setStreetNetto(item.lowest_price_netto ?? 0);
      setInvestVal(item.invest ?? 0);
      setEditedInvest(item.invest ?? 0);
      setMarginStreet(item.margin_street ?? null);
      setNewDealerPrice(item.preis ?? 0);
    }
  }, [item, isEditing]);


  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-xs text-gray-900">{item.product_name}</p>
          <p className="text-[11px] text-gray-500">
            EAN: {item.ean} • Menge: {item.menge}
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
            disabled={b.status !== "pending"}
            onClick={() => {
              setEditItemId(item.item_id);
              setEditedPrice(newDealerPrice.toFixed(2));
              setEditedMargin(marginStreet?.toString() ?? "");
              setEditedSource(null);
              setEditedDistributorId(item.distributor_id ?? null);
              setEditedInvest(item.invest ?? 0);
            }}
          >
            <PencilLine className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-7 px-2 text-[11px]"
              onClick={async () => {
                const safe = (v: any) =>
                  isFinite(v) && !isNaN(v) ? parseFloat(v.toFixed(2)) : 0;

                const priceNew = safe(newDealerPrice);
                const investNew = safe(editedInvest);
                const marginNew = safe(marginStreet ?? 0);
                const bruttoNew = safe(streetBrutto);
                const nettoNew =
                  streetNetto > 0 ? safe(streetNetto) : safe(streetBrutto / 1.081);

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

                await calculateInvestForAllItems(
                  item.submission_id,
                  supabase,
                  distributors
                );

                await fetchRows();
                setEditItemId(null);
              }}
            >
              <Save className="w-3.5 h-3.5 mr-1" /> Save
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-[11px]"
              onClick={async () => {
                setEditItemId(null);
                setEditedInvest(item.invest ?? 0);
                await calculateInvestForAllItems(
                  item.submission_id,
                  supabase,
                  distributors
                );
                await fetchRows();
              }}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* VALUES */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-t pt-2 border-gray-200">
        {/* UPE */}
        <div className="col-span-2 font-medium text-gray-700 mb-1">
          UPE / Verkaufspreise
        </div>
        <div>
          <span className="text-gray-500">UPE brutto:</span>{" "}
          {retail ? (
            <>
              {retail.toFixed(2)} CHF{" "}
              <span className="text-gray-400 text-[10px]">
                (−{(retail - retail / 1.081).toFixed(2)} MwSt,&nbsp;−
                {(vrg ?? 0).toFixed(2)} VRG)
              </span>
            </>
          ) : (
            "–"
          )}
        </div>
        <div className="text-right">
          <span className="text-gray-500">UPE netto:</span>{" "}
          {nettoBase ? (
            <span className="text-gray-700 font-medium">
              {nettoBase.toFixed(2)} CHF
            </span>
          ) : (
            "–"
          )}
        </div>

        {/* Händlerpreise alt */}
        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">
          Händlerpreise (alt)
        </div>
        <div>
          <span className="text-gray-500">EK alt:</span>{" "}
          {item.dealer_invoice_price
            ? `${item.dealer_invoice_price.toFixed(2)} CHF`
            : "–"}
        </div>
        <div className="text-right">
          <span className="text-gray-500">Disti EK alt (POI alt):</span>{" "}
          {item.poi_alt ? `${item.poi_alt.toFixed(2)} CHF` : "–"}
        </div>

        <div className="col-span-2 border-b border-gray-200 my-1" />

        {/* Streetprice / Händlerpreis (neu) */}
        <div className="col-span-2 font-medium text-gray-700 mt-3 mb-1">
          Streetprice / Händlerpreis (neu)
        </div>

        {/* Streetprice brutto */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Streetprice brutto
          </label>
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

              const m =
                nettoRounded && newDealerPrice
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
            (−{(streetBrutto - streetBrutto / 1.081).toFixed(2)} MwSt,&nbsp;−
            {(vrg ?? 0).toFixed(2)} VRG)
          </div>
        </div>

        {/* Streetprice netto */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            Streetprice netto
          </label>
          <div className="text-gray-700 font-medium">
            {streetNetto ? `${streetNetto.toFixed(2)} CHF` : "–"}
          </div>
        </div>

        {/* INVEST – komplett neue Version */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Invest (CHF)
          </label>
          <input
            disabled={!isEditing}
            type="number"
            step="0.01"
            value={editedInvest}
            onChange={(e) => {
              const val = e.target.value;
              const v = parseFloat(val.replace(",", "."));
              if (!isFinite(v)) return;

              setEditedInvest(v);
              setInvestVal(v);

              const poiAltLocal = item.poi_alt ?? 0;
              const priceNew = parseFloat((poiAltLocal - v).toFixed(2));
              setNewDealerPrice(priceNew);

              const m =
                streetNetto && priceNew
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

        {/* Marge Street */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            Marge auf Streetprice (%)
          </label>
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

              const priceNew = parseFloat(
                (streetNetto - (streetNetto * mTarget) / 100).toFixed(2)
              );
              setNewDealerPrice(priceNew);

              const poiAltLocal = item.poi_alt ?? 0;
              const investNew = parseFloat(
                (poiAltLocal - priceNew).toFixed(2)
              );
              setInvestVal(investNew);

              optimisticUpdate(item.item_id, item, {
                preis: priceNew,
                invest: investNew,
                margin_street: mTarget,
              });
            }}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        {/* Händler-EK / Marge UPE */}
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Händler-EK neu (CHF)
          </label>
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

              setNewDealerPrice(p);

              const m =
                streetNetto && p
                  ? ((streetNetto - p) / streetNetto) * 100
                  : null;

              const mRounded = m == null ? null : parseFloat(m.toFixed(1));
              setMarginStreet(mRounded);

              const poiAltLocal = item.poi_alt ?? 0;
              const investNew = parseFloat((poiAltLocal - p).toFixed(2));
              setInvestVal(investNew);

              optimisticUpdate(item.item_id, item, {
                preis: p,
                invest: investNew,
                margin_street: mRounded,
              });
            }}
            className="w-28 h-7 border rounded text-xs text-right px-2"
          />
        </div>

        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            Marge zum UPE netto
          </label>
          <div className="text-gray-700 font-medium">
            {nettoBase
              ? `${(((nettoBase - (newDealerPrice || 0)) / nettoBase) * 100).toFixed(
                  1
                )} %`
              : "–"}
          </div>
        </div>

        {/* Anbieter */}
        <div className="col-span-2 mt-3 font-medium text-gray-700 mb-1">
          Günstigster Anbieter (Markt)
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">
            Anbieter / Quelle
          </label>

          {isEditing ? (
            <>
              <select
                value={item.lowest_price_source ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  optimisticUpdate(item.item_id, item, {
                    lowest_price_source: val,
                    lowest_price_source_custom:
                      val === "Andere"
                        ? item.lowest_price_source_custom ?? ""
                        : null,
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

              {item.lowest_price_source === "Andere" && (
                <div className="mt-1">
                  <input
                    type="text"
                    placeholder="Name des Händlers"
                    value={item.lowest_price_source_custom ?? ""}
                    onChange={(e) =>
                      optimisticUpdate(item.item_id, item, {
                        lowest_price_source_custom: e.target.value,
                      })
                    }
                    className="w-full h-7 border border-amber-400 rounded text-xs px-2"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-sm font-medium text-gray-800">
              {item.lowest_price_source === "Andere" &&
              item.lowest_price_source_custom
                ? `Andere (${item.lowest_price_source_custom})`
                : item.lowest_price_source || "–"}
            </div>
          )}
        </div>

        {/* Preis brutto / netto */}
        <div className="text-right">
          <label className="block text-[11px] text-gray-500 mb-1">
            Preis brutto (CHF)
          </label>

          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={streetBrutto ?? ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                const brutto = isFinite(v) ? v : null;

                const nettoCalc = brutto
                  ? brutto / 1.081 - (vrg ?? 0)
                  : null;

                optimisticUpdate(item.item_id, item, {
                  lowest_price_brutto: brutto,
                  lowest_price_netto: nettoCalc,
                });
              }}
              className="w-28 h-7 border rounded text-xs text-right px-2"
            />
          ) : (
            <div className="text-sm font-medium text-gray-800">
              {item.lowest_price_brutto
                ? `${item.lowest_price_brutto.toFixed(2)} CHF`
                : "–"}
            </div>
          )}

          {item.lowest_price_netto && (
            <div className="text-[10px] text-gray-400 mt-1">
              Netto: {item.lowest_price_netto.toFixed(2)} CHF
            </div>
          )}
        </div>

        {/* Distributor Auswahl */}
        <div className="col-span-2 mt-2">
          <label className="block text-[11px] text-gray-500 mb-1">
            Distributor
          </label>

          <select
            disabled={!isEditing}
            value={isEditing ? editedDistributorId || "" : item.distributor_id || ""}
            onChange={(e) => {
              const newId = e.target.value || null;
              setEditedDistributorId(newId);

              if (!newId) return;

              const dist = distributors.find((d: Distributor) => d.id === newId);
              const rule = dist?.invest_rule || "default";

              const poiAltLocal = item.poi_alt ?? 0;
              const newPrice = newDealerPrice || 0;
              const newInvest = parseFloat(
                calcInvestByRule(rule, newPrice, poiAltLocal).toFixed(2)
              );

              setInvestVal(newInvest);

              const m =
                streetNetto && newPrice
                  ? ((streetNetto - newPrice) / streetNetto) * 100
                  : null;

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
            {distributors.map((d: Distributor) => (
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

/* ---------------------------------------------------------
   Hauptkomponente: BestellungenDashboard
--------------------------------------------------------- */

export default function BestellungenDashboard({
  submissionId,
  mode,
}: {
  submissionId?: number;
  mode?: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const dealerIdParam = searchParams.get("dealer_id");
  const [dealer, setDealer] =
    useState<Dealer | null>(null);
  const [dealerLoading, setDealerLoading] =
    useState<boolean>(true);

  /* Händler laden (Admin acting as dealer) */
  useEffect(() => {
    if (!dealerIdParam) {
      setDealer(null);
      setDealerLoading(false);
      return;
    }

    (async () => {
      setDealerLoading(true);
      const { data, error } = await supabase
        .from("dealers")
        .select(
          "dealer_id, dealer_login_nr, contact_person, email, company_name, store_name"
        )
        .eq("dealer_id", Number(dealerIdParam))
        .maybeSingle();

      if (error) {
        console.error("❌ Fehler beim Laden des Händlers:", error);
      }

      setDealer((data as Dealer) ?? null);
      setDealerLoading(false);
    })();
  }, [dealerIdParam, supabase]);

  /* ---------- UI STATE ---------- */
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "alle"
  >("pending");

  const [searchQuery, setSearchQuery] = useState("");

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editItemId, setEditItemId] =
    useState<number | null>(null);

  const [editedPrice, setEditedPrice] =
    useState<string>("");

  const [editedMargin, setEditedMargin] =
    useState<string>("");

  const [editedSource, setEditedSource] =
    useState<EditSource>(null);

  const [editedDistributorId, setEditedDistributorId] =
    useState<string | null>(null);

  const [previewHtml, setPreviewHtml] =
    useState<string | null>(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [distributors, setDistributors] =
    useState<Distributor[]>([]);
  /* Status + Suche aus URL übernehmen */
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const searchParam = searchParams.get("search");

    if (statusParam && ["pending", "approved", "rejected", "alle"].includes(statusParam)) {
      setStatusFilter(statusParam as any);
    }

    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  /* URL aktualisieren */
  useEffect(() => {
    if (submissionId) return;

    const params = new URLSearchParams();
    if (statusFilter !== "pending") params.set("status", statusFilter);
    if (searchQuery) params.set("search", searchQuery);

    router.replace(`/admin/bestellungen?${params.toString()}`);
  }, [statusFilter, searchQuery, submissionId, router]);

  /* Prüfen: Ist Admin */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === "admin") {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [supabase]);

  /* Distributors laden */
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("distributors")
        .select("id, code, name, email, invest_rule")
        .eq("active", true)
        .order("name", { ascending: true });

      if (!error && data) setDistributors(data as Distributor[]);
    })();
  }, [supabase]);

  /* ---------------------------------------------------------
     Laden der Daten aus bestellung_dashboard View
  --------------------------------------------------------- */
  const fetchRows = useCallback(async () => {
    setLoading(true);

    try {
      const { data: viewData, error: viewError } = await supabase
        .from("bestellung_dashboard")
        .select("*")
        .order("created_at", { ascending: false });

      if (viewError) throw viewError;

      const itemIds = (viewData || [])
        .map((r) => r.item_id)
        .filter((id): id is number => typeof id === "number");

      if (itemIds.length === 0) {
        setRows(viewData || []);
        return;
      }

      const { data: extraItems, error: extraErr } = await supabase
        .from("submission_items")
        .select("item_id, lowest_price_brutto, lowest_price_netto, margin_street, invest, preis, lowest_price_source, lowest_price_source_custom")
        .in("item_id", itemIds);

      if (extraErr) console.warn("⚠️ Zusatzfelder konnten nicht geladen werden:", extraErr);

      const merged = (viewData || []).map((row) => {
        const extra = extraItems?.find((x) => x.item_id === row.item_id);
        return extra ? { ...row, ...extra } : row;
      });

      setRows(merged || []);
    } catch (err: any) {
      console.error("❌ Fehler beim Laden:", err?.message || err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /* Initial Load */
  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  /* Realtime Updates */
  useEffect(() => {
    const ch = supabase
      .channel("bestellung-dashboard-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bestellung_dashboard" },
        () => fetchRows()
      )
      .subscribe();

    return () => void supabase.removeChannel(ch);
  }, [supabase, fetchRows]);

  /* ---------------------------------------------------------
     Bestellungen gruppieren
  --------------------------------------------------------- */
  const bestellungen: Bestellung[] = useMemo(() => {
    const filteredByStatus =
      statusFilter === "alle"
        ? rows
        : rows.filter((r) => {
            const st = r.status as Bestellung["status"];
            return statusFilter === "pending"
              ? !st || st === "pending"
              : st === statusFilter;
          });

    const term = (searchQuery || "").toLowerCase().trim();

    const filtered =
      !term && !dealerIdParam
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
                .toLowerCase();

            return hay.includes(term);
          });

    const grouped: Record<number, Bestellung> = {};

    for (const row of filtered) {
      const sid = row.submission_id;

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
          distributor_names: row.distributor_names ?? null,
          distributor_codes: row.distributor_codes ?? null,
        };
      }

      grouped[sid].submission_items.push({
        item_id: row.item_id,
        submission_id: row.submission_id,
        product_id: row.product_id,
        menge: row.menge ?? undefined,

        lowest_price_brutto: row.lowest_price_brutto ?? null,
        lowest_price_netto: row.lowest_price_netto ?? null,
        lowest_price_source: row.lowest_price_source ?? null,
        lowest_price_source_custom: row.lowest_price_source_custom ?? null,
        margin_street: row.margin_street ?? null,

        preis: row.preis,
        calc_price_on_invoice: row.calc_price_on_invoice,
        invest: row.invest,   // <-- IMMER DB-Wert!
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

        distributor_id: row.distributor_id ?? null,
        distributor_name: row.distributor_name,
        distributor_code: row.distributor_code,
        distributor_email: row.distributor_email,
      });
    }

    return Object.values(grouped);
  }, [rows, statusFilter, searchQuery, dealerIdParam]);


/* ---------------------------------------------------------
    E-Mail Vorschau (fix für neues Notification-System)
  --------------------------------------------------------- */
async function openPreview(b: Bestellung) {
  try {
    const res = await sendOrderNotification({
      submissionId: b.submission_id,
      stage: "placed",
      preview: true,
    });

    // ❗ Fehlerfall
    if (!res.ok) {
      setPreviewHtml("<p>Keine Vorschau verfügbar.</p>");
      return;
    }

    // ❗ Nur im Preview-Modus existieren dealer/disti
    if (res.preview === true) {
      const dealerHtml =
        res.dealer?.html ?? "<p>Keine Händler-Mail gefunden.</p>";
      const distiHtml = res.disti?.html ?? null;

      const combined = `
        <h3 style="margin-bottom:8px;">Händler-Mail</h3>
        ${dealerHtml}

        ${
          distiHtml
            ? `
            <hr style="margin:20px 0; opacity:0.4;" />
            <h3 style="margin-bottom:8px;">Distributor/KAM-Mail</h3>
            ${distiHtml}
          `
            : ""
        }
      `;

      setPreviewHtml(combined);
      return;
    }

    // ❗ Wenn aus irgendeinem Grund preview=false zurückkam
    setPreviewHtml("<p>Keine Vorschau verfügbar.</p>");

  } catch (err) {
    console.error("❌ Fehler bei Vorschau:", err);
    setPreviewHtml("<p>Fehler beim Laden der Vorschau.</p>");
  }
}


  /* ---------------------------------------------------------
     Bestätigen + E-Mail
  --------------------------------------------------------- */
  async function handleMailConfirmAndApprove(b: Bestellung) {
    try {
      const { ok } = await sendOrderNotification({
        submissionId: b.submission_id,
        stage: "confirmed",
      });

      if (!ok) throw new Error("Fehler beim E-Mail-Versand");

      await calculateInvestForAllItems(
        b.submission_id,
        supabase,
        distributors
      );

      await updateStatus(b.submission_id, "approved");
      fetchRows();
    } catch (err) {
      console.error("❌ Fehler beim Bestätigen + Mail:", err);
    }
  }

  /* ---------------------------------------------------------
     Reset Bestellung
  --------------------------------------------------------- */
  async function handleReset(subId: number) {
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ status: "pending" })
        .eq("submission_id", subId);

      if (error) throw error;

      await fetchRows();
    } catch (err: any) {
      console.error("❌ Fehler beim Reset:", err.message || err);
    }
  }

  /* Summen */
  function calcTotals(b: Bestellung) {
    const items = b.submission_items || [];
    return {
      totalSum: items.reduce((s, it) => s + (parseNum(it.preis) || 0), 0),
      totalQty: items.reduce((s, it) => s + (parseNum(it.menge) || 0), 0),
    };
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */
  return (
    <>
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
          {/* HEADER */}
          {!submissionId && (
            <CardHeader className="pb-3 border-b space-y-4">
              {/* Händlerinfo */}
              <div>
                {dealerLoading ? (
                  <p className="text-sm text-gray-500">Lade Händler…</p>
                ) : dealer ? (
                  <div className="p-3 border rounded-xl bg-gray-50">
                    <p className="font-semibold text-sm text-gray-900">
                      {dealer.company_name || dealer.store_name}
                    </p>
                    <p className="text-xs text-gray-600">{dealer.email}</p>
                    <p className="text-xs text-gray-500">
                      Händler-Nr.: {dealer.dealer_login_nr ?? "–"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ansprechpartner: {dealer.contact_person ?? "–"}
                    </p>
                  </div>
                ) : dealerIdParam ? (
                  <p className="text-sm text-red-600">
                    Händler konnte nicht geladen werden (ID: {dealerIdParam})
                  </p>
                ) : null}
              </div>

              {/* Suche + Filter */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Suche Händler, Produkt, EAN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-72"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={statusFilter === "pending" ? "default" : "outline"}
                      onClick={() => setStatusFilter("pending")}
                      className="rounded-full text-xs"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Offen
                    </Button>

                    <Button
                      size="sm"
                      variant={statusFilter === "approved" ? "default" : "outline"}
                      onClick={() => setStatusFilter("approved")}
                      className="rounded-full text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Bestätigt
                    </Button>

                    <Button
                      size="sm"
                      variant={statusFilter === "rejected" ? "default" : "outline"}
                      onClick={() => setStatusFilter("rejected")}
                      className="rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Abgelehnt
                    </Button>

                    <Button
                      size="sm"
                      variant={statusFilter === "alle" ? "default" : "outline"}
                      onClick={() => setStatusFilter("alle")}
                      className="rounded-full text-xs"
                    >
                      <ListFilter className="w-3.5 h-3.5 mr-1" />
                      Alle
                    </Button>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchRows}
                  className="rounded-full text-xs"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Neu laden
                </Button>
              </div>
            </CardHeader>
          )}

          {/* CONTENT */}
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Lade Bestellungen…</p>
            ) : bestellungen.length === 0 ? (
              <p className="text-sm text-gray-500">Keine Bestellungen gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {bestellungen.map((b) => {
                    const items = b.submission_items;
                    const isLocked = b.status !== "pending";
                    const { totalSum, totalQty } = calcTotals(b);

                    return (
                      <motion.div
                        key={b.submission_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        onClick={() =>
                          router.push(
                            `/admin/bestellungen/${b.submission_id}?status=${statusFilter}&search=${encodeURIComponent(
                              searchQuery || ""
                            )}`
                          )
                        }
                        className="relative flex flex-col p-5 border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        {/* HEADER */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900">
                              #{b.submission_id} –{" "}
                              {b.dealer_name ?? "Unbekannter Händler"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {b.dealer_email ?? "-"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(b.created_at).toLocaleDateString("de-CH")}
                            </p>

                            <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-gray-600">
                              <div className="flex items-center gap-1">
                                <Hash className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  <span className="text-gray-500">Kd-Nr.:</span>{" "}
                                  {b.dealer_login_nr ?? "–"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  <span className="text-gray-500">
                                    Ansprechpartner:
                                  </span>{" "}
                                  {b.dealer_contact_person ?? "–"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span>
                                  <span className="text-gray-500">KAM:</span>{" "}
                                  {b.kam_name ?? b.kam ?? "–"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DISC + SUMMEN */}
                        <div className="absolute top-4 right-5 text-right">
                          <div>
                            {b.distributor_names?.length ? (
                              b.distributor_names.map((name, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-gray-50"
                                >
                                  {name}
                                  {b.distributor_codes?.[i] && (
                                    <span className="text-gray-400">
                                      {" "}
                                      ({b.distributor_codes[i]})
                                    </span>
                                  )}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-gray-400">–</span>
                            )}
                          </div>

                          <div className="mt-2">
                            <p className="text-base font-bold text-blue-600">
                              {totalSum.toFixed(2)} CHF
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {totalQty} Pos. –{" "}
                              {b.status === "approved"
                                ? "✅ Bestätigt"
                                : b.status === "rejected"
                                ? "❌ Abgelehnt"
                                : "⏳ Offen"}
                            </p>
                          </div>
                        </div>

                        {/* ITEMS */}
                        <div className="space-y-3">
                          {items.map((item) => (
                            <DashboardItem
                              key={item.item_id}
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
                              fetchRows={fetchRows}
                            />
                          ))}
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div className="flex flex-col items-center justify-center border-t pt-4 mt-5 gap-2">
                          {isLocked ? (
                            <div className="flex flex-wrap gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPreview(b)}
                                className="text-xs rounded-full border-blue-500 text-blue-600"
                              >
                                <Mail className="w-4 h-4 mr-1 text-blue-600" />
                                Vorschau
                              </Button>

                              {isAdmin && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReset(b.submission_id)}
                                  className="text-xs rounded-full border-orange-500 text-orange-600"
                                >
                                  <RotateCcw className="w-4 h-4 mr-1 text-orange-600" />
                                  Reset
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPreview(b)}
                                className="text-xs rounded-full border-blue-600 text-blue-700"
                              >
                                <Mail className="w-4 h-4 mr-1 text-blue-600" />
                                Vorschau
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMailConfirmAndApprove(b)}
                                className="text-xs rounded-full border-blue-600 text-blue-700"
                              >
                                <Mail className="w-4 h-4 mr-1 text-blue-600" />
                                Bestätigen + Mail
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  await calculateInvestForAllItems(
                                    b.submission_id,
                                    supabase,
                                    distributors
                                  );
                                  await updateStatus(b.submission_id, "approved");
                                  fetchRows();
                                }}
                                className="text-xs rounded-full border-green-600 text-green-700"
                              >
                                <Check className="w-4 h-4 mr-1 text-green-600" />
                                Bestätigen
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus(b.submission_id, "rejected")
                                }
                                className="text-xs rounded-full border-red-600 text-red-700"
                              >
                                <X className="w-4 h-4 mr-1 text-red-600" />
                                Ablehnen
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
